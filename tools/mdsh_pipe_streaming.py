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

class ANSIProcessor:
    """Process ANSI escape sequences and maintain terminal state."""
    
    def __init__(self):
        self.reset_state()
    
    def reset_state(self):
        """Reset terminal state to initial values."""
        self.lines = ['']
        self.cursor_x = 0
        self.cursor_y = 0
        self.saved_cursor = (0, 0)
    
    def _ensure_line_exists(self, line_num):
        """Ensure the specified line exists in our buffer."""
        while len(self.lines) <= line_num:
            self.lines.append('')
    
    def _write_at_cursor(self, text):
        """Write text at the current cursor position."""
        self._ensure_line_exists(self.cursor_y)
        line = self.lines[self.cursor_y]
        
        # Extend line if cursor is beyond current length
        if self.cursor_x > len(line):
            line += ' ' * (self.cursor_x - len(line))
        
        # Insert text at cursor position
        new_line = line[:self.cursor_x] + text + line[self.cursor_x + len(text):]
        self.lines[self.cursor_y] = new_line
        self.cursor_x += len(text)
    
    def process_ansi_sequences(self, text):
        """Process ANSI escape sequences and return clean text."""
        self.reset_state()
        
        i = 0
        while i < len(text):
            if text[i] == '\x1b' and i + 1 < len(text) and text[i + 1] == '[':
                # Found ANSI escape sequence
                j = i + 2
                while j < len(text) and text[j] not in 'ABCDEFGHJKSTfmnhlsu':
                    j += 1
                
                if j < len(text):
                    command = text[j]
                    params_str = text[i + 2:j]
                    params = [int(x) if x.isdigit() else 0 for x in params_str.split(';') if x]
                    self._handle_ansi_command(command, params)
                    i = j + 1
                else:
                    # Incomplete escape sequence, treat as regular text
                    self._write_at_cursor(text[i])
                    i += 1
            elif text[i] == '\r':
                # Carriage return - move to beginning of line
                self.cursor_x = 0
                i += 1
            elif text[i] == '\n':
                # Newline - move to next line
                self.cursor_y += 1
                self.cursor_x = 0
                self._ensure_line_exists(self.cursor_y)
                i += 1
            else:
                # Regular character
                self._write_at_cursor(text[i])
                i += 1
        
        # Return the processed text
        result_lines = []
        for line in self.lines:
            if line.rstrip():  # Only include non-empty lines
                result_lines.append(line.rstrip())
        
        result = '\n'.join(result_lines)
        
        # Preserve original newline structure
        if text.endswith('\n') and result and not result.endswith('\n'):
            result += '\n'
        
        return result
    
    def _handle_ansi_command(self, command, params):
        """Handle specific ANSI commands."""
        if command == 'H' or command == 'f':  # Cursor Position
            self.cursor_y = max(0, (params[0] if params else 1) - 1)
            self.cursor_x = max(0, (params[1] if len(params) > 1 else 1) - 1)
            self._ensure_line_exists(self.cursor_y)
        elif command == 'A':  # Cursor Up
            self.cursor_y = max(0, self.cursor_y - (params[0] if params else 1))
        elif command == 'B':  # Cursor Down
            self.cursor_y += params[0] if params else 1
            self._ensure_line_exists(self.cursor_y)
        elif command == 'C':  # Cursor Forward
            self.cursor_x += params[0] if params else 1
        elif command == 'D':  # Cursor Backward
            self.cursor_x = max(0, self.cursor_x - (params[0] if params else 1))
        elif command == 'J':  # Erase Display
            n = params[0] if params else 0
            if n == 0:  # Clear from cursor to end of screen
                self.lines[self.cursor_y] = self.lines[self.cursor_y][:self.cursor_x]
                self.lines = self.lines[:self.cursor_y + 1]
            elif n == 1:  # Clear from beginning of screen to cursor
                self.lines[self.cursor_y] = ' ' * self.cursor_x + self.lines[self.cursor_y][self.cursor_x:]
                for i in range(self.cursor_y):
                    self.lines[i] = ''
            elif n == 2:  # Clear entire screen
                self.lines = ['']
                self.cursor_x = 0
                self.cursor_y = 0
        elif command == 'K':  # Erase Line
            n = params[0] if params else 0
            if n == 0:  # Clear from cursor to end of line
                self.lines[self.cursor_y] = self.lines[self.cursor_y][:self.cursor_x]
            elif n == 1:  # Clear from beginning of line to cursor
                self.lines[self.cursor_y] = ' ' * self.cursor_x + self.lines[self.cursor_y][self.cursor_x:]
            elif n == 2:  # Clear entire line
                self.lines[self.cursor_y] = ''
        elif command == 's':  # Save Cursor Position
            self.saved_cursor = (self.cursor_x, self.cursor_y)
        elif command == 'u':  # Restore Cursor Position
            self.cursor_x, self.cursor_y = self.saved_cursor
            self._ensure_line_exists(self.cursor_y)
    
    def strip_ansi(self, text):
        """Remove ANSI escape sequences from text."""
        ansi_escape = re.compile(r'\x1b\[[0-9;]*[ABCDEFGHJKSTfmnhlsu]')
        return ansi_escape.sub('', text)

class PipeStreamingShell:
    """Pipe-based streaming shell without PTY cursor issues."""
    
    def __init__(self, agent_command="zsh"):
        self.agent_command = agent_command
        self.console = Console()
        self.output_buffer = ""
        self.running = True
    
    def get_terminal_size(self):
        """Get current terminal size."""
        try:
            rows, cols = os.popen('stty size', 'r').read().split()
            return int(rows), int(cols)
        except:
            return 24, 80
    
    def process_output(self, data):
        """Process output data and display it cleanly."""
        if not data:
            return
        
        # Use ANSIProcessor to clean the output
        processor = ANSIProcessor()
        clean_data = processor.process_ansi_sequences(data)
        
        if clean_data.strip():
            # Display clean data directly without cursor issues
            print(clean_data.rstrip())
            sys.stdout.flush()
    
    def stdin_reader(self, process, input_queue):
        """Thread to read stdin and forward to process."""
        try:
            while self.running and process.poll() is None:
                # Read from stdin (this will block until input)
                try:
                    line = sys.stdin.readline()
                    if line:
                        # Send to process stdin
                        process.stdin.write(line.encode())
                        process.stdin.flush()
                except (EOFError, KeyboardInterrupt):
                    break
        except Exception as e:
            print(f"stdin_reader error: {e}")
    
    def run_interactive(self):
        """Run interactive session with pipe streaming."""
        try:
            self.console.print(f"[bold]>[/] {self.agent_command} [green](pipe streaming - no PTY)[/]")
            
            rows, cols = self.get_terminal_size()
            self.console.print(f"[dim]Terminal size: {cols}x{rows} (cols×rows)[/]")
            
            # Start process with pipes
            process = subprocess.Popen(
                ["zsh", "-i"],  # Interactive zsh
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,  # Merge stderr into stdout
                text=False,  # Use bytes for real-time processing
                bufsize=0   # Unbuffered
            )
            
            # Start stdin reader thread
            input_queue = queue.Queue()
            stdin_thread = threading.Thread(
                target=self.stdin_reader, 
                args=(process, input_queue)
            )
            stdin_thread.daemon = True
            stdin_thread.start()
            
            # Main loop - read output in real-time
            while process.poll() is None:
                # Check if process has output ready
                if sys.platform != 'win32':
                    # Use select on Unix systems
                    ready, _, _ = select.select([process.stdout], [], [], 0.1)
                    if ready:
                        try:
                            # Read available data
                            data = process.stdout.read(1024)
                            if data:
                                # Decode and process
                                text = data.decode('utf-8', errors='replace')
                                self.process_output(text)
                        except Exception as e:
                            print(f"Output read error: {e}")
                            break
                else:
                    # Windows fallback
                    try:
                        data = process.stdout.read(1024)
                        if data:
                            text = data.decode('utf-8', errors='replace')
                            self.process_output(text)
                    except Exception as e:
                        print(f"Output read error: {e}")
                        break
            
            # Process finished
            self.running = False
            
            # Read any remaining output
            try:
                remaining = process.stdout.read()
                if remaining:
                    text = remaining.decode('utf-8', errors='replace')
                    self.process_output(text)
            except:
                pass
            
            # Wait for process to complete
            process.wait()
            
        except KeyboardInterrupt:
            self.console.print("\n[yellow]Interrupted by user[/]")
            self.running = False
            try:
                process.terminate()
            except:
                pass
        except Exception as e:
            self.console.print(f"[red]❌ Error: {e}[/]")
            sys.exit(1)
    
    def run_command(self, command):
        """Run a specific command (like test mode but with real-time output)."""
        try:
            self.console.print(f"[bold]>[/] {command} [green](pipe streaming)[/]")
            
            rows, cols = self.get_terminal_size()
            self.console.print(f"[dim]Terminal size: {cols}x{rows} (cols×rows)[/]")
            
            # Start process
            process = subprocess.Popen(
                ["zsh", "-c", command],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=False,
                bufsize=0
            )
            
            # Read output in real-time
            while True:
                if sys.platform != 'win32':
                    ready, _, _ = select.select([process.stdout], [], [], 0.1)
                    if ready:
                        data = process.stdout.read(1024)
                        if not data:
                            break
                        text = data.decode('utf-8', errors='replace')
                        self.process_output(text)
                    elif process.poll() is not None:
                        break
                else:
                    data = process.stdout.read(1024)
                    if not data:
                        break
                    text = data.decode('utf-8', errors='replace')
                    self.process_output(text)
            
            # Read any remaining output
            remaining = process.stdout.read()
            if remaining:
                text = remaining.decode('utf-8', errors='replace')
                self.process_output(text)
            
            process.wait()
            
            if process.returncode != 0:
                self.console.print(f"[yellow]Exit code: {process.returncode}[/]")
                
        except Exception as e:
            self.console.print(f"[red]❌ Error: {e}[/]")

def main():
    parser = argparse.ArgumentParser(
        description="Pipe Streaming Shell - Real-time interaction without PTY",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
This version uses subprocess with pipes instead of PTY to avoid cursor issues.

Examples:
  ./mdsh_pipe_streaming.py                           # Interactive zsh  
  ./mdsh_pipe_streaming.py "echo 'test1' && echo 'test2'"  # Run command
        """
    )
    
    parser.add_argument(
        'command',
        nargs='?',
        help='Command to run (if not provided, runs interactive zsh)'
    )
    
    args = parser.parse_args()
    
    wrapper = PipeStreamingShell()
    
    if args.command:
        wrapper.run_command(args.command)
    else:
        wrapper.run_interactive()

if __name__ == "__main__":
    main()
