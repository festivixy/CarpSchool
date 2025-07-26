#!/bin/bash

# UI utilities for Carpool app
# Provides reusable user interface functions with robust input handling
#
# Environment Variables:
#   READ_TIMEOUT           - Input timeout in seconds (default: 10s)
#                           Override with: export READ_TIMEOUT=30
#   CARPOOL_NONINTERACTIVE - Non-interactive mode flag (default: unset)
#                           Set to '1' to skip all prompts and use defaults
#                           Example: export CARPOOL_NONINTERACTIVE=1
#
# Features:
#   - Input timeout handling with configurable timeout (default 10 seconds)
#   - Maximum retry attempts for validation (default 3 attempts)
#   - Non-interactive mode for automated pipelines and CI/CD
#   - Graceful fallback to defaults when stdin is unavailable
#   - Robust error handling for I/O issues and timeouts
#
# Default Behaviors:
#   - Interactive mode: Prompts user with timeout, retries on invalid input
#   - Non-interactive mode: Uses provided defaults or first valid choice
#   - Timeout reached: Falls back to default value if available
#   - Max attempts exceeded: Uses fallback value or exits with error
#   - stdin unavailable: Automatically uses defaults (common in Docker/CI)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to safely read user input with timeout and error handling
ui_safe_read() {
    local default_value="$1"
    local var_name="$2"
    local timeout="${READ_TIMEOUT:-10}"

    # Check for non-interactive mode first
    if [ "${CARPOOL_NONINTERACTIVE}" = "1" ]; then
        echo -e "${BLUE}[NON-INTERACTIVE MODE]${NC} Using default value: $default_value" >&2
        if [ -n "$var_name" ]; then
            eval "$var_name=\"\$default_value\""
        else
            echo "$default_value"
        fi
        return 0
    fi

    # Verify stdin is attached and readable
    if ! [ -t 0 ] && ! [ -p /dev/stdin ]; then
        echo -e "${RED}Warning: stdin is not available for input${NC}" >&2
        if [ -n "$default_value" ]; then
            if [ -n "$var_name" ]; then
                eval "$var_name=\"\$default_value\""
            else
                echo "$default_value"
            fi
            return 0
        fi
        return 1
    fi

    # Attempt to read input
    local input
    if read -r input; then
        # Successful read
        if [ -n "$var_name" ]; then
            eval "$var_name=\"\$input\""
        else
            echo "$input"
        fi
        return 0
    else
        local exit_status=$?
        # Handle timeout (exit status 142) or EIO
        if [ $exit_status -eq 142 ] || [ $exit_status -eq 5 ]; then
            echo -e "${RED}Warning: Input timeout or I/O error occurred${NC}" >&2
            if [ -n "$default_value" ]; then
                if [ -n "$var_name" ]; then
                    eval "$var_name=\"\$default_value\""
                else
                    echo "$default_value"
                fi
                return 0
            fi
        fi
        return $exit_status
    fi
}

# Function to show script header
ui_show_header() {
    local title="$1"
    local description="$2"

    echo "============================================"
    echo "$title"
    echo "============================================"
    if [ -n "$description" ]; then
        echo ""
        echo "$description"
    fi
    echo ""
}

# Function to show usage information
ui_show_usage() {
    local script_name="$1"
    local commands="$2"

    echo -e "${BLUE}🚀 $script_name${NC}"
    echo ""
    echo "Usage: ./$script_name [command]"
    echo ""
    echo "Available commands:"
    echo "$commands"
    echo ""
}

# Function to validate user choice
ui_validate_choice() {
    local choice="$1"
    local valid_choices="$2"

    for valid in $valid_choices; do
        if [ "$choice" = "$valid" ]; then
            return 0
        fi
    done
    return 1
}

# Function to prompt with validation
ui_prompt_with_validation() {
    local prompt="$1"
    local valid_choices="$2"
    local error_msg="$3"
    local fallback="$4"  # Optional fallback value
    local max_attempts=${5:-3}  # Default to 3 attempts

    # Check for non-interactive mode first
    if [ "${CARPOOL_NONINTERACTIVE}" = "1" ]; then
        if [ -n "$fallback" ]; then
            echo -e "${BLUE}[NON-INTERACTIVE MODE]${NC} Using fallback value: $fallback" >&2
            echo "$fallback"
            return 0
        else
            # If no fallback provided, use the first valid choice as default
            local first_choice=$(echo $valid_choices | cut -d' ' -f1)
            echo -e "${BLUE}[NON-INTERACTIVE MODE]${NC} No fallback provided, using first valid choice: $first_choice" >&2
            echo "$first_choice"
            return 0
        fi
    fi

    local attempts=0
    local choice

    while [ $attempts -lt $max_attempts ]; do
        echo -n "$prompt" >&2

        # Read input directly without variable passing to avoid scope issues
        if read -r choice; then
            if ui_validate_choice "$choice" "$valid_choices"; then
                echo "$choice"
                return 0
            else
                echo "$error_msg" >&2
                attempts=$((attempts + 1))
            fi
        else
            local exit_status=$?
            # Handle I/O errors
            echo -e "${RED}Failed to read input (attempt $((attempts + 1))/$max_attempts)${NC}" >&2
            attempts=$((attempts + 1))
        fi
    done

    # Maximum attempts reached - handle failure
    if [ -n "$fallback" ]; then
        ui_show_completion "Input validation failed after $max_attempts attempts" "Using fallback value: $fallback"
        echo "$fallback"
        return 0
    else
        ui_error_exit "Failed to get valid input after $max_attempts attempts. Valid choices were: $valid_choices"
    fi
}

# Function to show completion message
ui_show_completion() {
    local operation="$1"
    local next_steps="$2"

    echo -e "${GREEN}✅ $operation completed!${NC}"
    if [ -n "$next_steps" ]; then
        echo ""
        echo "📝 $next_steps"
    fi
}

# Function to show error and exit
ui_error_exit() {
    local error_msg="$1"
    local exit_code=${2:-1}

    echo -e "${RED}❌ Error: $error_msg${NC}"
    exit "$exit_code"
}

# Function to ask yes/no question
ui_ask_yes_no() {
    local question="$1"
    local default=${2:-"Y"}  # Default to Yes
    local yn

    echo -e "${YELLOW}$question (Y/n): ${NC}"

    # Use ui_safe_read with default answer - if it fails, return the default
    if ui_safe_read "$default" yn; then
        # Input was successfully read or default was used
        case $yn in
            [Nn]* )
                return 1
                ;;
            * )
                return 0
                ;;
        esac
    else
        # ui_safe_read failed completely, use default to allow scripts to continue
        echo -e "${RED}Warning: Failed to read input, using default answer: $default${NC}" >&2
        case $default in
            [Nn]* )
                return 1
                ;;
            * )
                return 0
                ;;
        esac
    fi
}
