#!/bin/bash

# UI utilities for Carpool app
# Provides reusable user interface functions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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
    
    while true; do
        read -p "$prompt" choice
        
        if ui_validate_choice "$choice" "$valid_choices"; then
            echo "$choice"
            return 0
        else
            echo "$error_msg"
        fi
    done
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
    
    echo -e "${YELLOW}$question (Y/n): ${NC}"
    read -p $'' yn
    case $yn in
        [Nn]* )
            return 1
            ;;
        * )
            return 0
            ;;
    esac
}
