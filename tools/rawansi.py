#!/usr/bin/env python3
"""
Raw ANSI Analyzer - Capture and analyze real-world ANSI sequences

Executes commands and captures their raw ANSI output, then shows both the
raw sequences and how our ANSIProcessor interprets them. Perfect for
debugging ANSI processing issues and understanding terminal output.

Usage:
    rawansi "ls --color=always"
    rawansi "git status --porcelain=v1 --color=always"
    rawansi "ps aux | head -5"
    rawansi --hex "tput cup 5 10; echo 'test'; tput cup 0 0"
    rawansi --compare "echo -e '\\033[31mRed\\033[0m'"

Features:
    - Captures raw ANSI sequences using pty for authentic terminal output
    - Shows processed output using ANSIProcessor
    - Optional hex dump for detailed sequence analysis
    - Side-by-side comparison of raw vs processed
    - Handles both simple and complex interactive commands
    - Perfect for creating new test cases
"""

import sys
import os
import subprocess
import argparse
import pty
import select
import time
import signal
import termios
import tty
import re
from datetime import datetime

# Add current directory to path to import ANSIProcessor
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from mdsh import ANSIProcessor
except ImportError:
    print("❌ Could not import ANSIProcessor from mdsh.py")
    print("Make sure mdsh.py is in the same directory")
    sys.exit(1)

class RawANSICapture:
    """Captures raw ANSI output from commands"""

    def __init__(self, timeout=5, enable_logging=True):
        self.timeout = timeout
        self.processor = ANSIProcessor()
        self.enable_logging = enable_logging
        self.log_dir = os.path.join(os.path.dirname(__file__), 'tmp', 'rawansi')
        self.log_buffer = []  # Buffer to capture all output for logging

    def capture_command_output(self, command):
        """Execute command and capture raw output with ANSI sequences"""
        try:
            # Use pty to ensure ANSI sequences are preserved
            master, slave = pty.openpty()

            # Start the command
            process = subprocess.Popen(
                ["bash", "-c", command],
                stdin=slave,
                stdout=slave,
                stderr=slave,
                preexec_fn=os.setsid
            )

            os.close(slave)

            # Capture output
            output = b""
            start_time = time.time()

            while True:
                # Check if process finished
                if process.poll() is not None:
                    break

                # Check for timeout
                if time.time() - start_time > self.timeout:
                    print(f"⚠️  Command timed out after {self.timeout}s")
                    break

                # Check for available data
                ready, _, _ = select.select([master], [], [], 0.1)

                if master in ready:
                    try:
                        data = os.read(master, 1024)
                        if data:
                            output += data
                        else:
                            break
                    except OSError:
                        break

            # Cleanup
            try:
                if process.poll() is None:
                    os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                    process.wait(timeout=1)
            except:
                pass

            os.close(master)

            # Decode output
            try:
                decoded_output = output.decode('utf-8', errors='replace')
            except:
                decoded_output = output.decode('latin1', errors='replace')

            return decoded_output, process.returncode if process.poll() is not None else -1

        except Exception as e:
            return f"Error executing command: {e}", 1

    def format_hex_dump(self, text, width=16):
        """Create a hex dump of the text"""
        if not text:
            return "No data"

        lines = []
        data = text.encode('utf-8', errors='replace')

        for i in range(0, len(data), width):
            # Get chunk of bytes
            chunk = data[i:i + width]

            # Format offset
            offset = f"{i:08x}:"

            # Format hex bytes
            hex_part = " ".join(f"{b:02x}" for b in chunk)
            hex_part = hex_part.ljust(width * 3 - 1)

            # Format ASCII representation
            ascii_part = ""
            for b in chunk:
                if 32 <= b <= 126:
                    ascii_part += chr(b)
                else:
                    ascii_part += "."

            lines.append(f"{offset} {hex_part} |{ascii_part}|")

        return "\n".join(lines)

    def find_ansi_sequences(self, text):
        """Find and list all ANSI sequences in the text"""
        pattern = re.compile(
            r'\x1b(?:'
            r'\[[0-?]*[ -/]*[@-~]|'  # CSI sequences
            r'\][^\x07]*\x07|'       # OSC sequences
            r'[PX^_][^\x1b\x07]*\x07|'  # Other string sequences
            r'[@-Z\\-_]'             # Single character sequences
            r')'
        )

        sequences = []
        for match in pattern.finditer(text):
            seq = match.group(0)
            start = match.start()
            end = match.end()

            # Describe the sequence
            description = self.describe_sequence(seq)

            sequences.append({
                'sequence': seq,
                'start': start,
                'end': end,
                'description': description,
                'repr': repr(seq)
            })

        return sequences

    def describe_sequence(self, seq):
        """Provide human-readable description of ANSI sequence"""
        if not seq.startswith('\x1b'):
            return "Not an ANSI sequence"

        if seq.startswith('\x1b['):
            # CSI sequence
            content = seq[2:]
            if not content:
                return "Incomplete CSI sequence"

            command = content[-1]
            params = content[:-1]

            descriptions = {
                'A': f'Cursor Up {params or "1"} lines',
                'B': f'Cursor Down {params or "1"} lines',
                'C': f'Cursor Forward {params or "1"} columns',
                'D': f'Cursor Back {params or "1"} columns',
                'E': f'Cursor Next Line {params or "1"}',
                'F': f'Cursor Previous Line {params or "1"}',
                'G': f'Cursor Horizontal Absolute column {params or "1"}',
                'H': f'Cursor Position row {params.split(";")[0] if ";" in params else params or "1"}, col {params.split(";")[1] if ";" in params and len(params.split(";")) > 1 else "1"}',
                'f': f'Cursor Position row {params.split(";")[0] if ";" in params else params or "1"}, col {params.split(";")[1] if ";" in params and len(params.split(";")) > 1 else "1"}',
                'J': f'Erase Display {params or "0"} (0=cursor to end, 1=start to cursor, 2=entire screen)',
                'K': f'Erase Line {params or "0"} (0=cursor to end, 1=start to cursor, 2=entire line)',
                's': 'Save Cursor Position',
                'u': 'Restore Cursor Position',
                'm': f'Set Graphics Mode {params}' if params else 'Reset Graphics Mode',
                'h': f'Set Mode {params}',
                'l': f'Reset Mode {params}',
            }

            return descriptions.get(command, f'CSI {command} with params "{params}"')

        elif seq.startswith('\x1b]'):
            bell_char = '\x07'
            return f'OSC (Operating System Command): {seq[2:-1] if seq.endswith(bell_char) else seq[2:]}'

        else:
            return f'Other ANSI sequence: {seq[1:]}'

    def get_real_terminal_output(self, raw_output):
        """Show what a terminal would display - the final visual result"""
        try:
            # Create a more accurate terminal simulation
            # Use script command to capture terminal output with proper ANSI handling
            import tempfile

            # Create a script that outputs the raw sequences
            with tempfile.NamedTemporaryFile(mode='w', suffix='.sh', delete=False) as f:
                f.write('#!/bin/bash\n')
                f.write('cat << \'EOF\'\n')
                f.write(raw_output)
                f.write('\nEOF\n')
                script_file = f.name

            try:
                # Make script executable
                os.chmod(script_file, 0o755)

                # Run script and capture output with terminal processing
                result = subprocess.run(
                    ['bash', script_file],
                    capture_output=True,
                    text=False,  # Keep as bytes to preserve encoding
                    timeout=5
                )

                if result.returncode == 0:
                    # Decode the terminal output
                    terminal_output = result.stdout.decode('utf-8', errors='replace')

                    # Use our ANSIProcessor to show what the terminal displays
                    # This simulates the terminal's final visual output
                    final_display = self.processor.process_ansi_sequences(terminal_output)
                    return final_display
                else:
                    error_msg = result.stderr.decode('utf-8', errors='replace')
                    return f"Script error: {error_msg}"

            finally:
                try:
                    os.unlink(script_file)
                except:
                    pass

        except Exception as e:
            return f"Error creating terminal simulation: {e}"

    def show_visual_output(self, raw_output, processed_output, log_func=print):
        """Show visual output - what the terminal actually displays"""
        log_func("👁️  Visual Output (how it appears in terminal):")
        log_func("┌─ Visual ────────────────────────────────────────────────┐")

        try:
            # Use processed output (which is what terminal shows) as the visual display
            display_text = processed_output if processed_output else self.processor.strip_ansi(raw_output)

            if not display_text.strip():
                log_func("│ (no visible output)")
            else:
                # Split into lines and show up to 10 lines
                lines = display_text.split('\n')
                displayed_lines = 0

                for line in lines:
                    if displayed_lines >= 10:
                        break

                    # Handle long lines
                    if len(line) > 60:
                        line = line[:57] + "..."

                    # Show the line (this will display with actual colors if run in terminal)
                    print(f"│ {line}")
                    displayed_lines += 1

                if len(lines) > 10:
                    log_func(f"│ ... and {len(lines) - 10} more lines")

        except Exception as e:
            log_func(f"│ (error displaying: {e})")

        log_func("└─────────────────────────────────────────────────────────┘")

    def create_log_directory(self):
        """Create log directory if it doesn't exist"""
        try:
            os.makedirs(self.log_dir, exist_ok=True)
            return True
        except Exception as e:
            print(f"Warning: Could not create log directory: {e}")
            return False

    def generate_log_filename(self, command):
        """Generate a safe filename for the log"""
        # Get current timestamp
        timestamp = str(int(time.time()))

        # Create safe command name (remove/replace unsafe chars)
        safe_command = re.sub(r'[^\w\s-]', '', command)
        safe_command = re.sub(r'\s+', '_', safe_command)
        safe_command = safe_command[:50]  # Limit length

        if not safe_command:
            safe_command = "command"

        return f"{timestamp}_{safe_command}.log"

    def log_output(self, text):
        """Add text to log buffer"""
        if self.enable_logging:
            self.log_buffer.append(text)

    def write_log_file(self, command):
        """Write accumulated log buffer to file"""
        if not self.enable_logging or not self.log_buffer:
            return None

        if not self.create_log_directory():
            return None

        try:
            filename = self.generate_log_filename(command)
            filepath = os.path.join(self.log_dir, filename)

            with open(filepath, 'w', encoding='utf-8') as f:
                # Write header
                f.write(f"# Raw ANSI Analysis Log\n")
                f.write(f"# Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"# Command: {command}\n")
                f.write(f"# Timestamp: {int(time.time())}\n")
                f.write("# " + "="*60 + "\n\n")

                # Write all captured output
                for line in self.log_buffer:
                    f.write(line + '\n')

            return filepath
        except Exception as e:
            print(f"Warning: Could not write log file: {e}")
            return None

    def print_analysis(self, command, raw_output, returncode, show_hex=False, show_compare=True, show_real_terminal=True):
        """Print comprehensive analysis of the captured output"""

        # Clear log buffer for new analysis
        self.log_buffer = []

        def log_print(*args, **kwargs):
            """Print to console and capture to log buffer"""
            # Convert args to string
            text = ' '.join(str(arg) for arg in args)
            print(text, **kwargs)
            self.log_output(text)

        log_print("🔍 Raw ANSI Analyzer")
        log_print("=" * 60)
        log_print(f"📝 Command: {command}")
        log_print(f"🚀 Exit Code: {returncode}")
        log_print(f"📏 Raw Length: {len(raw_output)} characters")
        log_print()

        # Process with ANSIProcessor
        processed_output = self.processor.process_ansi_sequences(raw_output)
        stripped_output = self.processor.strip_ansi(raw_output)

        # Get real terminal output using echo
        real_terminal_output = None
        if show_real_terminal:
            real_terminal_output = self.get_real_terminal_output(raw_output)

        # Find ANSI sequences
        sequences = self.find_ansi_sequences(raw_output)

        log_print(f"🎨 ANSI Sequences Found: {len(sequences)}")
        if sequences:
            log_print("┌─ Sequence Analysis ─────────────────────────────────────┐")
            for i, seq_info in enumerate(sequences[:10], 1):  # Show first 10
                log_print(f"│ {i:2d}. {seq_info['repr']:<20} → {seq_info['description']}")
            if len(sequences) > 10:
                log_print(f"│     ... and {len(sequences) - 10} more sequences")
            log_print("└────────────────────────────────────────────────────────┘")
        log_print()

        def format_output_section(title, content, max_lines=5):
            """Format an output section with truncation for readability"""
            log_print(f"{title}:")
            log_print("┌───────────────────────────────��────────────────────────────┐")

            if not content:
                log_print("│ (empty)")
            else:
                content_repr = repr(content)
                if len(content_repr) > 500:  # Truncate very long content
                    content_repr = content_repr[:497] + "..."

                # Handle multi-line display
                if '\n' in content and len(content.split('\n')) > max_lines:
                    lines = content.split('\n')
                    displayed_lines = lines[:max_lines]
                    remaining = len(lines) - max_lines

                    for line in displayed_lines:
                        line_repr = repr(line)
                        if len(line_repr) > 55:
                            line_repr = line_repr[:52] + "..."
                        log_print(f"│ {line_repr}")
                    log_print(f"│ ... and {remaining} more lines")
                else:
                    log_print(f"│ {content_repr}")

            log_print("└───────────────────────────────────────────────────────┘")
            log_print()

        # Raw output
        format_output_section("📜 Raw Output (with ANSI sequences)", raw_output)

        # Real terminal output (using echo)
        if show_real_terminal and real_terminal_output is not None:
            format_output_section("🖥️  Real Terminal Output (echo rendered)", real_terminal_output)

        # Processed output
        format_output_section("🎯 Processed Output (ANSIProcessor result)", processed_output)

        # Stripped output
        format_output_section("🧹 Stripped Output (ANSI sequences removed)", stripped_output)

        # Enhanced comparison
        if show_compare:
            log_print("⚖️  Comparison:")
            log_print(f"│ Raw == Processed: {raw_output == processed_output}")
            log_print(f"│ Raw == Stripped:  {raw_output == stripped_output}")
            log_print(f"│ Processed == Stripped: {processed_output == stripped_output}")
            if real_terminal_output is not None:
                log_print(f"│ Real Terminal == Processed: {real_terminal_output == processed_output}")
                log_print(f"│ Real Terminal == Stripped: {real_terminal_output == stripped_output}")
                if real_terminal_output == processed_output:
                    log_print("│ 🎉 ANSIProcessor matches real terminal output!")
                else:
                    log_print("│ ⚠️  ANSIProcessor differs from real terminal output")
            log_print(f"│ Processing Changed Output: {raw_output != processed_output}")
            log_print()

        # Hex dump
        if show_hex:
            log_print("🔍 Hex Dump:")
            log_print("┌─ Hex Dump ──────────────────────────────────────────────┐")
            hex_lines = self.format_hex_dump(raw_output).split('\n')
            for line in hex_lines[:20]:  # Show first 20 lines
                log_log_func(f"│ {line}")
            if len(hex_lines) > 20:
                log_print(f"│ ... and {len(hex_lines) - 20} more lines")
            log_print("└───────────────────────────────────────────────────────┘")
            log_print()

        # Visual output - show what the terminal displays
        self.show_visual_output(raw_output, processed_output, log_print)

        log_print()
        if show_real_terminal:
            log_print("💡 Use --hex for hex dump, --no-compare to skip comparison, --no-real-terminal to skip echo rendering")
        else:
            log_print("💡 Use --hex for hex dump, --no-compare to skip comparison, --real-terminal to enable echo rendering")

        # Add note about commands that may not produce ANSI when captured
        if len(sequences) == 0 and len(raw_output) > 50:
            log_print("📝 Note: Some commands (like ls --color) may not produce ANSI codes when run via pty.")
            log_print("   Try explicit ANSI sequences with echo -e for testing ANSI processing.")

        # Write log file if logging is enabled
        if self.enable_logging:
            log_file_path = self.write_log_file(command)
            if log_file_path:
                print(f"\n📄 Full analysis written to: {log_file_path}")
            else:
                print("\n⚠️  Could not write log file")

def main():
    parser = argparse.ArgumentParser(
        description="Raw ANSI Analyzer - Capture and analyze real-world ANSI sequences",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  rawansi "ls --color=always"
  rawansi "git status --color=always"
  rawansi --hex "echo -e '\\033[31mRed\\033[0m'"
  rawansi --real-terminal "echo -e '\\033[6;11HTest\\033[1;1H'"
  rawansi --timeout 10 "ps aux | head -5"
  rawansi "tput cup 5 10; echo 'Positioned'; tput cup 0 0"

Perfect for:
  - Debugging ANSI processing issues
  - Understanding what real commands output
  - Creating test cases for ANSIProcessor
  - Analyzing terminal application behavior
  - Validating ANSIProcessor against real terminal behavior
        """
    )

    parser.add_argument(
        'command',
        help='Command to execute and analyze'
    )

    parser.add_argument(
        '--hex',
        action='store_true',
        help='Show detailed hex dump of raw output'
    )

    parser.add_argument(
        '--no-compare',
        action='store_true',
        help='Skip comparison section'
    )

    parser.add_argument(
        '--real-terminal',
        action='store_true',
        help='Enable real terminal output using echo (default: enabled)'
    )

    parser.add_argument(
        '--no-real-terminal',
        action='store_true',
        help='Disable real terminal output rendering'
    )

    parser.add_argument(
        '--timeout',
        type=int,
        default=5,
        help='Command timeout in seconds (default: 5)'
    )

    args = parser.parse_args()

    # Determine if real terminal output should be shown
    show_real_terminal = True  # Default to enabled
    if args.no_real_terminal:
        show_real_terminal = False
    elif args.real_terminal:
        show_real_terminal = True

    # Create capture instance
    capture = RawANSICapture(timeout=args.timeout)

    # Execute command and capture output
    print(f"🚀 Executing: {args.command}")
    print("⏳ Capturing raw ANSI output...")
    if show_real_terminal:
        print("🖥️  Will render with real terminal (echo)...")
    print()

    raw_output, returncode = capture.capture_command_output(args.command)

    # Print analysis
    capture.print_analysis(
        args.command,
        raw_output,
        returncode,
        show_hex=args.hex,
        show_compare=not args.no_compare,
        show_real_terminal=show_real_terminal
    )

if __name__ == "__main__":
    main()
