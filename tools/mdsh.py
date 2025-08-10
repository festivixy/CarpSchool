#!/usr/bin/env python3
"""
Markdown Shell (mdsh) - A clean implementation without progressive indentation patches
"""

import sys
import os
import pty
import select
import termios
import tty
import signal
import subprocess
import argparse
import re
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

class MarkdownShell:
    """Clean markdown shell implementation."""
    
    def __init__(self, agent_command="zsh"):
        self.agent_command = agent_command
        self.console = Console()
        self.buffer = ''
    
    def get_terminal_size(self):
        """Get current terminal size."""
        try:
            rows, cols = os.popen('stty size', 'r').read().split()
            return int(rows), int(cols)
        except:
            return 24, 80
    
    def render_text(self, text):
        """Render text with markdown support."""
        if not text.strip():
            return
        
        # Process ANSI sequences
        processor = ANSIProcessor()
        processed_text = processor.process_ansi_sequences(text)
        
        if not processed_text.strip():
            return
        
        # Simple output - just print the processed text
        self.console.print(processed_text.rstrip())
    
    def is_markdown_content(self, text):
        """Check if text appears to be markdown content."""
        markdown_indicators = ['#', '*', '`', '[', ']', '(', ')', '_', '**']
        return any(indicator in text for indicator in markdown_indicators)
    
    def run_test_mode(self):
        """Test mode using subprocess instead of pty - this actually works."""
        try:
            self.console.print(f"[bold]>[/] {self.agent_command} [yellow](test mode)[/]")
            
            rows, cols = self.get_terminal_size()
            self.console.print(f"[dim]Terminal size: {cols}x{rows} (cols×rows)[/]")
            
            result = subprocess.run(
                ["zsh", "-c", self.agent_command],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            if result.stdout:
                lines = result.stdout.split('\n')
                for line in lines:
                    if line or line == '':
                        self.render_text(line + '\n')
            
            if result.stderr:
                self.console.print(f"[red]stderr: {result.stderr}[/]")
            
            if result.returncode != 0:
                self.console.print(f"[yellow]Exit code: {result.returncode}[/]")
                
        except subprocess.TimeoutExpired:
            self.console.print("[red]❌ Command timed out[/]")
        except Exception as e:
            self.console.print(f"[red]❌ Test mode error: {e}[/]")
    
    def run(self):
        """Run in pty mode - has progressive indentation issues."""
        try:
            self.console.print(f"[bold]>[/] {self.agent_command}")
            
            rows, cols = self.get_terminal_size()
            self.console.print(f"[dim]Terminal size: {cols}x{rows} (cols×rows)[/]")
            
            # Create pty
            master, slave = pty.openpty()
            
            # Start the process
            process = subprocess.Popen(
                ["zsh", "-c", self.agent_command],
                stdin=slave,
                stdout=slave,
                stderr=slave,
                start_new_session=True
            )
            
            os.close(slave)
            
            # Setup terminal
            old_settings = termios.tcgetattr(sys.stdin)
            tty.setraw(sys.stdin)
            
            # Handle window resize
            def handle_winch(signum, frame):
                rows, cols = self.get_terminal_size()
                os.write(master, f'\x1b[8;{rows};{cols}t'.encode())
            
            old_sigwinch = signal.signal(signal.SIGWINCH, handle_winch)
            
            try:
                while True:
                    if process.poll() is not None:
                        break
                    
                    ready, _, _ = select.select([sys.stdin, master], [], [], 0.1)
                    
                    if master in ready:
                        try:
                            data = os.read(master, 1024).decode('utf-8', errors='replace')
                            if data:
                                self.buffer += data
                                
                                # Process complete lines
                                while '\n' in self.buffer:
                                    line, self.buffer = self.buffer.split('\n', 1)
                                    self.render_text(line + '\n')
                        except OSError:
                            break
                    
                    if sys.stdin in ready:
                        try:
                            char = sys.stdin.read(1)
                            if char:
                                os.write(master, char.encode())
                        except OSError:
                            break
            
            finally:
                termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)
                signal.signal(signal.SIGWINCH, old_sigwinch)
                
                try:
                    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                    process.wait(timeout=3)
                except:
                    pass
                
                try:
                    os.close(master)
                except:
                    pass
        
        except Exception as e:
            self.console.print(f"[red]❌ Error: {e}[/]")
            sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="Markdown Shell (mdsh) - Clean implementation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  mdsh --test "echo hello"  # Use test mode (works)
  mdsh "echo hello"         # Use pty mode (has progressive indentation bug)
        """
    )
    
    parser.add_argument(
        'agent',
        nargs='?',
        default='zsh',
        help='Command to run (default: zsh)'
    )
    
    parser.add_argument(
        '--test',
        action='store_true',
        help='Test mode: use subprocess instead of pty (recommended - works correctly)'
    )
    
    args = parser.parse_args()
    
    wrapper = MarkdownShell(args.agent)
    if args.test:
        wrapper.run_test_mode()
    else:
        wrapper.run()

if __name__ == "__main__":
    main()
