#!/bin/bash

# Regression test suite for ui-utils.sh
# Tests critical behaviors: stdin conditions, timeout handling, and function reliability
# Usage: ./test_ui_utils_regression.sh

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

# Function to run a test with timeout protection (never hangs > READ_TIMEOUT+1s)
run_with_timeout() {
    local timeout_duration="$1"
    shift
    local test_command="$@"
    
    # Use timeout command to prevent hanging beyond acceptable limits
    timeout "$timeout_duration" bash -c "$test_command"
    return $?
}

# Test 1: Normal interactive call (mocked with <<<)
test_normal_interactive_mocked() {
    test_start "Normal interactive call (mocked with <<<)"
    
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
#!/bin/bash
source "$1"
# Mock interactive input using here-string
result=$(ui_safe_read "default_value" <<< "user_input")
echo "RESULT:$result"
EOF
    
    local output
    if output=$(run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "bash '$temp_script' '$UI_UTILS_PATH'" 2>/dev/null); then
        if echo "$output" | grep -q "RESULT:user_input"; then
            test_pass "Normal interactive input"
        else
            test_fail "Normal interactive input" "Expected 'user_input', got: $output"
        fi
    else
        test_fail "Normal interactive input" "Command failed or timed out"
    fi
    
    rm -f "$temp_script"
}

# Test 2: Closed stdin (exec 0>&-)
test_closed_stdin() {
    test_start "Closed stdin handling (exec 0>&-)"
    
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
#!/bin/bash
source "$1"
exec 0>&-  # Close stdin
result=$(ui_safe_read "fallback_value" 2>/dev/null)
echo "RESULT:$result"
EOF
    
    local output
    if output=$(run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "bash '$temp_script' '$UI_UTILS_PATH'" 2>/dev/null); then
        if echo "$output" | grep -q "RESULT:fallback_value"; then
            test_pass "Closed stdin handling"
        else
            test_fail "Closed stdin handling" "Expected 'fallback_value', got: $output"
        fi
    else
        test_fail "Closed stdin handling" "Command failed or timed out"
    fi
    
    rm -f "$temp_script"
}

# Test 3: Simulated EIO via /dev/null
test_simulated_eio() {
    test_start "Simulated EIO via /dev/null"
    
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
#!/bin/bash
source "$1"
# Redirect stdin from /dev/null to simulate EIO-like condition
result=$(ui_safe_read "eio_fallback" < /dev/null 2>/dev/null)
echo "RESULT:$result"
EOF
    
    local output
    if output=$(run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "bash '$temp_script' '$UI_UTILS_PATH'" 2>/dev/null); then
        if echo "$output" | grep -q "RESULT:eio_fallback"; then
            test_pass "Simulated EIO handling"
        else
            test_fail "Simulated EIO handling" "Expected 'eio_fallback', got: $output"
        fi
    else
        test_fail "Simulated EIO handling" "Command failed or timed out"
    fi
    
    rm -f "$temp_script"
}

# Test 4: Timeout behavior - must not hang > READ_TIMEOUT+1s
test_timeout_behavior() {
    test_start "Timeout behavior (max ${DEFAULT_READ_TIMEOUT}+1s)"
    
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
export READ_TIMEOUT=3  # Short timeout for testing
source "$1"
start_time=$(date +%s)
# Create a situation where read would wait for input
result=$(ui_safe_read "timeout_default" < <(sleep 10) 2>/dev/null)
end_time=$(date +%s)
duration=$((end_time - start_time))
echo "RESULT:$result"
echo "DURATION:$duration"
EOF
    
    local output
    local test_timeout=$((3 + 2))  # READ_TIMEOUT + buffer
    if output=$(run_with_timeout "$test_timeout" "bash '$temp_script' '$UI_UTILS_PATH'" 2>/dev/null); then
        local result=$(echo "$output" | grep "RESULT:" | cut -d: -f2)
        local duration=$(echo "$output" | grep "DURATION:" | cut -d: -f2)
        
        if [ "$result" = "timeout_default" ] && [ "$duration" -le 4 ]; then
            test_pass "Timeout behavior"
        else
            test_fail "Timeout behavior" "Result: '$result', Duration: ${duration}s (expected ≤4s)"
        fi
    else
        test_fail "Timeout behavior" "Test itself timed out or failed"
    fi
    
    rm -f "$temp_script"
}

# Test 5: Non-interactive mode
test_noninteractive_mode() {
    test_start "Non-interactive mode (CARPOOL_NONINTERACTIVE=1)"
    
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
export CARPOOL_NONINTERACTIVE=1
source "$1"
result=$(ui_safe_read "noninteractive_default" 2>/dev/null)
echo "RESULT:$result"
EOF
    
    local output
    if output=$(run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "bash '$temp_script' '$UI_UTILS_PATH'" 2>/dev/null); then
        if echo "$output" | grep -q "RESULT:noninteractive_default"; then
            test_pass "Non-interactive mode"
        else
            test_fail "Non-interactive mode" "Expected 'noninteractive_default', got: $output"
        fi
    else
        test_fail "Non-interactive mode" "Command failed or timed out"
    fi
    
    rm -f "$temp_script"
}

# Test 6: ui_ask_yes_no with closed stdin
test_yes_no_closed_stdin() {
    test_start "ui_ask_yes_no with closed stdin"
    
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
source "$1"
exec 0>&-  # Close stdin
if ui_ask_yes_no "Continue?" "Y" 2>/dev/null; then
    echo "RESULT:true"
else
    echo "RESULT:false"
fi
EOF
    
    local output
    if output=$(run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "bash '$temp_script' '$UI_UTILS_PATH'" 2>/dev/null); then
        if echo "$output" | grep -q "RESULT:true"; then
            test_pass "ui_ask_yes_no closed stdin"
        else
            test_fail "ui_ask_yes_no closed stdin" "Expected 'true', got: $output"
        fi
    else
        test_fail "ui_ask_yes_no closed stdin" "Command failed or timed out"
    fi
    
    rm -f "$temp_script"
}

# Test 7: ui_prompt_with_validation in non-interactive mode
test_prompt_validation_noninteractive() {
    test_start "ui_prompt_with_validation non-interactive"
    
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
export CARPOOL_NONINTERACTIVE=1
source "$1"
result=$(ui_prompt_with_validation "Choose:" "option1 option2" "Invalid" "option1" 2>/dev/null)
echo "RESULT:$result"
EOF
    
    local output
    if output=$(run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "bash '$temp_script' '$UI_UTILS_PATH'" 2>/dev/null); then
        if echo "$output" | grep -q "RESULT:option1"; then
            test_pass "ui_prompt_with_validation non-interactive"
        else
            test_fail "ui_prompt_with_validation non-interactive" "Expected 'option1', got: $output"
        fi
    else
        test_fail "ui_prompt_with_validation non-interactive" "Command failed or timed out"
    fi
    
    rm -f "$temp_script"
}

# Test 8: Multiple rapid calls (stress test)
test_multiple_rapid_calls() {
    test_start "Multiple rapid calls stress test"
    
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
export CARPOOL_NONINTERACTIVE=1
source "$1"
success_count=0
for i in {1..5}; do
    result=$(ui_safe_read "test$i" 2>/dev/null)
    if [ "$result" = "test$i" ]; then
        success_count=$((success_count + 1))
    fi
done
echo "SUCCESS_COUNT:$success_count"
EOF
    
    local output
    if output=$(run_with_timeout $((DEFAULT_READ_TIMEOUT + 5)) "bash '$temp_script' '$UI_UTILS_PATH'" 2>/dev/null); then
        local success_count=$(echo "$output" | grep "SUCCESS_COUNT:" | cut -d: -f2)
        if [ "$success_count" = "5" ]; then
            test_pass "Multiple rapid calls"
        else
            test_fail "Multiple rapid calls" "Only $success_count/5 calls succeeded"
        fi
    else
        test_fail "Multiple rapid calls" "Command failed or timed out"
    fi
    
    rm -f "$temp_script"
}

# Test 9: Variable assignment functionality
test_variable_assignment() {
    test_start "Variable assignment functionality"
    
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
source "$1"
ui_safe_read "assigned_value" "test_var" <<< "input_value" 2>/dev/null
echo "RESULT:$test_var"
EOF
    
    local output
    if output=$(run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "bash '$temp_script' '$UI_UTILS_PATH'" 2>/dev/null); then
        if echo "$output" | grep -q "RESULT:input_value"; then
            test_pass "Variable assignment"
        else
            test_fail "Variable assignment" "Expected 'input_value', got: $output"
        fi
    else
        test_fail "Variable assignment" "Command failed or timed out"
    fi
    
    rm -f "$temp_script"
}

# Test 10: Hang prevention test - critical timeout enforcement
test_hang_prevention() {
    test_start "Hang prevention (critical timeout enforcement)"
    
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
export READ_TIMEOUT=2
source "$1"
start_time=$(date +%s)
# This should timeout and not hang
result=$(ui_safe_read "hang_prevention" < <(sleep 30) 2>/dev/null)
end_time=$(date +%s)
duration=$((end_time - start_time))
echo "RESULT:$result"
echo "DURATION:$duration"
EOF
    
    local output
    # Test must complete within READ_TIMEOUT + 1 second buffer
    local max_test_time=4
    if output=$(run_with_timeout "$max_test_time" "bash '$temp_script' '$UI_UTILS_PATH'" 2>/dev/null); then
        local result=$(echo "$output" | grep "RESULT:" | cut -d: -f2)
        local duration=$(echo "$output" | grep "DURATION:" | cut -d: -f2)
        
        if [ "$result" = "hang_prevention" ] && [ "$duration" -le 3 ]; then
            test_pass "Hang prevention"
        else
            test_fail "Hang prevention" "Result: '$result', Duration: ${duration}s (expected ≤3s)"
        fi
    else
        test_fail "Hang prevention" "Test took too long or failed - this indicates hanging behavior"
    fi
    
    rm -f "$temp_script"
}

# Test 11: Edge case - function behavior with no default
test_no_default_fallback() {
    test_start "No default fallback behavior"
    
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
source "$1"
exec 0>&-  # Close stdin
# Call without default - should fail gracefully
if ui_safe_read "" 2>/dev/null; then
    echo "RESULT:unexpected_success"
else
    echo "RESULT:expected_failure"
fi
EOF
    
    local output
    if output=$(run_with_timeout $((DEFAULT_READ_TIMEOUT + 2)) "bash '$temp_script' '$UI_UTILS_PATH'" 2>/dev/null); then
        if echo "$output" | grep -q "RESULT:expected_failure"; then
            test_pass "No default fallback"
        else
            test_fail "No default fallback" "Expected failure, got: $output"
        fi
    else
        test_fail "No default fallback" "Command failed or timed out"
    fi
    
    rm -f "$temp_script"
}

# Test 12: Return sane defaults test
test_sane_defaults() {
    test_start "Return sane defaults in all error conditions"
    
    local temp_script=$(mktemp)
    cat > "$temp_script" << 'EOF'
source "$1"
test_count=0
success_count=0

# Test 1: Closed stdin with default
exec 0>&- 2>/dev/null
result=$(ui_safe_read "sane_default1" 2>/dev/null)
test_count=$((test_count + 1))
if [ "$result" = "sane_default1" ]; then
    success_count=$((success_count + 1))
fi

# Test 2: Non-interactive mode
export CARPOOL_NONINTERACTIVE=1
result=$(ui_safe_read "sane_default2" 2>/dev/null)
test_count=$((test_count + 1))
if [ "$result" = "sane_default2" ]; then
    success_count=$((success_count + 1))
fi

# Test 3: Timeout condition
export READ_TIMEOUT=1
result=$(ui_safe_read "sane_default3" < <(sleep 5) 2>/dev/null)
test_count=$((test_count + 1))
if [ "$result" = "sane_default3" ]; then
    success_count=$((success_count + 1))
fi

echo "RESULTS:$success_count/$test_count"
EOF
    
    local output
    if output=$(run_with_timeout 10 "bash '$temp_script' '$UI_UTILS_PATH'" 2>/dev/null); then
        local results=$(echo "$output" | grep "RESULTS:" | cut -d: -f2)
        if [ "$results" = "3/3" ]; then
            test_pass "Sane defaults"
        else
            test_fail "Sane defaults" "Only $results tests returned sane defaults"
        fi
    else
        test_fail "Sane defaults" "Command failed or timed out"
    fi
    
    rm -f "$temp_script"
}

# Main test runner
main() {
    echo -e "${YELLOW}=== UI Utils Regression Test Suite ===${NC}"
    echo "Testing file: $UI_UTILS_PATH"
    echo "Default READ_TIMEOUT: ${DEFAULT_READ_TIMEOUT}s"
    echo "Focus: stdin conditions, timeout behavior, hang prevention"
    echo ""
    
    # Run all critical tests
    test_normal_interactive_mocked
    test_closed_stdin
    test_simulated_eio
    test_timeout_behavior
    test_noninteractive_mode
    test_yes_no_closed_stdin
    test_prompt_validation_noninteractive
    test_multiple_rapid_calls
    test_variable_assignment
    test_hang_prevention
    test_no_default_fallback
    test_sane_defaults
    
    # Summary
    echo ""
    echo -e "${YELLOW}=== Test Summary ===${NC}"
    echo "  Tests run: $TESTS_RUN"
    echo -e "  Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "  Failed: ${RED}$TESTS_FAILED${NC}"
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ All regression tests passed!${NC}"
        echo -e "${GREEN}Functions handle stdin conditions properly and never hang > READ_TIMEOUT+1s${NC}"
        exit 0
    else
        echo ""
        echo -e "${RED}❌ Some regression tests failed!${NC}"
        echo -e "${RED}Review failed tests for potential issues with stdin handling or timeout behavior${NC}"
        exit 1
    fi
}

# Check if script is being sourced or executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
