#!/usr/bin/osascript

-- Read from Terminal Script that outputs to stdout
-- Usage: osascript read_terminal.applescript

on run
	tell application "Terminal"
		-- Check for open window
		if (count of windows) = 0 then
			return "Error: No Terminal windows are open."
		end if
		
		set targetWindow to front window
		set targetTab to selected tab of targetWindow
		
		set output to "" & return
		
		-- Try to read terminal contents
		try
			set terminalText to contents of targetTab
			set output to output & "Contents: " & (terminalText as string) & return
			
		on error err1
			try
				set terminalHistory to history of targetTab
				set output to output & (terminalHistory as string) & return
				
			on error err2
				set output to output & "Cannot read terminal contents directly" & return
				set output to output & "Contents error: " & err1 & return
				set output to output & "History error: " & err2 & return
				
				-- Try basic tab info
				try
					set tabName to name of targetTab
					set tabBusy to busy of targetTab
					set output to output & "Tab name: " & tabName & return
					set output to output & "Tab busy: " & (tabBusy as string) & return
				on error err3
					set output to output & "Could not get tab properties: " & err3 & return
				end try
			end try
		end try
		
		-- set output to output & "========================="
		do script "clear" in targetTab
		return output
		
	end tell
end run
