#!/usr/bin/env python3
"""
Markdown Shell (mdsh) - Pipe-based streaming version without PTY
Uses subprocess with pipes and select() for real-time interaction without PTY issues.
"""

import sys
import os
import select
import subprocess
import argparse
import re
import threading
import queue
import time
from rich.console import Console
from rich.markdown import Markdown

class OutputHandler:
    """Handle real-time output from subprocess with pipes."""
    
    def __init__(self):
        self.console = Console()
        self.output_queue = queue.Queue()
        self.stop_event = threading.Event()
    
    def _read_stream(self, stream, stream_name):
        """Read from a stream and put data in queue."""
        try:
            while not self.stop_event.is_set():
                # Use select to check if data is available
                ready, _, _ = select.select([stream], [], [], 0.1)
                if ready:
                    data = stream.read(1024)
                    if data:
                        self.output_queue.put((stream_name, data))
                    else:
                        break
        except Exception as e:
            self.output_queue.put(('error', str(e)))
    
    def start_output_threads(self, process):
        """Start threads to read stdout and stderr."""
        stdout_thread = threading.Thread(
            target=self._read_stream, 
            args=(process.stdout, 'stdout')
        )
        stderr_thread = threading.Thread(
            target=self._read_stream, 
            args=(process.stderr, 'stderr')
        )
        
        stdout_thread.daemon = True
        stderr_thread.daemon = True
        
        stdout_thread.start()
        stderr_thread.start()
        
        return stdout_thread, stderr_thread
    
    def process_output(self):
        """Process queued output in real-time."""
        while True:
            try:
                stream_name, data = self.output_queue.get(timeout=0.1)
                if stream_name == 'stdout':
                    # Write directly to stdout without any cursor manipulation
                    sys.stdout.write(data.decode('utf-8', errors='replace'))
                    sys.stdout.flush()
                elif stream_name == 'stderr':
                    # Write stderr data
                    sys.stderr.write(data.decode('utf-8', errors='replace'))
                    sys.stderr.flush()
                elif stream_name == 'error':
                    print(f"Stream error: {data}", file=sys.stderr)
                    
            except queue.Empty:
                continue
            except KeyboardInterrupt:
                break
    
    def stop(self):
        """Stop all output processing."""
        self.stop_event.set()

class MarkdownShell:
    """Main shell class using pipe-based subprocess."""
    
    def __init__(self, test_mode=False):
        self.console = Console()
        self.test_mode = test_mode
        self.output_handler = OutputHandler()
    
    def get_terminal_size(self):
        """Get terminal dimensions."""
        try:
            size = os.get_terminal_size()
            return size.columns, size.lines
        except OSError:
            return 80, 24  # Default size
    
    def print_header(self, command):
        """Print command header."""
        method = "pipe streaming" if not self.test_mode else "test mode"
        print(f"> {command} ({method})")
        cols, rows = self.get_terminal_size()
        print(f"Terminal size: {cols}x{rows} (cols×rows)")
    
    def run_command(self, command):
        """Run a command using subprocess with pipes."""
        self.print_header(command)
        
        if self.test_mode:
            # Test mode: simple subprocess call
            try:
                result = subprocess.run(
                    command,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=30
                )
                print(result.stdout, end='')
                if result.stderr:
                    print(result.stderr, end='', file=sys.stderr)
                return result.returncode
            except subprocess.TimeoutExpired:
                print("Command timed out", file=sys.stderr)
                return 124
            except Exception as e:
                print(f"Error: {e}", file=sys.stderr)
                return 1
        else:
            # Pipe streaming mode
            try:
                process = subprocess.Popen(
                    command,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    universal_newlines=False
                )
                
                # Start output handling threads
                stdout_thread, stderr_thread = self.output_handler.start_output_threads(process)
                
                # Process output in real-time
                output_thread = threading.Thread(target=self.output_handler.process_output)
                output_thread.daemon = True
                output_thread.start()
                
                # Wait for process to complete
                return_code = process.wait()
                
                # Give threads time to finish processing
                time.sleep(0.2)
                
                # Stop output processing
                self.output_handler.stop()
                
                return return_code
                
            except KeyboardInterrupt:
                print("\nInterrupted by user", file=sys.stderr)
                return 130
            except Exception as e:
                print(f"Error running command: {e}", file=sys.stderr)
                return 1
    
    def run_interactive(self):
        """Run interactive shell mode."""
        self.print_header("zsh (pipe streaming - no PTY)")
        
        print("Warning: Interactive mode with pipe streaming has limitations.")
        print("Use command mode for best results.")
        print("Type 'exit' to quit.\n")
        
        try:
            while True:
                try:
                    user_input = input("$ ")
                    if user_input.strip().lower() in ['exit', 'quit']:
                        break
                    if user_input.strip():
                        self.run_command(user_input)
                except EOFError:
                    break
                except KeyboardInterrupt:
                    print("\nUse 'exit' to quit.")
                    continue
        except Exception as e:
            print(f"Interactive mode error: {e}", file=sys.stderr)

def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description='Pipe Streaming Shell - Real-time interaction without PTY'
    )
    parser.add_argument(
        'command', 
        nargs='?', 
        help='Command to run (if not provided, runs interactive zsh)'
    )
    parser.add_argument(
        '--test', 
        action='store_true',
        help='Use test mode (simple subprocess, no streaming)'
    )
    
    parser.epilog = """
This version uses subprocess with pipes instead of PTY to avoid cursor issues.

Examples:
  ./mdsh.py                           # Interactive mode
  ./mdsh.py "echo 'test1' && echo 'test2'"  # Run command
  ./mdsh.py --test "echo 'test'"      # Test mode
    """
    
    args = parser.parse_args()
    
    try:
        shell = MarkdownShell(test_mode=args.test)
        
        if args.command:
            # Run single command
            return_code = shell.run_command(args.command)
            sys.exit(return_code)
        else:
            # Interactive mode
            shell.run_interactive()
            
    except KeyboardInterrupt:
        print("\nExiting...")
        sys.exit(130)
    except Exception as e:
        print(f"Fatal error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()
