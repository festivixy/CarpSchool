#!/bin/bash

# Test suite for ui-utils.sh
# Tests various stdin conditions and timeout scenarios
# Usage: ./test_ui_utils.sh

set -euo pipefail

# Colors for test output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Default timeout from ui-utils.sh
DEFAULT_READ_TIMEOUT=10

# Source the ui-utils.sh file
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_UTILS_PATH="$SCRIPT_DIR/tools/ui-utils.sh"

if [ ! -f "$UI_UTILS_PATH" ]; then
    echo -e "${RED}Error: ui-utils.sh not found at $UI_UTILS_PATH${NC}"
    exit 1
fi

# Test helper functions
test_start() {
    local test_name="$1"
    echo -e "${BLUE}[TEST]${NC} $test_name"
    TESTS_RUN=$((TESTS_RUN + 1))
}

test_pass() {
    local test_name="$1"
    echo -e "${GREEN}[PASS]${NC} $test_name"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

test_fail() {
    local test_name="$1"
    local reason="$2"
    echo -e "${RED}[FAIL]${NC} $test_name: $reason"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

# Function to run a test with timeout protection
run_with_timeout() {
    local timeout_duration="$1"
    shift
    local test_function="$@"
    
    # Use timeout command to prevent hanging
    if timeout "$timeout_duration" bash -c "$test_function"; then
        return 0
    else
        local exit_code=$?
        if [ $exit_code -eq 124 ]; then
            echo "Test timed out after ${timeout_duration}s"
            return 124
        fi
        return $exit_code
    fi
}

# Test 1: Normal interactive call (mocked with <<<)
test_normal_interactive() {
    test_start "Normal interactive call with mocked input"
    
    local test_script=$(cat << 'EOF'
source "$1"
result=$(echo "test_input" | ui_safe_read "default_val")
if [ "$result" = "test_input" ]; then
    echo "SUCCESS"
else
    echo "FAILED: Expected 'test_input', got '$result'"
    exit 1
fi
EOF
    )
    
    if run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "echo '$test_script' | bash -s '$UI_UTILS_PATH'" 2>/dev/null | grep -q "SUCCESS"; then
        test_pass "Normal interactive input"
    else
        test_fail "Normal interactive input" "Function did not handle normal input correctly"
    fi
}

# Test 2: Non-interactive mode
test_noninteractive_mode() {
    test_start "Non-interactive mode with CARPOOL_NONINTERACTIVE=1"
    
    local test_script=$(cat << 'EOF'
export CARPOOL_NONINTERACTIVE=1
source "$1"
result=$(ui_safe_read "default_value")
if [ "$result" = "default_value" ]; then
    echo "SUCCESS"
else
    echo "FAILED: Expected 'default_value', got '$result'"
    exit 1
fi
EOF
    )
    
    if run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "echo '$test_script' | bash -s '$UI_UTILS_PATH'" 2>/dev/null | grep -q "SUCCESS"; then
        test_pass "Non-interactive mode"
    else
        test_fail "Non-interactive mode" "Function did not use default in non-interactive mode"
    fi
}

# Test 3: Closed stdin (exec 0>&-)
test_closed_stdin() {
    test_start "Closed stdin handling"
    
    local test_script=$(cat << 'EOF'
source "$1"
exec 0>&-  # Close stdin
result=$(ui_safe_read "fallback_value")
if [ "$result" = "fallback_value" ]; then
    echo "SUCCESS"
else
    echo "FAILED: Expected 'fallback_value', got '$result'"
    exit 1
fi
EOF
    )
    
    if run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "echo '$test_script' | bash -s '$UI_UTILS_PATH'" 2>/dev/null | grep -q "SUCCESS"; then
        test_pass "Closed stdin handling"
    else
        test_fail "Closed stdin handling" "Function did not handle closed stdin properly"
    fi
}

# Test 4: Simulated EIO via /dev/null
test_simulated_eio() {
    test_start "Simulated EIO via /dev/null"
    
    local test_script=$(cat << 'EOF'
source "$1"
result=$(ui_safe_read "eio_fallback" < /dev/null)
if [ "$result" = "eio_fallback" ]; then
    echo "SUCCESS"
else
    echo "FAILED: Expected 'eio_fallback', got '$result'"
    exit 1
fi
EOF
    )
    
    if run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "echo '$test_script' | bash -s '$UI_UTILS_PATH'" 2>/dev/null | grep -q "SUCCESS"; then
        test_pass "Simulated EIO handling"
    else
        test_fail "Simulated EIO handling" "Function did not handle EIO condition properly"
    fi
}

# Test 5: Timeout behavior (should not hang longer than READ_TIMEOUT + 1s)
test_timeout_behavior() {
    test_start "Timeout behavior (max ${DEFAULT_READ_TIMEOUT}s + buffer)"
    
    local test_script=$(cat << 'EOF'
export READ_TIMEOUT=2  # Short timeout for testing
source "$1"
start_time=$(date +%s)
result=$(ui_safe_read "timeout_default")
end_time=$(date +%s)
duration=$((end_time - start_time))
if [ "$result" = "timeout_default" ] && [ $duration -le 4 ]; then
    echo "SUCCESS"
else
    echo "FAILED: Expected 'timeout_default', got '$result', duration=${duration}s"
    exit 1
fi
EOF
    )
    
    # Test should complete within READ_TIMEOUT + reasonable buffer (4s total)
    if run_with_timeout 5 "echo '$test_script' | bash -s '$UI_UTILS_PATH'" 2>/dev/null | grep -q "SUCCESS"; then
        test_pass "Timeout behavior"
    else
        test_fail "Timeout behavior" "Function took too long or didn't handle timeout correctly"
    fi
}

# Test 6: ui_prompt_with_validation normal case
test_prompt_validation_normal() {
    test_start "Prompt with validation - normal input"
    
    local test_script=$(cat << 'EOF'
source "$1"
result=$(echo "yes" | ui_prompt_with_validation "Choose: " "yes no" "Invalid choice" "no")
if [ "$result" = "yes" ]; then
    echo "SUCCESS"
else
    echo "FAILED: Expected 'yes', got '$result'"
    exit 1
fi
EOF
    )
    
    if run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "echo '$test_script' | bash -s '$UI_UTILS_PATH'" 2>/dev/null | grep -q "SUCCESS"; then
        test_pass "Prompt validation normal"
    else
        test_fail "Prompt validation normal" "Function did not validate input correctly"
    fi
}

# Test 7: ui_prompt_with_validation with non-interactive mode
test_prompt_validation_noninteractive() {
    test_start "Prompt with validation - non-interactive mode"
    
    local test_script=$(cat << 'EOF'
export CARPOOL_NONINTERACTIVE=1
source "$1"
result=$(ui_prompt_with_validation "Choose: " "yes no" "Invalid choice" "maybe")
if [ "$result" = "maybe" ]; then
    echo "SUCCESS"
else
    echo "FAILED: Expected 'maybe', got '$result'"
    exit 1
fi
EOF
    )
    
    if run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "echo '$test_script' | bash -s '$UI_UTILS_PATH'" 2>/dev/null | grep -q "SUCCESS"; then
        test_pass "Prompt validation non-interactive"
    else
        test_fail "Prompt validation non-interactive" "Function did not use fallback in non-interactive mode"
    fi
}

# Test 8: ui_ask_yes_no normal case
test_yes_no_normal() {
    test_start "Yes/No prompt - normal input"
    
    local test_script=$(cat << 'EOF'
source "$1"
if echo "n" | ui_ask_yes_no "Continue?"; then
    echo "FAILED: Expected false return for 'n'"
    exit 1
else
    echo "SUCCESS"
fi
EOF
    )
    
    if run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "echo '$test_script' | bash -s '$UI_UTILS_PATH'" 2>/dev/null | grep -q "SUCCESS"; then
        test_pass "Yes/No prompt normal"
    else
        test_fail "Yes/No prompt normal" "Function did not handle yes/no input correctly"
    fi
}

# Test 9: ui_ask_yes_no with closed stdin
test_yes_no_closed_stdin() {
    test_start "Yes/No prompt - closed stdin"
    
    local test_script=$(cat << 'EOF'
source "$1"
exec 0>&-  # Close stdin
if ui_ask_yes_no "Continue?" "Y"; then
    echo "SUCCESS"
else
    echo "FAILED: Expected true return for default 'Y'"
    exit 1
fi
EOF
    )
    
    if run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "echo '$test_script' | bash -s '$UI_UTILS_PATH'" 2>/dev/null | grep -q "SUCCESS"; then
        test_pass "Yes/No prompt closed stdin"
    else
        test_fail "Yes/No prompt closed stdin" "Function did not handle closed stdin with default properly"
    fi
}

# Test 10: Stress test - multiple rapid calls
test_stress_multiple_calls() {
    test_start "Stress test - multiple rapid calls"
    
    local test_script=$(cat << 'EOF'
export CARPOOL_NONINTERACTIVE=1
source "$1"
success_count=0
for i in {1..10}; do
    result=$(ui_safe_read "test$i")
    if [ "$result" = "test$i" ]; then
        success_count=$((success_count + 1))
    fi
done
if [ $success_count -eq 10 ]; then
    echo "SUCCESS"
else
    echo "FAILED: Only $success_count/10 calls succeeded"
    exit 1
fi
EOF
    )
    
    if run_with_timeout $((DEFAULT_READ_TIMEOUT + 5)) "echo '$test_script' | bash -s '$UI_UTILS_PATH'" 2>/dev/null | grep -q "SUCCESS"; then
        test_pass "Stress test multiple calls"
    else
        test_fail "Stress test multiple calls" "Function failed under multiple rapid calls"
    fi
}

# Test 11: Edge case - empty input with default
test_empty_input_with_default() {
    test_start "Empty input with default value"
    
    local test_script=$(cat << 'EOF'
source "$1"
result=$(echo "" | ui_safe_read "empty_default")
# Empty input should use the input (empty string), not the default
if [ -z "$result" ]; then
    echo "SUCCESS"
else
    echo "FAILED: Expected empty string, got '$result'"
    exit 1
fi
EOF
    )
    
    if run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "echo '$test_script' | bash -s '$UI_UTILS_PATH'" 2>/dev/null | grep -q "SUCCESS"; then
        test_pass "Empty input handling"
    else
        test_fail "Empty input handling" "Function did not handle empty input correctly"
    fi
}

# Test 12: Variable assignment test
test_variable_assignment() {
    test_start "Variable assignment functionality"
    
    local test_script=$(cat << 'EOF'
source "$1"
echo "assigned_value" | ui_safe_read "default" "test_var"
if [ "$test_var" = "assigned_value" ]; then
    echo "SUCCESS"
else
    echo "FAILED: Expected 'assigned_value', got '$test_var'"
    exit 1
fi
EOF
    )
    
    if run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "echo '$test_script' | bash -s '$UI_UTILS_PATH'" 2>/dev/null | grep -q "SUCCESS"; then
        test_pass "Variable assignment"
    else
        test_fail "Variable assignment" "Function did not assign variable correctly"
    fi
}

# Main test runner
main() {
    echo -e "${BLUE}Starting UI Utils Test Suite${NC}"
    echo "Testing file: $UI_UTILS_PATH"
    echo "Default READ_TIMEOUT: ${DEFAULT_READ_TIMEOUT}s"
    echo ""
    
    # Run all tests
    test_normal_interactive
    test_noninteractive_mode
    test_closed_stdin
    test_simulated_eio
    test_timeout_behavior
    test_prompt_validation_normal
    test_prompt_validation_noninteractive
    test_yes_no_normal
    test_yes_no_closed_stdin
    test_stress_multiple_calls
    test_empty_input_with_default
    test_variable_assignment
    
    # Summary
    echo ""
    echo -e "${BLUE}Test Summary:${NC}"
    echo "  Tests run: $TESTS_RUN"
    echo -e "  Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "  Failed: ${RED}$TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}Some tests failed!${NC}"
        exit 1
    fi
}

# Check if script is being sourced or executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
