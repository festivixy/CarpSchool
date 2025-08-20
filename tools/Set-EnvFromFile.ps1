#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Loads environment variables from a .env file into the current PowerShell session.

.DESCRIPTION
    This script reads a .env file and sets environment variables for the current process.
    It handles comments, empty lines, and quoted values properly.

.PARAMETER FilePath
    Path to the .env file. Defaults to ".env" in current directory.

.PARAMETER Scope
    Scope for environment variables. Options: Process (default), User, Machine
    - Process: Only for current session
    - User: For current user (persistent)
    - Machine: For all users (requires admin, persistent)

.PARAMETER Verbose
    Show detailed output of what variables are being set.

.EXAMPLE
    ./Set-EnvFromFile.ps1
    Loads .env from current directory

.EXAMPLE
    ./Set-EnvFromFile.ps1 -FilePath "../.env"
    Loads .env from parent directory

.EXAMPLE
    ./Set-EnvFromFile.ps1 -FilePath ".env" -Scope User -Verbose
    Loads .env and sets variables persistently for current user with verbose output

.NOTES
    Author: Carp School Development Team
    Purpose: Load .env files for Meteor.js development with OneSignal configuration
#>

param(
    [Parameter(Position = 0)]
    [string]$FilePath = ".env",
    
    [Parameter()]
    [ValidateSet("Process", "User", "Machine")]
    [string]$Scope = "Process",
    
    [Parameter()]
    [switch]$Verbose
)

function Set-EnvFromFile {
    param(
        [string]$FilePath,
        [string]$Scope = "Process",
        [bool]$VerboseOutput = $false
    )
    
    # Check if file exists
    if (-not (Test-Path $FilePath)) {
        Write-Error "❌ File '$FilePath' not found"
        Write-Host "💡 Make sure the .env file exists at the specified path" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host "📁 Loading environment variables from: $FilePath" -ForegroundColor Cyan
    
    $loadedCount = 0
    $skippedCount = 0
    
    try {
        Get-Content $FilePath | ForEach-Object {
            $line = $_.Trim()
            
            # Skip empty lines and comments
            if ($line -match '^\s*$' -or $line -match '^\s*#') {
                if ($VerboseOutput -and $line -match '^\s*#') {
                    Write-Host "💬 Comment: $line" -ForegroundColor Gray
                }
                $script:skippedCount++
                return
            }
            
            # Match KEY=VALUE pattern
            if ($line -match '^([^=]+)=(.*)$') {
                $key = $matches[1].Trim()
                $value = $matches[2].Trim()
                
                # Remove surrounding quotes (both single and double)
                if ($value -match '^"(.*)"$' -or $value -match "^'(.*)'$") {
                    $value = $matches[1]
                }
                
                # Set environment variable
                try {
                    [Environment]::SetEnvironmentVariable($key, $value, $Scope)
                    
                    if ($VerboseOutput) {
                        # Mask sensitive values (API keys, passwords, etc.)
                        $displayValue = $value
                        if ($key -match '(KEY|SECRET|PASSWORD|TOKEN)' -and $value.Length -gt 10) {
                            $displayValue = $value.Substring(0, 8) + "..." + $value.Substring($value.Length - 4)
                        }
                        Write-Host "✅ $key = $displayValue" -ForegroundColor Green
                    } else {
                        Write-Host "✅ $key" -ForegroundColor Green
                    }
                    
                    $script:loadedCount++
                } catch {
                    Write-Warning "⚠️ Failed to set $key`: $_"
                }
            } else {
                Write-Warning "⚠️ Invalid line format: $line"
                $script:skippedCount++
            }
        }
        
        # Summary
        Write-Host "`n📊 Summary:" -ForegroundColor Cyan
        Write-Host "   Loaded: $loadedCount variables" -ForegroundColor Green
        Write-Host "   Skipped: $skippedCount lines" -ForegroundColor Yellow
        Write-Host "   Scope: $Scope" -ForegroundColor Blue
        
        if ($Scope -eq "Process") {
            Write-Host "💡 Variables are set for current session only" -ForegroundColor Yellow
        } elseif ($Scope -eq "User") {
            Write-Host "💡 Variables are set persistently for current user" -ForegroundColor Yellow
        } else {
            Write-Host "💡 Variables are set persistently for all users" -ForegroundColor Yellow
        }
        
        return $true
        
    } catch {
        Write-Error "❌ Error reading file: $_"
        return $false
    }
}

function Show-LoadedEnvVars {
    param([string[]]$Keys)
    
    Write-Host "`n🔍 Checking loaded environment variables:" -ForegroundColor Cyan
    
    foreach ($key in $Keys) {
        $value = [Environment]::GetEnvironmentVariable($key, "Process")
        if ($value) {
            # Mask sensitive values
            $displayValue = $value
            if ($key -match '(KEY|SECRET|PASSWORD|TOKEN)' -and $value.Length -gt 10) {
                $displayValue = $value.Substring(0, 8) + "..." + $value.Substring($value.Length - 4)
            }
            Write-Host "   $key = $displayValue" -ForegroundColor Green
        } else {
            Write-Host "   $key = (not set)" -ForegroundColor Red
        }
    }
}

# Main execution
Write-Host "🚀 PowerShell .env Loader for Meteor.js" -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta

$success = Set-EnvFromFile -FilePath $FilePath -Scope $Scope -VerboseOutput:$Verbose

if ($success) {
    # Show key environment variables for OneSignal/Meteor
    Show-LoadedEnvVars @(
        "ONESIGNAL_APP_ID",
        "ONESIGNAL_API_KEY", 
        "NOTIFICATION_BACKEND",
        "FIREBASE_PROJECT_ID",
        "REGION"
    )
    
    Write-Host "`n🎯 Ready to start Meteor with loaded environment!" -ForegroundColor Green
    Write-Host "Run: meteor --no-release-check --settings ../config/settings.development.json --port 3001" -ForegroundColor Cyan
} else {
    Write-Host "`n❌ Failed to load environment variables" -ForegroundColor Red
    exit 1
}

# Export the function for use in other scripts
Export-ModuleMember -Function Set-EnvFromFile
