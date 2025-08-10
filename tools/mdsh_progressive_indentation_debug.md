# mdsh.py Progressive Indentation Bug - Debugging Summary

## Problem Description

**Bug**: Progressive indentation in pty mode where each line gets increasingly indented:
```
hi        (0 spaces)
  hi      (2 spaces)  
    hi    (4 spaces)
      hi  (6 spaces)
```

**Pattern**: Consistent +1 space per line (not related to content length)

## Current Status

- ❌ **Pty mode**: Progressive indentation persists
- ✅ **Test mode**: Works perfectly with `--test` flag

## Investigation Results

### 1. **ANSIProcessor Analysis**
- ✅ **State Management**: `reset_state()` called correctly at start of `process_ansi_sequences()`
- ✅ **Fresh Instances**: Multiple fresh ANSIProcessor instances created per line
- ✅ **Input Processing**: Correctly processes `'hi\r\n'` → `'hi\n'`
- ✅ **Debug Verification**: Internal state shows correct cursor positions `(0, 1)`

### 2. **Data Flow Analysis**
```
Raw pty output: 'hi\r\nhi\r\nhi\r\n' (correct)
↓
Line splitting: ['hi\r', 'hi\r', 'hi\r'] (correct)
↓
render_text() input: 'hi\r\n' (correct)
↓
ANSIProcessor output: 'hi\n' (correct)
↓
Final output: Progressive indentation (INCORRECT)
```

### 3. **Attempted Fixes**

#### Fix 1: Fresh ANSIProcessor for Real-time Updates
```python
# Line 574 - Applied but wrong code path
fresh_processor = ANSIProcessor()
processed = fresh_processor.process_ansi_sequences(self.buffer)
```
**Result**: No effect (echo commands use "Process complete lines" path)

#### Fix 2: Rich Console Bypass
```python
# Tested raw stdout.write()
sys.stdout.write(processed_text)
sys.stdout.flush()
```
**Result**: Progressive indentation persists

#### Fix 3: Complete Rich Console Bypass
```python
# Tested bypassing entire render_text() method
processed = temp_line_processor.process_ansi_sequences(line + '\n')
sys.stdout.write(processed)
```
**Result**: Progressive indentation still occurs

### 4. **Code Structure Analysis**

#### Function Definitions Check
```bash
grep -n "^[[:space:]]*def " mdsh.py | cut -d: -f2 | sed 's/def //' | cut -d'(' -f1 | sort | uniq -c
```
**Result**: No duplicate function definitions found

#### Critical Method Calls
- `process_ansi_sequences()`: 3 calls, all using fresh instances
- `render_text()`: 2 calls (pty mode + test mode)
- `write_text()`: 2 calls (internal ANSIProcessor usage)

### 5. **Execution Path Analysis**

#### Test Mode (Working)
```
subprocess.run() → split lines → render_text() → ANSIProcessor → output
```

#### Pty Mode (Broken)
```
pty data → buffer accumulation → line splitting → render_text() → ANSIProcessor → output
```

**Key Difference**: Buffer management and real-time processing in pty mode

## Ruled Out Causes

1. ✅ **ANSIProcessor state accumulation** - Fresh instances created
2. ✅ **Rich Console state** - Raw stdout shows same issue
3. ✅ **Variable shadowing** - No duplicate function definitions
4. ✅ **Import conflicts** - No monkey patching detected
5. ✅ **Class-level state** - No accumulating instance variables
6. ✅ **Input data corruption** - Raw pty output is correct
7. ✅ **Processing logic** - ANSIProcessor works correctly

## Remaining Theories

1. **Pty Terminal State**: Some terminal state accumulation at the pty level
2. **Buffer Processing**: Subtle issue in buffer splitting/processing logic
3. **Cursor Positioning**: Terminal cursor not resetting between outputs
4. **Rich Console Interaction**: Complex interaction with terminal emulation

## Workaround

Use test mode for debugging and verification:
```bash
./mdsh.py --test "echo 'hi' && echo 'hi' && echo 'hi'"
```

## Files Changed

- `mdsh.py`: Added fresh ANSIProcessor for real-time updates (line 574)
- Git commit: `ea7bf42` - "fix(tools): attempt to resolve progressive indentation in pty mode"

## Test Commands

### Reproduce Bug (Pty Mode)
```bash
./mdsh.py "echo 'a' && echo 'b' && echo 'c'"
```

### Verify Fix (Test Mode)
```bash
./mdsh.py --test "echo 'a' && echo 'b' && echo 'c'"
```

### AppleScript Testing
```bash
osascript write_terminal.applescript "cd /path/to/tools && ./mdsh.py \"command\""
osascript read_terminal.applescript
```

## Next Steps

1. **Deep Pty Analysis**: Investigate pty buffer management and terminal state
2. **Minimal Reproduction**: Create minimal test case isolating the issue
3. **Alternative Approaches**: Consider different pty handling strategies
4. **Terminal Emulation**: Test in different terminal environments

## Debug Tools Used

- `write_terminal.applescript` - Execute commands in real terminal
- `read_terminal.applescript` - Read terminal output
- Raw pty output analysis with Python
- Systematic function definition analysis
- Data flow tracing with debug prints

---

**Last Updated**: Current debugging session
**Status**: Bug persists, workaround available via test mode
