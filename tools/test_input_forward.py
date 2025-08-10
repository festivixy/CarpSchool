#!/usr/bin/env python3
"""
Simple test of input forwarding to new terminal window
"""

import sys
import subprocess
import time

def open_new_terminal():
    """Open a new terminal window and get its ID."""
    try:
        result = subprocess.run([
            "osascript", "-e",
            'tell application "Terminal" to do script ""'
        ], capture_output=True, text=True, check=True)

        terminal_id = result.stdout.strip()
        print(f"Opened terminal: {terminal_id}")
        time.sleep(1)
        return terminal_id
    except subprocess.CalledProcessError as e:
        print(f"Error opening terminal: {e}")
        return None

def send_to_terminal(terminal_id, command):
    """Send a command to the terminal window."""
    try:
        # Proper escaping for AppleScript - escape quotes and backslashes
        escaped_command = command.replace("\\", "\\\\").replace('"', '\\"')
        subprocess.run([
            "osascript", "-e",
            f'tell application "Terminal" to do script "{escaped_command}" in {terminal_id}'
        ], check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error sending command: {e}")
        return False

def main():
    print("=== Input Forwarding Test ===")
    print("Opening new terminal window...")

    terminal_id = open_new_terminal()
    if not terminal_id:
        print("Failed to open terminal")
        return

    print("Type commands to forward to the new terminal (type 'quit' to exit):")

    while True:
        try:
            command = input(">>> ")
            if command.lower() in ['quit', 'exit']:
                break

            if send_to_terminal(terminal_id, command):
                print(f"Sent: {command}")
            else:
                print(f"Failed to send: {command}")

        except KeyboardInterrupt:
            break

    print("\nExiting...")

if __name__ == "__main__":
    main()
