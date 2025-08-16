#!/usr/bin/env python3
"""
Builder.io to OpenAI API Proxy
Translates Builder.io codegen completion requests to OpenAI ChatCompletions API

This proxy allows using OpenAI models (GPT-4, Claude via OpenAI-compatible APIs)
as a backend for Builder.io code generation requests.

Usage:
    python b.io-openai-proxy.py --port 8080 --openai-url https://api.openai.com/v1 --openai-key sk-...
    
Then configure Builder.io to use: http://localhost:8080
"""

import json
import logging
import argparse
import asyncio
import time
from typing import Dict, Any, Optional, List
from aiohttp import web, ClientSession, ClientTimeout
from aiohttp.web import Request, StreamResponse
import aiohttp

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class BuilderIOOpenAIProxy:
    def __init__(self, openai_base_url: str, openai_api_key: str, model: str = "gpt-4"):
        self.openai_base_url = openai_base_url.rstrip('/')
        self.openai_api_key = openai_api_key
        self.model = model
        self.session: Optional[ClientSession] = None
        
    async def start(self):
        """Initialize the HTTP client session"""
        timeout = ClientTimeout(total=300)  # 5 minute timeout
        self.session = ClientSession(timeout=timeout)
        
    async def stop(self):
        """Clean up the HTTP client session"""
        if self.session:
            await self.session.close()

    def build_system_prompt(self, builder_request: Dict[str, Any]) -> str:
        """Build system prompt from Builder.io request context"""
        
        # Extract context
        user_context = builder_request.get('userContext', {})
        frameworks = user_context.get('frameworks', [])
        working_dir = builder_request.get('workingDirectory', '')
        
        # Build system prompt
        system_prompt = """You are VCP, a software development assistant built by Builder.io, specialized in frontend software development and integration.

You have the skills of a senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.
You always write reusable and idiomatic code.
You are diligent and tireless!
You NEVER leave comments describing code without implementing it!
Do not add comments in the code such as "{/* Rest of the sections... */}" and {/* The complete implementation would include all sections from the design */}" in place of writing the full code.
You always COMPLETELY IMPLEMENT the needed code!"""

        # Add context about the project
        if frameworks:
            system_prompt += f"\n\nProject uses: {', '.join(frameworks)}"
            
        if working_dir:
            system_prompt += f"\nWorking directory: {working_dir}"
            
        # Add file context if available
        files = builder_request.get('files', [])
        if files:
            system_prompt += "\n\nProject context includes these files:"
            for file_info in files[:10]:  # Limit to first 10 files
                file_path = file_info.get('filePath', '')
                importance = file_info.get('importance', 0)
                if importance >= 4:  # Only mention important files
                    system_prompt += f"\n- {file_path}"
                    
        system_prompt += "\n\nGenerate production-ready code that follows best practices and integrates well with the existing codebase."
        
        return system_prompt
        
    def build_user_prompt(self, builder_request: Dict[str, Any]) -> str:
        """Extract user prompt from Builder.io request"""
        return builder_request.get('userPrompt', 'Please help with code generation.')

    def build_openai_request(self, builder_request: Dict[str, Any]) -> Dict[str, Any]:
        """Convert Builder.io request to OpenAI ChatCompletions format"""
        
        system_prompt = self.build_system_prompt(builder_request)
        user_prompt = self.build_user_prompt(builder_request)
        
        # Build OpenAI request
        openai_request = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 4000,
            "stream": True  # Enable streaming to match Builder.io format
        }
        
        logger.info(f"Built OpenAI request for user prompt: {user_prompt[:100]}...")
        return openai_request

    async def call_openai_api(self, openai_request: Dict[str, Any]) -> aiohttp.ClientResponse:
        """Make request to OpenAI API"""
        headers = {
            'Authorization': f'Bearer {self.openai_api_key}',
            'Content-Type': 'application/json'
        }
        
        url = f"{self.openai_base_url}/chat/completions"
        
        logger.info(f"Calling OpenAI API: {url}")
        response = await self.session.post(url, json=openai_request, headers=headers)
        
        if response.status != 200:
            error_text = await response.text()
            logger.error(f"OpenAI API error {response.status}: {error_text}")
            raise Exception(f"OpenAI API error: {response.status} - {error_text}")
            
        return response

    def format_builder_response_line(self, line_type: str, content: str = "", **kwargs) -> str:
        """Format a line in Builder.io JSONL response format"""
        data = {"type": line_type, **kwargs}
        if content:
            data["content"] = content
        return json.dumps(data) + "\n"

    async def stream_openai_to_builder(self, openai_response: aiohttp.ClientResponse, 
                                     builder_request: Dict[str, Any], 
                                     response: StreamResponse):
        """Stream OpenAI response in Builder.io format"""
        
        # Send initial metadata
        user_info = builder_request.get('user', {})
        session_id = builder_request.get('sessionId', 'proxy-session')
        
        # Send user message info
        await response.write(self.format_builder_response_line(
            "user",
            id=f"proxy-{int(time.time())}",
            displayPrompt=builder_request.get('userPrompt', ''),
            user=user_info,
            role="user",
            compacting=False
        ).encode())
        
        # Send thinking indicator
        await response.write(self.format_builder_response_line(
            "thinking", 
            content="",
            synthetic=True
        ).encode())
        
        # Process OpenAI stream
        full_content = ""
        async for line in openai_response.content:
            line_text = line.decode('utf-8').strip()
            if not line_text or not line_text.startswith('data: '):
                continue
                
            if line_text == 'data: [DONE]':
                break
                
            try:
                # Parse OpenAI streaming response
                json_str = line_text[6:]  # Remove 'data: ' prefix
                chunk = json.loads(json_str)
                
                if 'choices' in chunk and len(chunk['choices']) > 0:
                    delta = chunk['choices'][0].get('delta', {})
                    content = delta.get('content', '')
                    
                    if content:
                        full_content += content
                        # Send as Builder.io delta
                        await response.write(self.format_builder_response_line(
                            "delta",
                            content=content
                        ).encode())
                        
                    # Send periodic pings
                    if len(full_content) % 200 == 0:  # Every ~200 chars
                        await response.write(self.format_builder_response_line("ping").encode())
                        
            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse OpenAI chunk: {line_text[:100]}... Error: {e}")
                continue
        
        # Send completion metadata
        completion_id = f"cgen-proxy-{int(time.time())}"
        await response.write(self.format_builder_response_line(
            "done",
            id=completion_id,
            stopReason="end_turn",
            actions=[{
                "type": "text",
                "id": "0", 
                "content": full_content
            }],
            actionTitle=f"completionId: {completion_id}",
            unixTime=int(time.time() * 1000),
            content=full_content,
            suggestions=[],
            creditsUsed=0.1,
            messageIndex=1,
            nextUrl=f"cgen://completion/{completion_id}",
            sessionUsage=0.1,
            needsPagination=False,
            autoContinue=False
        ).encode())
        
        # Send final continue message
        await response.write(self.format_builder_response_line(
            "continue",
            id=completion_id,
            nextUrl=f"cgen://completion/{completion_id}",
            autoContinue=False
        ).encode())

    async def handle_completion_request(self, request: Request) -> StreamResponse:
        """Handle Builder.io codegen completion requests"""
        try:
            # Parse Builder.io request
            builder_request = await request.json()
            logger.info(f"Received Builder.io request: {builder_request.get('userPrompt', '')[:100]}...")
            
            # Convert to OpenAI format
            openai_request = self.build_openai_request(builder_request)
            
            # Set up streaming response
            response = StreamResponse(
                status=200,
                reason='OK',
                headers={
                    'Content-Type': 'application/jsonl; charset=utf-8',
                    'X-Powered-By': 'Builder.io-OpenAI Proxy',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization, sentry-trace, baggage',
                    'Transfer-Encoding': 'chunked'
                }
            )
            
            await response.prepare(request)
            
            # Call OpenAI and stream response
            openai_response = await self.call_openai_api(openai_request)
            await self.stream_openai_to_builder(openai_response, builder_request, response)
            
            logger.info("Successfully completed request")
            return response
            
        except Exception as e:
            logger.error(f"Error handling request: {e}")
            return web.json_response(
                {"error": str(e)}, 
                status=500,
                headers={'Access-Control-Allow-Origin': '*'}
            )

    async def handle_options(self, request: Request) -> web.Response:
        """Handle CORS preflight requests"""
        return web.Response(
            headers={
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, sentry-trace, baggage',
                'Access-Control-Max-Age': '86400'
            }
        )


async def create_app(openai_base_url: str, openai_api_key: str, model: str) -> web.Application:
    """Create the web application"""
    proxy = BuilderIOOpenAIProxy(openai_base_url, openai_api_key, model)
    await proxy.start()
    
    app = web.Application()
    
    # Routes
    app.router.add_post('/codegen/completion', proxy.handle_completion_request)
    app.router.add_options('/codegen/completion', proxy.handle_options)
    
    # Health check
    async def health_check(request):
        return web.json_response({"status": "ok", "proxy": "builder.io -> openai"})
    
    app.router.add_get('/health', health_check)
    app.router.add_get('/', health_check)
    
    # Cleanup on shutdown
    async def cleanup(app):
        await proxy.stop()
    
    app.on_cleanup.append(cleanup)
    
    return app


def main():
    parser = argparse.ArgumentParser(description='Builder.io to OpenAI API Proxy')
    parser.add_argument('--port', type=int, default=8080, help='Port to run proxy on')
    parser.add_argument('--host', default='localhost', help='Host to bind to')
    parser.add_argument('--openai-url', default='https://api.openai.com/v1', 
                       help='OpenAI API base URL')
    parser.add_argument('--openai-key', required=True, help='OpenAI API key')
    parser.add_argument('--model', default='gpt-4', help='OpenAI model to use')
    
    args = parser.parse_args()
    
    logger.info(f"Starting Builder.io -> OpenAI proxy")
    logger.info(f"Server: http://{args.host}:{args.port}")
    logger.info(f"OpenAI URL: {args.openai_url}")
    logger.info(f"Model: {args.model}")
    
    async def init():
        app = await create_app(args.openai_url, args.openai_key, args.model)
        return app
    
    web.run_app(init(), host=args.host, port=args.port)


if __name__ == '__main__':
    main()
