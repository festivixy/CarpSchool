#!/usr/bin/env python3
"""
Command Execution Proxy Server

A Flask server that accepts GET requests with commands in the URL path and returns their output.
This allows bypassing command restrictions by using HTTP requests instead.

Usage:
    python command_proxy.py

Then make requests like:
    curl http://localhost:3005/command/docker%20ps

Security Note: This should only be used in trusted development environments.
"""

import json
import subprocess
import sys
import urllib.parse
from flask import Flask, request, jsonify
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def _execute_command_impl(command):
    """Internal function to execute commands."""
    try:
        logger.info(f"Executing command: {command}")

        # Execute the command
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=30  # 30 second timeout
        )

        # Prepare response
        response = {
            'command': command,
            'returncode': result.returncode,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'success': result.returncode == 0
        }

        logger.info(f"Command completed with return code: {result.returncode}")
        return jsonify(response)

    except subprocess.TimeoutExpired:
        logger.error(f"Command timed out: {command}")
        return jsonify({
            'error': 'Command timed out (30 seconds)',
            'command': command
        }), 408

    except Exception as e:
        logger.error(f"Error executing command: {str(e)}")
        return jsonify({
            'error': f'Server error: {str(e)}',
            'command': command
        }), 500

@app.route('/command/<path:command>', methods=['GET'])
def execute_command_get(command):
    """Execute a command via GET with command in URL path."""
    try:
        # URL decode the command
        command = urllib.parse.unquote(command)
        return _execute_command_impl(command)

    except Exception as e:
        logger.error(f"Error with GET command: {str(e)}")
        return jsonify({
            'error': f'Server error: {str(e)}',
            'command': command
        }), 500

@app.route('/', methods=['POST'])
def execute_command_post():
    """Execute a command via POST (legacy support)."""
    try:
        # Get JSON data from request
        data = request.get_json()
        if not data or 'command' not in data:
            return jsonify({
                'error': 'Missing "command" field in JSON payload',
                'usage': 'POST with {"command": "your command here"} or GET /command/your%20command'
            }), 400

        command = data['command']
        return _execute_command_impl(command)

    except json.JSONDecodeError:
        return jsonify({
            'error': 'Invalid JSON payload',
            'usage': 'POST with {"command": "your command here"} or GET /command/your%20command'
        }), 400

    except Exception as e:
        logger.error(f"Error executing POST command: {str(e)}")
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'message': 'Command proxy server is running',
        'port': 3005
    })

@app.route('/', methods=['GET'])
def usage():
    """Show usage information."""
    return jsonify({
        'message': 'Command Execution Proxy Server',
        'usage': {
            'method_1': {
                'method': 'GET',
                'url': 'http://localhost:3005/command/your%20command%20here',
                'example': 'curl http://localhost:3005/command/docker%20ps'
            },
            'method_2': {
                'method': 'POST',
                'url': 'http://localhost:3005/',
                'headers': {'Content-Type': 'application/json'},
                'body': {'command': 'your command here'},
                'example': 'curl -X POST http://localhost:3005/ -H "Content-Type: application/json" -d \'{"command": "docker ps"}\''
            }
        }
    })

if __name__ == '__main__':
    print("Starting Command Execution Proxy Server on port 3005...")
    print("Security Warning: This server executes arbitrary commands. Use only in trusted environments.")
    print("Access: http://localhost:3005/")
    print("Health check: http://localhost:3005/health")
    print("Command example: http://localhost:3005/command/echo%20hello")
    print("Press Ctrl+C to stop")
    
    try:
        app.run(host='0.0.0.0', port=3005, debug=False)
    except KeyboardInterrupt:
        print("\nShutting down server...")
        sys.exit(0)
