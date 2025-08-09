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
    rawansi --compare "printf '\\033[31mRed\\033[0m\\n'"

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

    def __init__(self, timeout=5):
        self.timeout = timeout
        self.processor = ANSIProcessor()

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
            # For comparison purposes, show what a terminal would display
            # after processing all the ANSI sequences

            # Write raw output to a file and cat it to see terminal behavior
            import tempfile

            with tempfile.NamedTemporaryFile(mode='wb', delete=False) as f:
                f.write(raw_output.encode('utf-8'))
                temp_file = f.name

            try:
                # Cat the file to see how terminal handles it
                # Capture both stdout and stderr to see actual terminal output
                result = subprocess.run(
                    ['cat', temp_file],
                    capture_output=True,
                    text=False,  # Keep as bytes initially
                    timeout=2
                )

                if result.returncode == 0:
                    # Decode the result
                    terminal_output = result.stdout.decode('utf-8', errors='replace')

                    # Process this output through our ANSIProcessor to show
                    # what the terminal would display as final text
                    final_display = self.processor.process_ansi_sequences(terminal_output)
                    return final_display
                else:
                    return f"Terminal error: {result.stderr.decode('utf-8', errors='replace')}"

            finally:
                try:
                    os.unlink(temp_file)
                except:
                    pass

        except Exception as e:
            return f"Error simulating terminal: {e}"

    def print_analysis(self, command, raw_output, returncode, show_hex=False, show_compare=True, show_real_terminal=True):
        """Print comprehensive analysis of the captured output"""

        print("🔍 Raw ANSI Analyzer")
        print("=" * 60)
        print(f"📝 Command: {command}")
        print(f"🚀 Exit Code: {returncode}")
        print(f"📏 Raw Length: {len(raw_output)} characters")
        print()

        # Process with ANSIProcessor
        processed_output = self.processor.process_ansi_sequences(raw_output)
        stripped_output = self.processor.strip_ansi(raw_output)

        # Get real terminal output using printf
        real_terminal_output = None
        if show_real_terminal:
            real_terminal_output = self.get_real_terminal_output(raw_output)

        # Find ANSI sequences
        sequences = self.find_ansi_sequences(raw_output)

        print(f"🎨 ANSI Sequences Found: {len(sequences)}")
        if sequences:
            print("┌─ Sequence Analysis ─────────────────────────────────────┐")
            for i, seq_info in enumerate(sequences[:10], 1):  # Show first 10
                print(f"│ {i:2d}. {seq_info['repr']:<20} → {seq_info['description']}")
            if len(sequences) > 10:
                print(f"│     ... and {len(sequences) - 10} more sequences")
            print("└─────────────────────────────────────────────────────────┘")
        print()

        # Raw output
        print("📜 Raw Output (with ANSI sequences):")
        print("┌─ Raw ───────────────────────────────────────────────────┐")
        if raw_output.strip():
            print(f"│ {repr(raw_output)}")
        else:
            print("│ (empty)")
        print("└─────────────────────────────────────────────────────────┘")
        print()

        # Real terminal output (using printf)
        if show_real_terminal and real_terminal_output is not None:
            print("🖥️  Real Terminal Output (printf rendered):")
            print("┌─ Real Terminal ─────────────────────────────────────────┐")
            if real_terminal_output:
                print(f"│ {repr(real_terminal_output)}")
            else:
                print("│ (empty)")
            print("└─────────────────────────────────────────────────────────┘")
            print()

        # Processed output
        print("🎯 Processed Output (ANSIProcessor result):")
        print("┌─ Processed ─────────────────────────────────────────────┐")
        if processed_output:
            print(f"│ {repr(processed_output)}")
        else:
            print("│ (empty)")
        print("└─────────────────────────────────────────────────────────┘")
        print()

        # Stripped output
        print("🧹 Stripped Output (ANSI sequences removed):")
        print("┌─ Stripped ──────────────────────────────────────────────┐")
        if stripped_output:
            print(f"│ {repr(stripped_output)}")
        else:
            print("│ (empty)")
        print("└─────────────────────────────────────────────────────────┘")
        print()

        # Enhanced comparison
        if show_compare:
            print("⚖️  Comparison:")
            print(f"│ Raw == Processed: {raw_output == processed_output}")
            print(f"│ Raw == Stripped:  {raw_output == stripped_output}")
            print(f"│ Processed == Stripped: {processed_output == stripped_output}")
            if real_terminal_output is not None:
                print(f"│ Real Terminal == Processed: {real_terminal_output == processed_output}")
                print(f"│ Real Terminal == Stripped: {real_terminal_output == stripped_output}")
                if real_terminal_output == processed_output:
                    print("│ 🎉 ANSIProcessor matches real terminal output!")
                else:
                    print("│ ⚠️  ANSIProcessor differs from real terminal output")
            print(f"│ Processing Changed Output: {raw_output != processed_output}")
            print()

        # Hex dump
        if show_hex:
            print("🔍 Hex Dump:")
            print("┌─ Hex Dump ──────────────────────────────────────────────┐")
            hex_lines = self.format_hex_dump(raw_output).split('\n')
            for line in hex_lines[:20]:  # Show first 20 lines
                print(f"│ {line}")
            if len(hex_lines) > 20:
                print(f"│ ... and {len(hex_lines) - 20} more lines")
            print("└─────────────────────────────────────────────────────────┘")
            print()

        # Visual output (if it looks safe to display)
        if raw_output and len(raw_output) < 1000 and not any(ord(c) < 32 and c not in '\n\r\t\x1b' for c in raw_output):
            print("👁️  Visual Output (how it appears in terminal):")
            print("┌─ Visual ────────────────────────────────────────────────┐")
            try:
                lines = raw_output.split('\n')
                for line in lines[:10]:  # Show first 10 lines
                    print(f"│ {line}")
                if len(lines) > 10:
                    print(f"│ ... and {len(lines) - 10} more lines")
            except:
                print("│ (unable to display visually)")
            print("└─────────────────────────────────────────────────────────┘")

        print()
        if show_real_terminal:
            print("💡 Use --hex for hex dump, --no-compare to skip comparison, --no-real-terminal to skip printf rendering")
        else:
            print("💡 Use --hex for hex dump, --no-compare to skip comparison, --real-terminal to enable printf rendering")

def main():
    parser = argparse.ArgumentParser(
        description="Raw ANSI Analyzer - Capture and analyze real-world ANSI sequences",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  rawansi "ls --color=always"
  rawansi "git status --color=always"
  rawansi --hex "printf '\\033[31mRed\\033[0m\\n'"
  rawansi --real-terminal "printf '\\033[6;11HTest\\033[1;1H'"
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
        help='Enable real terminal output using printf (default: enabled)'
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
        print("🖥️  Will render with real terminal (printf)...")
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
