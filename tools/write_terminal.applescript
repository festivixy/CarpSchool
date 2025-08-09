#!/usr/bin/osascript

-- Write to Terminal Script
-- Usage: osascript write_terminal.applescript "command to run"

on run argv
	if (count of argv) = 0 then
		error "Usage: osascript write_terminal.applescript \"command to run\""
	end if
	
	set commandToRun to item 1 of argv
	
	tell application "Terminal"
		-- Check for open window
		if (count of windows) = 0 then
			error "No Terminal windows are open. Please open a Terminal window first."
		end if
		
		set targetWindow to front window
		set targetTab to selected tab of targetWindow
		
		-- Execute the command
		do script commandToRun in targetTab
		
	end tell
	
	return "Command executed: " & commandToRun
end run
