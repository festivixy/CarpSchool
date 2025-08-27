#!/usr/bin/env python3
"""
Helper script to run commands via the command proxy server.

Usage:
    python run_command.py "docker ps"
    python run_command.py "git status"
"""

import sys
import json
import urllib.request
import urllib.parse

def run_command(command, proxy_url="http://localhost:3005"):
    """Run a command via the proxy server and return the result."""
    try:
        # Prepare the request
        data = json.dumps({"command": command}).encode('utf-8')
        
        req = urllib.request.Request(
            proxy_url,
            data=data,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        
        # Make the request
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            
        return result
        
    except urllib.error.URLError as e:
        return {
            'error': f'Connection error: {e}',
            'suggestion': 'Make sure the command proxy server is running: python ../tools/command_proxy.py'
        }
    except Exception as e:
        return {'error': f'Request error: {e}'}

def main():
    if len(sys.argv) < 2:
        print("Usage: python run_command.py \"command to run\"")
        print("Example: python run_command.py \"docker ps\"")
        sys.exit(1)
    
    command = sys.argv[1]
    result = run_command(command)
    
    if 'error' in result:
        print(f"Error: {result['error']}")
        if 'suggestion' in result:
            print(f"Suggestion: {result['suggestion']}")
        sys.exit(1)
    
    print(f"Command: {result['command']}")
    print(f"Return code: {result['returncode']}")
    
    if result['stdout']:
        print("STDOUT:")
        print(result['stdout'])
    
    if result['stderr']:
        print("STDERR:")
        print(result['stderr'])
    
    sys.exit(result['returncode'])

if __name__ == '__main__':
    main()
