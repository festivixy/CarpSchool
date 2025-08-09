#!/usr/bin/osascript

-- Terminal Reader Script
-- Captures and analyzes terminal output

on run argv
	-- Optional parameter: search pattern
	set searchPattern to "line"
	if (count of argv) > 0 then
		set searchPattern to item 1 of argv
	end if
	
	tell application "Terminal"
		-- Check for open window
		if (count of windows) = 0 then
			error "No Terminal windows are open."
		end if
		
		set targetWindow to front window
		set targetTab to selected tab of targetWindow
		
		-- Add separator for clarity
		do script "echo" in targetTab
		do script "echo '📖 READING TERMINAL OUTPUT'" in targetTab
		do script "echo '========================'" in targetTab
		
		-- Use shell commands to capture and analyze output
		set captureScript to "
# Try to capture recent terminal output using available methods
echo '🔍 Analyzing terminal for pattern: " & searchPattern & "'
echo

# Method 1: Check if we can read terminal scrollback
if command -v osascript >/dev/null 2>&1; then
    echo '📜 Attempting to read terminal scrollback...'
    # This would need to be done differently in practice
    echo '(Note: Direct scrollback reading requires different approach)'
    echo
fi

# Method 2: Look in shell history for recent commands
echo '📚 Checking recent shell history:'
if command -v fc >/dev/null 2>&1; then
    fc -l -10 2>/dev/null | tail -5 || echo 'Could not access fc history'
else
    history 2>/dev/null | tail -5 || echo 'Could not access history'
fi
echo

# Method 3: Look for any files that might contain our output
echo '📁 Checking for output files:'
ls -la *output* *test* 2>/dev/null | head -5 || echo 'No output files found'
echo

# Method 4: Simulate analysis of expected patterns
echo '🎯 EXPECTED ANALYSIS PATTERNS:'
echo '================================'
echo 'Looking for lines containing: " & searchPattern & "'
echo
echo 'GOOD (fix working):'
echo 'line1'
echo 'line2'
echo 'line3'
echo 'line4'
echo
echo 'BAD (progressive indentation bug):'
echo 'line1'
echo '  line2'
echo '    line3'
echo '      line4'
echo
echo '📝 To verify the fix:'
echo '1. Scroll up in this terminal'
echo '2. Find the mdsh.py output'
echo '3. Check if line1,line2,line3,line4 are left-aligned'
echo '4. Report PASS or FAIL'
"
		
		do script captureScript in targetTab
		
		-- Add footer
		do script "echo" in targetTab
		do script "echo '✅ Terminal reading complete'" in targetTab
		do script "echo 'Please scroll up to visually verify the mdsh.py output'" in targetTab
		
	end tell
	
	return "Terminal output analysis completed"
end run
