#!/usr/bin/env python3
"""
Simple command sender for mdsh_live.py
Sends commands to the most recent Terminal window/tab
"""

import sys
import subprocess
import re

def get_latest_terminal():
    """Get the most recent terminal window/tab."""
    try:
        result = subprocess.run([
            "osascript", "-e",
            'tell application "Terminal" to get name of front window'
        ], capture_output=True, text=True, check=True)
        
        # Get the front window ID
        result2 = subprocess.run([
            "osascript", "-e", 
            'tell application "Terminal" to get id of front window'
        ], capture_output=True, text=True, check=True)
        
        window_id = result2.stdout.strip()
        return f"tab 1 of window id {window_id}"
        
    except subprocess.CalledProcessError:
        return None

def send_command(command, terminal_id=None):
    """Send a command to the terminal."""
    if not terminal_id:
        terminal_id = get_latest_terminal()
    
    if not terminal_id:
        print("Error: Could not find terminal window")
        return False
    
    try:
        # Proper escaping for AppleScript
        escaped_command = command.replace("\\", "\\\\").replace('"', '\\"')
        
        subprocess.run([
            "osascript", "-e",
            f'tell application "Terminal" to do script "{escaped_command}" in {terminal_id}'
        ], check=True)
        print(f"Sent: {command}")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Error sending command: {e}")
        return False

def main():
    if len(sys.argv) < 2:
        print("Usage: ./send_command.py 'command to send'")
        print("Example: ./send_command.py 'ls -la'")
        return
    
    command = " ".join(sys.argv[1:])
    send_command(command)

if __name__ == "__main__":
    main()
