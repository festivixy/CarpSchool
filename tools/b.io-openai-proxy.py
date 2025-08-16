#!/usr/bin/env python3
"""
OpenAI to Builder.io Chat Proxy
Translates OpenAI ChatCompletions requests to Builder.io completion API for chat-only usage

This proxy allows using OpenAI-compatible chat apps/clients with Builder.io's Claude backend.
You can use ChatGPT desktop apps, API clients, etc. to chat with Claude via Builder.io.
No file operations or tools - pure chat interface.

Usage:
    python b.io-openai-proxy.py --port 8080 --builder-url https://api.builder.io --builder-key YOUR_KEY

Then configure your OpenAI app to use: http://localhost:8080/v1
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


class OpenAIBuilderIOProxy:
    def __init__(self, builder_base_url: str, builder_api_key: str, builder_user_id: str = "proxy-user"):
        self.builder_base_url = builder_base_url.rstrip('/')
        self.builder_api_key = builder_api_key
        self.builder_user_id = builder_user_id
        self.session: Optional[ClientSession] = None

    async def start(self):
        """Initialize the HTTP client session"""
        timeout = ClientTimeout(total=300)  # 5 minute timeout
        self.session = ClientSession(timeout=timeout)

    async def stop(self):
        """Clean up the HTTP client session"""
        if self.session:
            await self.session.close()

    def extract_user_prompt(self, openai_request: Dict[str, Any]) -> str:
        """Extract user prompt from OpenAI messages"""
        messages = openai_request.get('messages', [])

        # Find the last user message
        for message in reversed(messages):
            if message.get('role') == 'user':
                return message.get('content', '')

        return 'Hello Claude'

    def build_builder_request(self, openai_request: Dict[str, Any]) -> Dict[str, Any]:
        """Convert OpenAI ChatCompletions request to Builder.io format (disguised as CLI)"""

        user_prompt = self.extract_user_prompt(openai_request)

        # Build Builder.io request format (disguised as official CLI)
        builder_request = {
            "position": "cli",
            "eventName": "cli code",
            "maxPages": 2,
            "autoContinue": 1,
            "codeGenMode": "quality-v3",
            "userContext": {
                "client": "@builder.io/dev-tools",
                "clientVersion": "1.7.28",
                "nodeVersion": "v20.0.0",
                "frameworks": ["react"],
                "systemPlatform": "darwin",
                "systemEOL": "\n",
                "systemArch": "arm64",
                "inGitRepo": True,
                "systemShell": "/bin/zsh"
            },
            "files": [],
            "mcpServers": False,
            "attachments": [],
            "customInstructions": [],
            "sessionId": f"session-{int(time.time())}",
            "userPrompt": user_prompt,
            "pingEvents": True,
            "workingDirectory": "/app",
            "toolResults": [],
            "role": "user",
            "user": {
                "source": "builder.io",
                "userId": self.builder_user_id,
                "role": "user"
            },
            "enabledTools": [],
            "searchResponse": None
        }

        logger.info(f"Built Builder.io CLI request for: {user_prompt[:100]}...")
        return builder_request

    async def call_builder_api(self, builder_request: Dict[str, Any]) -> aiohttp.ClientResponse:
        """Make request to Builder.io API (disguised as CLI)"""
        headers = {
            'Authorization': f'Bearer {self.builder_api_key}',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) builder-cli/1.7.28',
            'Sec-Ch-Ua-Platform': '"macOS"'
        }

        # Build URL with query parameters like the original
        params = {
            'apiKey': self.builder_api_key,
            'userId': self.builder_user_id
        }

        url = f"{self.builder_base_url}/codegen/completion"

        logger.info(f"Calling Builder.io API: {url}")
        response = await self.session.post(url, json=builder_request, headers=headers, params=params)

        if response.status != 200:
            error_text = await response.text()
            logger.error(f"Builder.io API error {response.status}: {error_text}")
            raise Exception(f"Builder.io API error: {response.status} - {error_text}")

        return response

    def format_openai_response_line(self, content: str = "", finish_reason: str = None) -> str:
        """Format a line in OpenAI streaming response format"""
        chunk = {
            "id": f"chatcmpl-proxy-{int(time.time())}",
            "object": "chat.completion.chunk",
            "created": int(time.time()),
            "model": "claude-3.5-sonnet",
            "choices": [
                {
                    "index": 0,
                    "delta": {},
                    "finish_reason": finish_reason
                }
            ]
        }

        if content:
            chunk["choices"][0]["delta"]["content"] = content

        return f"data: {json.dumps(chunk)}\n\n"

    async def stream_builder_to_openai(self, builder_response: aiohttp.ClientResponse,
                                     response: StreamResponse):
        """Stream Builder.io response in OpenAI format"""

        # Process Builder.io JSONL stream
        async for line in builder_response.content:
            line_text = line.decode('utf-8').strip()
            if not line_text:
                continue

            try:
                # Parse Builder.io JSONL response
                chunk = json.loads(line_text)
                chunk_type = chunk.get('type', '')

                if chunk_type == 'delta':
                    content = chunk.get('content', '')
                    if content:
                        # Send as OpenAI delta
                        await response.write(self.format_openai_response_line(content).encode())

                elif chunk_type == 'done':
                    # Send completion indicator
                    await response.write(self.format_openai_response_line(finish_reason="stop").encode())
                    break

                # Ignore other types (user, thinking, ping, continue)

            except json.JSONDecodeError as e:
                logger.warning(f"Failed to parse Builder.io chunk: {line_text[:100]}... Error: {e}")
                continue

        # Send final [DONE]
        await response.write("data: [DONE]\n\n".encode())

    async def handle_chat_completions(self, request: Request) -> StreamResponse:
        """Handle OpenAI ChatCompletions requests"""
        try:
            # Parse OpenAI request
            openai_request = await request.json()
            user_prompt = self.extract_user_prompt(openai_request)
            logger.info(f"Received OpenAI request: {user_prompt[:100]}...")

            # Convert to Builder.io format
            builder_request = self.build_builder_request(openai_request)

            # Set up streaming response
            response = StreamResponse(
                status=200,
                reason='OK',
                headers={
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Transfer-Encoding': 'chunked'
                }
            )

            await response.prepare(request)

            # Call Builder.io and stream response
            builder_response = await self.call_builder_api(builder_request)
            await self.stream_builder_to_openai(builder_response, response)

            logger.info("Successfully completed request")
            return response

        except Exception as e:
            logger.error(f"Error handling request: {e}")
            return web.json_response(
                {"error": {"message": str(e), "type": "proxy_error"}},
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


async def create_app(builder_base_url: str, builder_api_key: str, builder_user_id: str) -> web.Application:
    """Create the web application"""
    proxy = OpenAIBuilderIOProxy(builder_base_url, builder_api_key, builder_user_id)
    await proxy.start()

    app = web.Application()

    # OpenAI-compatible routes
    app.router.add_post('/v1/chat/completions', proxy.handle_chat_completions)
    app.router.add_options('/v1/chat/completions', proxy.handle_options)

    # Model listing (for compatibility)
    async def list_models(request):
        return web.json_response({
            "object": "list",
            "data": [
                {
                    "id": "claude-3.5-sonnet",
                    "object": "model",
                    "created": int(time.time()),
                    "owned_by": "builder.io"
                }
            ]
        })

    app.router.add_get('/v1/models', list_models)
    app.router.add_options('/v1/models', proxy.handle_options)

    # Health check
    async def health_check(request):
        return web.json_response({
            "status": "ok",
            "proxy": "openai chat -> builder.io",
            "mode": "chat-only"
        })

    app.router.add_get('/health', health_check)
    app.router.add_get('/', health_check)

    # Cleanup on shutdown
    async def cleanup(app):
        await proxy.stop()

    app.on_cleanup.append(cleanup)

    return app


def main():
    parser = argparse.ArgumentParser(description='OpenAI to Builder.io API Proxy')
    parser.add_argument('--port', type=int, default=8080, help='Port to run proxy on')
    parser.add_argument('--host', default='localhost', help='Host to bind to')
    parser.add_argument('--builder-url', default='https://api.builder.io',
                       help='Builder.io API base URL')
    parser.add_argument('--builder-key', required=True, help='Builder.io API key')
    parser.add_argument('--builder-user', default='proxy-user', help='Builder.io user ID')

    args = parser.parse_args()

    logger.info(f"Starting OpenAI-compatible Builder.io interface")
    logger.info(f"Server: http://{args.host}:{args.port}/v1")
    logger.info(f"Builder.io URL: {args.builder_url}")
    logger.info(f"User ID: {args.builder_user}")
    logger.info(f"Mode: CLI-compatible requests")

    async def init():
        app = await create_app(args.builder_url, args.builder_key, args.builder_user)
        return app

    web.run_app(init(), host=args.host, port=args.port)


if __name__ == '__main__':
    main()
