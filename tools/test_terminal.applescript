#!/usr/bin/osascript

-- Minimal Terminal Test for mdsh.py PTY mode
-- Simple write commands and let user observe

on run
	set testCmd to "echo 'line1' && echo 'line2' && echo 'line3' && echo 'line4'"
	
	tell application "Terminal"
		-- Check for open window
		if (count of windows) = 0 then
			error "No Terminal windows are open. Please open a Terminal window first."
		end if
		
		set targetWindow to front window
		set targetTab to selected tab of targetWindow
		
		-- Clear and start test
		do script "clear" in targetTab
		delay 0.5
		
		do script "echo '🧪 Testing mdsh.py PTY Mode'" in targetTab
		do script "echo '============================='" in targetTab
		do script "echo '📋 Test: " & testCmd & "'" in targetTab
		do script "echo '🎯 Expected: All lines left-aligned'" in targetTab
		do script "echo '🐛 Bug: Progressive indentation'" in targetTab
		do script "echo" in targetTab
		delay 1
		
		-- Get current directory and change to tools
		set currentDir to do shell script "pwd"
		set toolsDir to do shell script "dirname " & quoted form of currentDir & "/tools"
		
		do script "cd " & quoted form of toolsDir & "/tools" in targetTab
		delay 0.5
		
		-- Run the test
		do script "echo '🚀 Running mdsh.py in PTY mode...'" in targetTab
		do script "echo" in targetTab
		delay 0.5
		
		do script "./mdsh.py " & quoted form of testCmd in targetTab
		delay 3
		
		-- Analysis instructions
		do script "echo" in targetTab
		do script "echo '🔍 PLEASE ANALYZE THE OUTPUT ABOVE:'" in targetTab
		do script "echo '===================================='" in targetTab
		do script "echo '✅ PASS: line1, line2, line3, line4 are all left-aligned'" in targetTab
		do script "echo '❌ FAIL: Lines are progressively indented (line2 more than line1, etc.)'" in targetTab
		do script "echo" in targetTab
		
		-- Create analysis script
		do script "echo '🤖 Running automated analysis...'" in targetTab
		
		set analysisScript to "
# Capture the recent terminal output and analyze
echo 'Analyzing last 20 lines of output...'

# Create a temp file with recent output
script -q /dev/null cat > /tmp/terminal_analysis.txt << 'EOF'
# This will capture what we can see
echo 'Looking for line1, line2, line3, line4 patterns...'

# Try to grep for our test lines in the current terminal
# This is best-effort since we can't easily capture mdsh output directly
if command -v fc >/dev/null 2>&1; then
    echo 'Checking command history for test output...'
    fc -l -20 2>/dev/null || echo 'Could not access command history'
fi

echo
echo 'Please visually inspect the mdsh.py output above.'
echo 'Look for the line1, line2, line3, line4 output lines.'
echo
echo 'EXPECTED (fix working): All lines left-aligned'
echo 'line1'
echo 'line2' 
echo 'line3'
echo 'line4'
echo
echo 'BUG (fix not working): Progressive indentation'
echo 'line1'
echo '  line2'
echo '    line3'
echo '      line4'
EOF
"
		
		do script analysisScript in targetTab
		delay 1
		
		do script "echo" in targetTab
		do script "echo '📝 MANUAL VERIFICATION REQUIRED'" in targetTab
		do script "echo 'Please scroll up and check the mdsh.py output visually.'" in targetTab
		do script "echo 'Report: PASS (left-aligned) or FAIL (progressive indent)'" in targetTab
		
	end tell
	
	return "Terminal test completed. Please check output manually."
end run
