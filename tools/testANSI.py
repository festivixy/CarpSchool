#!/usr/bin/env python3
"""
ANSI Parser Test Suite - Real World Data

Tests the ANSIProcessor from mdsh.py using actual ANSI sequences captured
from real shell commands. This helps identify parsing issues with real-world
terminal output.

Usage:
    python testANSI.py              # Run all tests
    python testANSI.py --verbose     # Show detailed output
    python testANSI.py --failing     # Show only failing tests
    python testANSI.py --benchmark   # Performance benchmarking
"""

import sys
import os
import time
import argparse

# Add the tools directory to path to import from mdsh
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the ANSIProcessor from mdsh
try:
    from mdsh import ANSIProcessor
except ImportError:
    print("❌ Could not import ANSIProcessor from mdsh")
    sys.exit(1)

class ANSITestSuite:
    def __init__(self, verbose=False):
        self.verbose = verbose
        self.processor = ANSIProcessor()
        self.tests_run = 0
        self.tests_passed = 0
        self.tests_failed = 0
        
    def run_test(self, name, input_seq, expected_output, description=""):
        """Run a single ANSI test case"""
        self.tests_run += 1
        
        try:
            # Test both strip_ansi and process_ansi_sequences
            stripped = self.processor.strip_ansi(input_seq)
            processed = self.processor.process_ansi_sequences(input_seq)
            
            # For most tests, we expect the processed output to match expected
            if processed == expected_output:
                self.tests_passed += 1
                if self.verbose:
                    print(f"✅ {name}: PASS")
                    if description:
                        print(f"   📝 {description}")
                    print(f"   📥 Input:    {repr(input_seq)}")
                    print(f"   📤 Output:   {repr(processed)}")
                    print(f"   🧹 Stripped: {repr(stripped)}")
                    print()
                return True
            else:
                self.tests_failed += 1
                print(f"❌ {name}: FAIL")
                if description:
                    print(f"   📝 {description}")
                print(f"   📥 Input:    {repr(input_seq)}")
                print(f"   📤 Expected: {repr(expected_output)}")
                print(f"   📤 Got:      {repr(processed)}")
                print(f"   🧹 Stripped: {repr(stripped)}")
                print()
                return False
                
        except Exception as e:
            self.tests_failed += 1
            print(f"💥 {name}: ERROR - {e}")
            print(f"   📥 Input: {repr(input_seq)}")
            print()
            return False

    def test_basic_colors(self):
        """Test basic color sequences from real shell output"""
        print("🎨 Testing Basic Color Sequences...")
        
        # From console.log: printf '\033[31mRed text\033[0m\n'
        self.run_test(
            "Red Text",
            "\033[31mRed text\033[0m\n",
            "Red text\n",
            "Basic red color with reset"
        )
        
        # From console.log: printf '\033[32mGreen text\033[0m\n'
        self.run_test(
            "Green Text", 
            "\033[32mGreen text\033[0m\n",
            "Green text\n",
            "Basic green color with reset"
        )
        
        # From console.log: printf '\033[1;34mBold blue text\033[0m\n'
        self.run_test(
            "Bold Blue Text",
            "\033[1;34mBold blue text\033[0m\n", 
            "Bold blue text\n",
            "Bold blue color combination"
        )
        
        # From console.log: printf '\033[33;41mYellow on red background\033[0m\n'
        self.run_test(
            "Yellow on Red Background",
            "\033[33;41mYellow on red background\033[0m\n",
            "Yellow on red background\n",
            "Foreground and background colors"
        )

    def test_cursor_movements(self):
        """Test cursor movement sequences from real output"""
        print("↔️ Testing Cursor Movement Sequences...")
        
        # From console.log: printf 'Hello\033[1GWorld\n'
        # Expected: cursor goes to column 1, so "World" overwrites "Hello"
        self.run_test(
            "Cursor to Column 1",
            "Hello\033[1GWorld\n",
            "World\n",
            "Go to column 1 should overwrite from start"
        )
        
        # From console.log: printf 'ABC\033[2D\033[1AX\n'  
        # This is complex: ABC, back 2, up 1, write X
        self.run_test(
            "Complex Cursor Movement",
            "ABC\033[2D\033[1AX\n",
            "AXC\n",
            "Back 2 positions, up 1 line, write X"
        )
        
        # From console.log: printf 'Line1\nLine2\033[1A\033[6GUpdated\n'
        # Line1, newline, Line2, up 1, go to column 6, write "Updated"
        self.run_test(
            "Multi-line Cursor Update",
            "Line1\nLine2\033[1A\033[6GUpdated\n",
            "Line1Updated\nLine2\n",
            "Update text on previous line at specific column"
        )
        
        # From console.log: tput cup 5 10; echo "Positioned text"; tput cup 0 0
        # Binary: \033[6;11HPositioned text\n\033[1;1H
        self.run_test(
            "Absolute Positioning",
            "\033[6;11HPositioned text\n\033[1;1H",
            "Positioned text\n",
            "Absolute cursor positioning with tput"
        )

    def test_clearing_operations(self):
        """Test line and screen clearing from real output"""
        print("🧹 Testing Clearing Operations...")
        
        # From console.log: printf 'Hello World\033[6G\033[K\n'
        # Go to column 6, clear to end of line
        self.run_test(
            "Clear to End of Line",
            "Hello World\033[6G\033[K\n",
            "Hello\n",
            "Position to column 6 and clear to end"
        )
        
        # From console.log: printf 'Hello World\033[2K\033[0GNew\n'
        # Clear entire line, go to column 0, write "New"
        self.run_test(
            "Clear Line and Rewrite",
            "Hello World\033[2K\033[0GNew\n",
            "New\n", 
            "Clear entire line then write new content"
        )
        
        # From console.log: printf '\033[2J\033[HClean screen\n'
        # Clear screen, go home, write text
        self.run_test(
            "Clear Screen",
            "\033[2J\033[HClean screen\n",
            "Clean screen\n",
            "Clear entire screen and write text"
        )

    def test_progress_simulation(self):
        """Test progress bar and spinner sequences"""
        print("⏳ Testing Progress Simulation...")
        
        # From console.log: spinner sequence
        spinner_seq = "Loading\033[2K\033[0G⠋ Loading\033[2K\033[0G⠙ Loading\033[2K\033[0G✓ Done!\n"
        self.run_test(
            "Loading Spinner",
            spinner_seq,
            "✓ Done!\n",
            "Spinner animation with final result"
        )
        
        # From console.log: progress bar sequence  
        progress_seq = "[████░░░░░░] 40%\033[1G[██████░░░░] 60%\033[1G[██████████] 100%\n"
        self.run_test(
            "Progress Bar",
            progress_seq, 
            "[██████████] 100%\n",
            "Progress bar updates with final state"
        )

    def test_complex_sequences(self):
        """Test complex real-world ANSI sequences"""
        print("🔮 Testing Complex Sequences...")
        
        # From console.log: OSC sequence for window title
        # \033]0;Window Title\007Text after OSC\n
        self.run_test(
            "OSC Window Title",
            "\033]0;Window Title\007Text after OSC\n",
            "Text after OSC\n",
            "OSC sequence should be stripped, text preserved"
        )
        
        # From console.log: save/restore cursor
        # \033[s\033[2J\033[H\033[32mSaved state\033[u restored\n
        self.run_test(
            "Save/Restore Cursor", 
            "\033[s\033[2J\033[H\033[32mSaved state\033[u restored\n",
            "Saved state restored\n",
            "Save cursor, clear screen, restore and continue"
        )
        
        # From console.log: carriage return handling
        # Multi\rCarriage\rReturn\rTest\n
        self.run_test(
            "Carriage Returns",
            "Multi\rCarriage\rReturn\rTest\n",
            "Test\n",
            "Multiple carriage returns should overwrite previous text"
        )
        
        # From console.log: hide/show cursor
        # \033[?25l\033[s\033[H\033[2J\033[u\033[?25h\n
        self.run_test(
            "Hide/Show Cursor",
            "\033[?25l\033[s\033[H\033[2J\033[u\033[?25h\n",
            "",
            "Cursor visibility sequences should be stripped"
        )

    def test_terminal_apps(self):
        """Test terminal application output"""
        print("📱 Testing Terminal Application Output...")
        
        # From console.log: box drawing characters
        box_seq = "┌─ Status ─┐\n│ Ready!   │\n└──────────┘\n"
        self.run_test(
            "Box Drawing",
            box_seq,
            "┌─ Status ─┐\n│ Ready!   │\n└──────────┘\n",
            "Unicode box drawing characters"
        )
        
        # From console.log: complex box with ANSI
        complex_box = "\033[2J\033[H╭─────────────╮\n│ Test Window │\n╰─────────────╯\n"
        self.run_test(
            "Complex Box with ANSI",
            complex_box,
            "╭─────────────╮\n│ Test Window │\n╰─────────────╯\n",
            "Box drawing with screen clear and positioning"
        )

    def test_interactive_simulation(self):
        """Test interactive command sequences"""
        print("🎮 Testing Interactive Simulation...")
        
        # From console.log: hidden text
        self.run_test(
            "Hidden Text",
            "Enter password: \033[8m[hidden]\033[0m\n",
            "Enter password: [hidden]\n",
            "Hidden text sequence should be stripped"
        )
        
        # From console.log: command line simulation
        cmd_sim = "\033[1;1H\033[2K> command\033[1;9H\033[K typed\n"
        self.run_test(
            "Command Line Simulation",
            cmd_sim,
            "> command typed\n",
            "Command line with positioning and clearing"
        )

    def test_real_ls_output(self):
        """Test real ls --color output parsing"""
        print("📁 Testing Real ls --color Output...")
        
        # Simplified version of real ls output from console.log
        ls_output = "\033[34m__pycache__\033[39;49m\033[0m\n\033[31mcheckRefs.py\033[39;49m\033[0m\n"
        expected = "__pycache__\ncheckRefs.py\n"
        
        self.run_test(
            "ls --color Output",
            ls_output,
            expected,
            "Real ls command with color codes"
        )

    def test_shell_prompts(self):
        """Test shell prompt sequences"""
        print("💲 Testing Shell Prompt Sequences...")
        
        # From console.log: oh-my-zsh style prompt
        # \033[1;32m➜\033[0m \033[1;34m~\033[0m \n
        self.run_test(
            "Oh-My-Zsh Prompt",
            "\033[1;32m➜\033[0m \033[1;34m~\033[0m \n",
            "➜ ~ \n",
            "Colored shell prompt with Unicode arrow"
        )
        
        # From console.log: colorful prompt
        # \033[38;5;196m❯\033[0m test prompt\n
        self.run_test(
            "256-Color Prompt",
            "\033[38;5;196m❯\033[0m test prompt\n",
            "❯ test prompt\n",
            "256-color prompt with Unicode symbol"
        )

    def run_all_tests(self):
        """Run the complete test suite"""
        print("🧪 ANSI Parser Test Suite - Real World Data")
        print("=" * 60)
        print()
        
        start_time = time.time()
        
        # Run all test categories
        self.test_basic_colors()
        self.test_cursor_movements()
        self.test_clearing_operations()
        self.test_progress_simulation()
        self.test_complex_sequences()
        self.test_terminal_apps()
        self.test_interactive_simulation()
        self.test_real_ls_output()
        self.test_shell_prompts()
        
        end_time = time.time()
        
        # Print summary
        print("=" * 60)
        print("📊 Test Results Summary")
        print(f"✅ Passed: {self.tests_passed}")
        print(f"❌ Failed: {self.tests_failed}")
        print(f"📝 Total:  {self.tests_run}")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        print(f"📈 Success Rate: {success_rate:.1f}%")
        print(f"⏱️  Runtime: {end_time - start_time:.3f}s")
        print()
        
        if self.tests_failed > 0:
            print("💡 There are test failures. The ANSIProcessor needs fixes for:")
            print("   - Real-world ANSI sequence handling")
            print("   - Cursor movement and positioning") 
            print("   - Line and screen clearing operations")
            print("   - Complex terminal application output")
            print()
            return False
        else:
            print("🎉 All tests passed! The ANSIProcessor handles real-world output correctly.")
            print()
            return True

    def benchmark_performance(self):
        """Benchmark the ANSI processor performance"""
        print("⚡ Performance Benchmark...")
        
        # Create a complex test sequence
        complex_seq = (
            "\033[2J\033[H" +  # Clear screen and home
            "\033[31mRed\033[0m " * 100 +  # 100 colored words
            "\033[1G" * 50 +  # 50 cursor movements
            "\033[2K" * 25 +  # 25 line clears
            "Final text\n"
        )
        
        iterations = 1000
        start_time = time.time()
        
        for i in range(iterations):
            self.processor.process_ansi_sequences(complex_seq)
        
        end_time = time.time()
        total_time = end_time - start_time
        per_iteration = total_time / iterations * 1000  # ms
        
        print(f"📊 Processed {iterations} complex sequences in {total_time:.3f}s")
        print(f"⚡ Average: {per_iteration:.3f}ms per sequence")
        print(f"🔢 Input length: {len(complex_seq)} characters")
        print()

def main():
    parser = argparse.ArgumentParser(
        description="ANSI Parser Test Suite using real shell data",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python testANSI.py              # Run all tests
  python testANSI.py --verbose     # Show detailed output
  python testANSI.py --failing     # Show only failing tests  
  python testANSI.py --benchmark   # Performance benchmarking
        """
    )
    
    parser.add_argument(
        '--verbose', '-v',
        action='store_true',
        help='Show detailed test output including passing tests'
    )
    
    parser.add_argument(
        '--failing', '-f', 
        action='store_true',
        help='Show only failing tests (default shows all failures)'
    )
    
    parser.add_argument(
        '--benchmark', '-b',
        action='store_true',
        help='Run performance benchmark'
    )
    
    args = parser.parse_args()
    
    # Create test suite
    suite = ANSITestSuite(verbose=args.verbose)
    
    # Run benchmark if requested
    if args.benchmark:
        suite.benchmark_performance()
        return
    
    # Run the tests
    success = suite.run_all_tests()
    
    # Exit with appropriate code
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
