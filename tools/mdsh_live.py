#!/usr/bin/env python3
"""
Markdown Shell Live (mdsh-live) - Interactive terminal with Rich Live display
Opens a new terminal window and provides real-time updates using Rich Live.
"""

import sys
import os
import subprocess
import threading
import queue
import time
import argparse
import signal
import tty
import termios
import select
from rich.live import Live
from rich.console import Console
from rich.panel import Panel
from rich.text import Text
from rich.layout import Layout
from rich.table import Table
from rich import box

class LiveTerminal:
    """Live terminal with Rich Live display."""

    def __init__(self, shell="zsh"):
        self.shell = shell
        self.console = Console()
        self.output_buffer = []
        self.input_buffer = ""
        self.terminal_process = None
        self.terminal_id = None
        self.running = True
        self.max_lines = 50  # Keep last 50 lines

        # Queues for thread communication
        self.output_queue = queue.Queue()
        self.input_queue = queue.Queue()

        # Terminal settings for raw input
        self.old_settings = None

        # Setup signal handling
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals."""
        self.running = False
        self.cleanup()
        sys.exit(0)





    def open_new_terminal(self):
        """Open a new terminal window and get its ID."""
        try:
            # Create a new terminal window and capture its ID
            result = subprocess.run([
                "osascript", "-e",
                'tell application "Terminal" to do script ""'
            ], capture_output=True, text=True, check=True)

            # Extract terminal ID from the result
            self.terminal_id = result.stdout.strip()

            # Wait a moment for terminal to initialize
            time.sleep(1)

            return True
        except subprocess.CalledProcessError as e:
            self.console.print(f"[red]Error opening terminal: {e}[/red]")
            return False

    def send_to_terminal(self, command):
        """Send a command to the terminal window."""
        if not self.terminal_id:
            return False

        try:
            # Proper escaping for AppleScript - escape quotes and backslashes
            escaped_command = command.replace("\\", "\\\\").replace('"', '\\"')

            subprocess.run([
                "osascript", "-e",
                f'tell application "Terminal" to do script "{escaped_command}" in {self.terminal_id}'
            ], check=True, capture_output=True)
            return True
        except subprocess.CalledProcessError:
            # Don't print errors as they interfere with Rich Live display
            return False

    def send_keystroke_to_terminal(self, char):
        """Send a single keystroke to the terminal window."""
        if not self.terminal_id:
            return False

        try:
            char_code = ord(char)

            # Extract window and tab numbers from terminal_id (format: "tab X of window id Y")
            import re
            match = re.search(r'tab (\d+) of window id (\d+)', self.terminal_id)
            if not match:
                return False

            tab_num = match.group(1)
            window_id = match.group(2)

            if char_code == 13 or char_code == 10:  # Enter
                subprocess.run([
                    "osascript", "-e",
                    f'tell application "Terminal" to tell window id {window_id} to tell tab {tab_num} to keystroke return'
                ], check=True, capture_output=True)
            elif char_code == 127 or char_code == 8:  # Backspace
                subprocess.run([
                    "osascript", "-e",
                    f'tell application "Terminal" to tell window id {window_id} to tell tab {tab_num} to keystroke (ASCII character 8)'
                ], check=True, capture_output=True)
            elif char_code == 9:  # Tab
                subprocess.run([
                    "osascript", "-e",
                    f'tell application "Terminal" to tell window id {window_id} to tell tab {tab_num} to keystroke tab'
                ], check=True, capture_output=True)
            elif char_code == 27:  # Escape
                subprocess.run([
                    "osascript", "-e",
                    f'tell application "Terminal" to tell window id {window_id} to tell tab {tab_num} to keystroke (ASCII character 27)'
                ], check=True, capture_output=True)
            elif 32 <= char_code <= 126:  # Printable characters
                escaped_char = char.replace("\\", "\\\\").replace('"', '\\"').replace("'", "\\'")
                subprocess.run([
                    "osascript", "-e",
                    f'tell application "Terminal" to tell window id {window_id} to tell tab {tab_num} to keystroke "{escaped_char}"'
                ], check=True, capture_output=True)
            # For other control characters, try to send them as ASCII character
            else:
                subprocess.run([
                    "osascript", "-e",
                    f'tell application "Terminal" to tell window id {window_id} to tell tab {tab_num} to keystroke (ASCII character {char_code})'
                ], check=True, capture_output=True)

            return True
        except subprocess.CalledProcessError:
            return False

    def read_terminal_output(self):
        """Read output from the terminal window."""
        if not self.terminal_id:
            return ""

        try:
            result = subprocess.run([
                "osascript", "-e",
                f'tell application "Terminal" to get contents of {self.terminal_id}'
            ], capture_output=True, text=True, check=True)

            return result.stdout.strip()
        except subprocess.CalledProcessError:
            return ""

    def output_monitor_thread(self):
        """Monitor terminal output in a separate thread."""
        last_output = ""

        while self.running:
            try:
                current_output = self.read_terminal_output()

                if current_output != last_output:
                    # Split into lines and keep recent ones
                    lines = current_output.split('\n')

                    # Update output buffer
                    self.output_buffer = lines[-self.max_lines:]
                    last_output = current_output

                time.sleep(0.1)  # Check every 100ms for faster updates

            except Exception as e:
                if self.running:  # Only log if we're still running
                    self.output_queue.put(f"Error reading output: {e}")
                break

    def keystroke_capture_thread(self):
        """Capture keystrokes and forward them in real-time."""
        # Store original terminal settings
        original_settings = None

        try:
            # Setup raw mode for keystroke capture
            original_settings = termios.tcgetattr(sys.stdin.fileno())
            tty.setraw(sys.stdin.fileno())

            while self.running:
                # Check for available input
                if select.select([sys.stdin], [], [], 0.1)[0]:
                    char = sys.stdin.read(1)

                    if not char:
                        break

                    char_code = ord(char)

                    # Handle Ctrl+C
                    if char_code == 3:
                        self.running = False
                        break

                    # Forward the keystroke immediately
                    self.send_keystroke_to_terminal(char)

        except Exception as e:
            pass
        finally:
            # Restore terminal settings
            if original_settings:
                try:
                    termios.tcsetattr(sys.stdin.fileno(), termios.TCSADRAIN, original_settings)
                except:
                    pass

    def create_display(self):
        """Create the Rich Live display layout."""
        layout = Layout()

        # Create main sections
        layout.split_column(
            Layout(name="header", size=3),
            Layout(name="terminal", ratio=1),
            Layout(name="footer", size=3)
        )

        # Header
        header_text = Text("MDSH Live Terminal", style="bold blue")
        header_panel = Panel(
            header_text,
            title="Live Terminal Monitor",
            border_style="blue",
            box=box.ROUNDED
        )
        layout["header"].update(header_panel)

        # Terminal output
        terminal_content = "\n".join(self.output_buffer[-40:])  # Show last 40 lines
        if not terminal_content.strip():
            terminal_content = "[dim]Waiting for terminal output...[/dim]"

        terminal_panel = Panel(
            terminal_content,
            title="Terminal Output",
            border_style="green",
            box=box.ROUNDED
        )
        layout["terminal"].update(terminal_panel)

        # Footer with instructions
        footer_text = Text("Type here - keystrokes are forwarded in real-time to new terminal • Live monitoring • Ctrl+C to stop")
        footer_panel = Panel(
            footer_text,
            border_style="yellow",
            box=box.ROUNDED
        )
        layout["footer"].update(footer_panel)

        return layout

    def run(self):
        """Run the live terminal."""
        self.console.print("[blue]Starting Live Terminal...[/blue]")

        # Open new terminal window
        if not self.open_new_terminal():
            self.console.print("[red]Failed to open terminal window[/red]")
            return False

        self.console.print(f"[green]Terminal opened: {self.terminal_id}[/green]")
        self.console.print("[yellow]Use the new terminal window for commands, this window shows live updates[/yellow]")
        self.console.print("[yellow]Press Ctrl+C to exit[/yellow]")

        # Start monitoring threads
        output_thread = threading.Thread(target=self.output_monitor_thread, daemon=True)
        output_thread.start()

        # Start keystroke capture in a separate thread to avoid Rich Live conflicts
        keystroke_thread = threading.Thread(target=self.keystroke_capture_thread, daemon=True)
        keystroke_thread.start()

        # Run Rich Live display with higher refresh rate
        try:
            with Live(self.create_display(), refresh_per_second=10) as live:
                while self.running:
                    # Update the display
                    live.update(self.create_display())
                    time.sleep(0.1)  # Update every 100ms

        except KeyboardInterrupt:
            self.running = False

        # Wait for threads to finish
        self.console.print("[yellow]Shutting down...[/yellow]")
        self.cleanup()

        return True

    def cleanup(self):
        """Clean up resources."""
        self.running = False

        # Note: We don't automatically close the terminal window
        # as users might want to continue using it
        if self.terminal_id:
            self.console.print(f"[yellow]Terminal window {self.terminal_id} left open for continued use[/yellow]")


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Live Terminal with Rich Live display",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  ./mdsh_live.py                    # Start live terminal with zsh
  ./mdsh_live.py --shell bash       # Start with bash

Features:
  - Opens new terminal window
  - Real-time output monitoring
  - Rich Live display updates
  - Interactive input forwarding
        """
    )

    parser.add_argument(
        "--shell",
        default="zsh",
        help="Shell to use in terminal (default: zsh)"
    )

    args = parser.parse_args()

    # Create and run live terminal
    terminal = LiveTerminal(shell=args.shell)

    try:
        success = terminal.run()
        if not success:
            sys.exit(1)
    except KeyboardInterrupt:
        terminal.cleanup()
        print("\nExiting...")
        sys.exit(0)


if __name__ == "__main__":
    main()
