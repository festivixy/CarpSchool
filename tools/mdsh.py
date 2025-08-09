#!/usr/bin/env python3
"""
Markdown Shell (mdsh) - Interactive Terminal with Markdown Rendering

A powerful markdown shell that runs interactive AI agents with full terminal emulation.
Processes ALL ANSI escape sequences and renders markdown beautifully using Rich.

Usage:
    mdsh [agent-command]

Examples:
    mdsh ai-agent
    mdsh "ollama run llama2"
    mdsh "gpt-cli --interactive"

Features:
    - Full ANSI escape sequence support (CSI, OSC, etc.)
    - Virtual terminal emulation with cursor tracking
    - Comprehensive cursor movement handling
    - All clearing operations (screen, line, selective)
    - Real-time progress bars and animations
    - Color code processing and stripping
    - Markdown rendering with Rich
    - Loading spinner and status update support
"""

import sys
import os
import subprocess
import argparse
import signal
import pty
import select
import termios
import tty
import re
import time
import shutil
import struct
import fcntl

try:
    from rich.console import Console
    from rich.markdown import Markdown
    from rich.panel import Panel
    from rich.text import Text
except ImportError:
    print("❌ Rich library not found. Install with: pip install rich")
    sys.exit(1)

class ANSIProcessor:
    """Comprehensive ANSI escape sequence processor"""

    def __init__(self):
        # Comprehensive ANSI pattern - covers all escape sequences
        self.ansi_pattern = re.compile(
            r'\x1b(?:'
            r'\[[0-?]*[ -/]*[@-~]|'  # CSI sequences (most common) - includes DEC private modes
            r'\][^\x07]*\x07|'       # OSC sequences
            r'[PX^_][^\x1b\x07]*\x07|'  # Other string sequences
            r'[78]|'                 # DEC save/restore cursor (ESC 7, ESC 8)
            r'[=>]|'                 # DEC keypad modes
            r'[DHKEM]|'              # Other DEC sequences
            r'[@-Z\\-_]|'            # Single character sequences
            r'\[[0-9;]*$'            # Incomplete sequences at end of text
            r')'
        )

        # Virtual terminal state
        self.cursor_x = 0
        self.cursor_y = 0
        self.lines = ['']
        self.saved_cursor = (0, 0)
        # Track content bounds to avoid excessive empty lines
        self.content_bounds = {'min_y': 0, 'max_y': 0}

    def reset_state(self):
        """Reset virtual terminal state"""
        self.cursor_x = 0
        self.cursor_y = 0
        self.lines = ['']
        self.saved_cursor = (0, 0)
        self.content_bounds = {'min_y': 0, 'max_y': 0}

    def strip_ansi(self, text):
        """Remove all ANSI escape sequences from text"""
        return self.ansi_pattern.sub('', text)

    def process_escape_sequence(self, sequence):
        """Process all types of escape sequences"""
        if sequence == '\x1b7':  # DEC Save Cursor
            self.saved_cursor = (self.cursor_x, self.cursor_y)
            return
        elif sequence == '\x1b8':  # DEC Restore Cursor
            self.cursor_x, self.cursor_y = self.saved_cursor
            self._ensure_line_exists(self.cursor_y)
            return
        elif sequence.startswith('\x1b['):
            self.process_csi_sequence(sequence)
        # Other escape sequences are ignored

    def process_csi_sequence(self, sequence):
        """Process CSI (Control Sequence Introducer) sequences"""
        if not sequence.startswith('\x1b['):
            return

        # Extract parameters and command
        content = sequence[2:]  # Remove \x1b[
        if not content:
            return

        command = content[-1]
        params_str = content[:-1]

        # Parse parameters
        if params_str:
            try:
                # Handle empty parameters as default (1 for most commands, 0 for some)
                params = []
                for p in params_str.split(';'):
                    if p == '':
                        params.append(1 if command in 'ABCDEFGH' else 0)
                    else:
                        params.append(int(p))
            except ValueError:
                params = []
        else:
            params = []

        # Handle different CSI commands
        if command == 'A':  # Cursor Up
            n = params[0] if params else 1
            self.cursor_y = max(0, self.cursor_y - n)
            # Ensure the line exists after moving up
            self._ensure_line_exists(self.cursor_y)
        elif command == 'B':  # Cursor Down
            n = params[0] if params else 1
            self.cursor_y += n
            self._ensure_line_exists(self.cursor_y)
        elif command == 'C':  # Cursor Forward
            n = params[0] if params else 1
            self.cursor_x += n
            self._ensure_line_exists(self.cursor_y)
        elif command == 'D':  # Cursor Backward
            n = params[0] if params else 1
            self.cursor_x = max(0, self.cursor_x - n)
        elif command == 'E':  # Cursor Next Line
            n = params[0] if params else 1
            self.cursor_y += n
            self.cursor_x = 0
            self._ensure_line_exists(self.cursor_y)
        elif command == 'F':  # Cursor Previous Line
            n = params[0] if params else 1
            self.cursor_y = max(0, self.cursor_y - n)
            self.cursor_x = 0
        elif command == 'G':  # Cursor Horizontal Absolute
            n = params[0] if params else 1
            self.cursor_x = max(0, n - 1)
        elif command == 'H' or command == 'f':  # Cursor Position
            row = params[0] if params else 1
            col = params[1] if len(params) > 1 else 1
            # Handle zero parameters as 1 (ANSI standard)
            row = max(1, row) if row > 0 else 1
            col = max(1, col) if col > 0 else 1

            # Convert to 0-based coordinates
            self.cursor_y = row - 1
            self.cursor_x = col - 1
            self._ensure_line_exists(self.cursor_y)
        elif command == 'J':  # Erase Display
            n = params[0] if params else 0
            if n == 0:  # Clear from cursor to end of screen
                self._clear_from_cursor_to_end()
            elif n == 1:  # Clear from beginning of screen to cursor
                self._clear_from_beginning_to_cursor()
            elif n == 2:  # Clear entire screen
                self.lines = ['']
                self.cursor_x = 0
                self.cursor_y = 0
        elif command == 'K':  # Erase Line
            n = params[0] if params else 0
            if n == 0:  # Clear from cursor to end of line
                self._clear_line_from_cursor_to_end()
            elif n == 1:  # Clear from beginning of line to cursor
                self._clear_line_from_beginning_to_cursor()
            elif n == 2:  # Clear entire line
                self._clear_entire_line()
        elif command == 's':  # Save Cursor Position
            self.saved_cursor = (self.cursor_x, self.cursor_y)
        elif command == 'u':  # Restore Cursor Position
            self.cursor_x, self.cursor_y = self.saved_cursor
            # Ensure cursor position is valid
            self.cursor_x = max(0, self.cursor_x)
            self.cursor_y = max(0, self.cursor_y)
            self._ensure_line_exists(self.cursor_y)
        elif command == 'h' or command == 'l':  # Set/Reset Mode (DEC private modes)
            # Handle DEC private mode sequences like ?25l (hide cursor) and ?25h (show cursor)
            # These should just be ignored/stripped
            pass

    def _ensure_line_exists(self, line_num):
        """Ensure the lines list has enough entries"""
        while len(self.lines) <= line_num:
            self.lines.append('')

    def _clear_from_cursor_to_end(self):
        """Clear from cursor position to end of screen"""
        if self.cursor_y < len(self.lines):
            # Clear rest of current line
            line = self.lines[self.cursor_y]
            self.lines[self.cursor_y] = line[:self.cursor_x]
            # Clear all lines below
            self.lines = self.lines[:self.cursor_y + 1]

    def _clear_from_beginning_to_cursor(self):
        """Clear from beginning of screen to cursor"""
        # Clear lines above cursor
        for i in range(self.cursor_y):
            if i < len(self.lines):
                self.lines[i] = ''
        # Clear beginning of current line
        if self.cursor_y < len(self.lines):
            line = self.lines[self.cursor_y]
            self.lines[self.cursor_y] = ' ' * self.cursor_x + line[self.cursor_x:]

    def _clear_line_from_cursor_to_end(self):
        """Clear from cursor to end of current line"""
        if self.cursor_y < len(self.lines):
            line = self.lines[self.cursor_y]
            self.lines[self.cursor_y] = line[:self.cursor_x]

    def _clear_line_from_beginning_to_cursor(self):
        """Clear from beginning of line to cursor"""
        if self.cursor_y < len(self.lines):
            line = self.lines[self.cursor_y]
            # Clear from beginning up to and including cursor position
            remaining_line = line[self.cursor_x + 1:] if self.cursor_x + 1 < len(line) else ''
            self.lines[self.cursor_y] = ' ' * self.cursor_x + remaining_line

    def _clear_entire_line(self):
        """Clear entire current line"""
        if self.cursor_y < len(self.lines):
            self.lines[self.cursor_y] = ''
            # Reset cursor to beginning of cleared line
            self.cursor_x = 0

    def write_text(self, text):
        """Write text at current cursor position"""
        self._ensure_line_exists(self.cursor_y)

        i = 0
        while i < len(text):
            char = text[i]

            if char == '\r':
                # Handle carriage return - check for \r\n sequence
                if i + 1 < len(text) and text[i + 1] == '\n':
                    # \r\n sequence - treat as new line
                    self.cursor_y += 1
                    self.cursor_x = 0
                    self._ensure_line_exists(self.cursor_y)
                    i += 2  # Skip both \r and \n
                    continue
                else:
                    # Standalone \r - go to beginning of line (overwrite mode)
                    self.cursor_x = 0
                    i += 1
                    continue
            elif char == '\n':
                self.cursor_y += 1
                self.cursor_x = 0
                self._ensure_line_exists(self.cursor_y)
            elif char == '\t':
                # Tab to next 8-character boundary
                self.cursor_x = ((self.cursor_x // 8) + 1) * 8
                self._ensure_line_exists(self.cursor_y)
            elif char == '\b':  # Backspace
                self.cursor_x = max(0, self.cursor_x - 1)
            elif ord(char) >= 32:  # Printable character
                line = self.lines[self.cursor_y]
                # Extend line if cursor is beyond end
                if self.cursor_x >= len(line):
                    line += ' ' * (self.cursor_x - len(line)) + char
                else:
                    # Overwrite character at cursor position
                    line = line[:self.cursor_x] + char + line[self.cursor_x + 1:]
                self.lines[self.cursor_y] = line
                self.cursor_x += 1

                # Track content bounds
                self.content_bounds['min_y'] = min(self.content_bounds['min_y'], self.cursor_y)
                self.content_bounds['max_y'] = max(self.content_bounds['max_y'], self.cursor_y)

            i += 1

    def process_ansi_sequences(self, text):
        """Process all ANSI sequences and return clean final text"""
        self.reset_state()

        i = 0
        while i < len(text):
            # Look for ANSI escape sequence
            match = self.ansi_pattern.search(text, i)

            if match:
                # Write any text before the escape sequence
                if match.start() > i:
                    self.write_text(text[i:match.start()])

                # Process the escape sequence
                sequence = match.group(0)
                self.process_escape_sequence(sequence)

                i = match.end()
            else:
                # No more escape sequences, write remaining text
                self.write_text(text[i:])
                break

        # Extract final terminal state - focus on lines with actual content
        if self.lines:
            # Remove completely empty lines from the end
            while self.lines and not self.lines[-1].strip():
                self.lines.pop()

            # Remove completely empty lines from the beginning
            while self.lines and not self.lines[0].strip():
                self.lines.pop(0)

            if self.lines:
                result = '\n'.join(self.lines)
            else:
                result = ''
        else:
            result = ''

        # Preserve trailing newline if original had one
        stripped_text = self.strip_ansi(text)
        if stripped_text.endswith('\n') and result and not result.endswith('\n'):
            result += '\n'

        return result


class MarkdownShell:
    def __init__(self, agent_command):
        self.agent_command = agent_command
        self.console = Console()
        self.buffer = ""
        self.ansi_processor = ANSIProcessor()

    def get_terminal_size(self):
        """Get current terminal size"""
        try:
            # Use shutil to get terminal size
            size = shutil.get_terminal_size()
            rows, cols = size.lines, size.columns

            # Ensure reasonable values
            if rows <= 0 or cols <= 0:
                raise ValueError("Invalid terminal size")

            return (rows, cols)
        except Exception as e:
            # Debug: uncomment to see size detection issues
            # print(f"\nTerminal size detection error: {e}, using default", file=sys.stderr)
            # Default fallback
            return (24, 80)

    def set_terminal_size(self, fd):
        """Set the terminal size for the pty"""
        try:
            # Get current terminal size
            rows, cols = self.get_terminal_size()

            # Validate size values
            if rows <= 0 or cols <= 0:
                rows, cols = 24, 80  # Fallback to default

            # Set the terminal size using ioctl
            winsize = struct.pack('HHHH', rows, cols, 0, 0)
            fcntl.ioctl(fd, termios.TIOCSWINSZ, winsize)

        except Exception as e:
            # Debug: uncomment to see terminal size issues
            # print(f"\nTerminal size error: {e}", file=sys.stderr)
            pass

    def is_markdown_content(self, text):
        """Simple heuristic to detect if text contains markdown"""
        # Strip ANSI codes before checking for markdown
        clean_text = self.ansi_processor.strip_ansi(text)

        markdown_indicators = [
            r'^#{1,6}\s',      # Headers
            r'```',            # Code blocks
            r'\*\*.*\*\*',     # Bold
            r'\*.*\*',         # Italic (but not bullet points)
            r'^\s*[-*+]\s',    # Lists
            r'^\s*\d+\.\s',    # Numbered lists
            r'\[.*\]\(.*\)',   # Links
            r'`[^`]+`',        # Inline code
            r'^\s*>',          # Blockquotes
            r'\|.*\|',         # Tables
        ]

        for pattern in markdown_indicators:
            if re.search(pattern, clean_text, re.MULTILINE):
                return True
        return False

    def render_text(self, text):
        """Process all ANSI sequences and render text as markdown or plain text"""
        if not text:
            return

        # Process all ANSI escape sequences comprehensively
        # Use a fresh processor to avoid state accumulation
        temp_processor = ANSIProcessor()
        processed_text = temp_processor.process_ansi_sequences(text)

        # Skip empty or whitespace-only content after processing
        if not processed_text.strip():
            return

        if self.is_markdown_content(processed_text):
            try:
                # Use processed text for markdown rendering
                markdown = Markdown(processed_text.strip())
                self.console.print(markdown)
            except Exception:
                # Fallback to plain text
                self.console.print(processed_text, end='')
        else:
            # For non-markdown, use processed text
            self.console.print(processed_text, end='')

    def run(self):
        """Run the AI agent in a simple wrapper"""
        try:
            # Show startup message
            self.console.print(f"[bold]>[/] {self.agent_command}")

            # Show terminal size info
            rows, cols = self.get_terminal_size()
            self.console.print(f"[dim]Terminal size: {cols}x{rows} (cols×rows)[/]")

            # Start the AI agent with pty for interactive shell behavior
            master, slave = pty.openpty()

            # Set the terminal size for the pty
            self.set_terminal_size(slave)

            process = subprocess.Popen(
                ["zsh", "-c", self.agent_command],
                stdin=slave,
                stdout=slave,
                stderr=slave,
                preexec_fn=os.setsid
            )

            os.close(slave)

            # Give the process a moment to start, then sync terminal size
            time.sleep(0.1)
            self.set_terminal_size(master)

            # Set up terminal
            old_settings = termios.tcgetattr(sys.stdin)
            tty.setraw(sys.stdin.fileno())

            # Handle terminal resize
            def handle_sigwinch(signum, frame):
                try:
                    # Update the pty size when terminal is resized
                    self.set_terminal_size(master)
                    # Also send SIGWINCH to the child process group
                    try:
                        os.killpg(os.getpgid(process.pid), signal.SIGWINCH)
                    except (OSError, ProcessLookupError):
                        # Process might have exited, ignore
                        pass
                except Exception as e:
                    # Debug: uncomment to see resize issues
                    # print(f"\nResize error: {e}", file=sys.stderr)
                    pass

            # Set up signal handler for window size changes
            old_sigwinch = signal.signal(signal.SIGWINCH, handle_sigwinch)

            try:
                while True:
                    # Check if process is still running
                    if process.poll() is not None:
                        break

                    # Wait for input from either stdin or the AI agent
                    ready, _, _ = select.select([sys.stdin, master], [], [], 0.1)

                    if sys.stdin in ready:
                        # User input - forward to AI agent
                        try:
                            char = sys.stdin.read(1)
                            if char == '\x03':  # Ctrl+C
                                break
                            os.write(master, char.encode())
                        except (EOFError, KeyboardInterrupt):
                            break

                    if master in ready:
                        # AI agent output - capture and render
                        try:
                            raw_data = os.read(master, 1024)
                            if raw_data:
                                # Handle UTF-8 properly with buffering for partial sequences
                                try:
                                    data = raw_data.decode('utf-8')
                                except UnicodeDecodeError:
                                    # Partial UTF-8 sequence - buffer it
                                    if not hasattr(self, '_utf8_buffer'):
                                        self._utf8_buffer = b''
                                    self._utf8_buffer += raw_data
                                    try:
                                        data = self._utf8_buffer.decode('utf-8')
                                        self._utf8_buffer = b''
                                    except UnicodeDecodeError:
                                        # Still incomplete, continue buffering
                                        continue

                                if data:
                                    self.buffer += data

                                # Check for real-time updates (carriage returns or cursor movements)
                                ansi_sequences = self.ansi_processor.ansi_pattern.findall(self.buffer)
                                has_cursor_movement = any(
                                    seq for seq in ansi_sequences
                                    if re.match(r'\x1b\[[0-9]*[ABCDEFGH]', seq) or 'K' in seq
                                )

                                if ('\r' in self.buffer or has_cursor_movement) and '\n' not in self.buffer:
                                    # This is likely a real-time update - process immediately
                                    # Use a fresh processor instance to avoid state accumulation
                                    temp_processor = ANSIProcessor()
                                    processed = temp_processor.process_ansi_sequences(self.buffer)
                                    if processed.strip():
                                        # Clear current line and show update
                                        print('\r' + ' ' * 120 + '\r', end='', flush=True)
                                        print(processed.strip(), end='', flush=True)
                                    continue

                                # Process complete lines
                                while '\n' in self.buffer:
                                    line, self.buffer = self.buffer.split('\n', 1)

                                    # Clear any previous real-time output
                                    if hasattr(self, '_has_realtime_output'):
                                        print()  # Move to new line
                                        delattr(self, '_has_realtime_output')

                                    if line.strip() or self.ansi_processor.ansi_pattern.search(line):
                                        self.render_text(line + '\n')
                                    else:
                                        print()  # Empty line

                                # Mark if we have real-time output
                                if self.buffer and ('\r' in self.buffer or has_cursor_movement):
                                    self._has_realtime_output = True

                        except OSError:
                            break

            finally:
                # Restore terminal settings
                termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)

                # Restore signal handler
                try:
                    signal.signal(signal.SIGWINCH, old_sigwinch)
                except:
                    pass

                # Cleanup
                try:
                    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                    process.wait(timeout=3)
                except:
                    try:
                        process.kill()
                    except:
                        pass

                os.close(master)

        except FileNotFoundError:
            self.console.print(f"[red]❌ Command not found: {self.agent_command}[/]")
            sys.exit(1)
        except KeyboardInterrupt:
            self.console.print("\n[yellow]👋 Goodbye![/]")
        except Exception as e:
            self.console.print(f"[red]❌ Error: {e}[/]")
            sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="Markdown Shell (mdsh) - Interactive Terminal with Markdown Rendering",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  mdsh ai-agent
  mdsh "ollama run llama2"
  mdsh "gpt-cli --interactive"
  mdsh myai  # Uses zsh alias
        """
    )

    parser.add_argument(
        'agent',
        nargs='?',
        default='zsh',
        help='Command to run (default: zsh)'
    )

    args = parser.parse_args()

    # Create and run the wrapper
    wrapper = MarkdownShell(args.agent)
    wrapper.run()

if __name__ == "__main__":
    main()
