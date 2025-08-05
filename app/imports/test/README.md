# Reference Checker Test Files

This directory contains test files designed to validate the reference checker's ability to detect various types of import/export errors.

## Test Files

### `broken-file-imports.js`
Tests detection of:
- Broken relative imports (`./non-existent-file`)
- Broken absolute imports (`/imports/ui/fake/component`)
- Missing directories
- Files with wrong extensions

**Expected Errors:** 6 broken file imports

### `broken-named-imports.js`
Tests detection of:
- Named imports from files that don't export those names
- Wrong names from index.js files
- Mixed valid/invalid named imports

**Expected Errors:** 4 broken named imports

### `missing-packages.js`
Tests detection of:
- Non-existent npm packages
- Missing scoped packages
- Validates that built-in Node.js modules are not flagged
- Validates that Meteor packages are not flagged

**Expected Errors:** 6 missing packages

### `mixed-errors.jsx`
Tests the checker's ability to distinguish between valid and invalid imports in the same file.

**Expected Errors:** 6 total (2 file imports + 2 named imports + 2 package imports)

### `index-file-errors.js`
Tests index file resolution and named import validation from directories.

**Expected Errors:** 3 total

### `circular-imports-a.js` & `circular-imports-b.js`
Tests circular dependency detection between two files that import from each other.

**Expected Errors:** 1 circular dependency detected

### `valid-target.js`
A valid file that exports several items, used as a target for testing named import validation.

**Expected Errors:** 0

## Running Tests

To test the reference checker against these files:

```bash
# Check all types of errors
python ../tools/checkRefs.py --imports --verbose

# Check only specific issues
python ../tools/checkRefs.py --imports
python ../tools/checkRefs.py --circular

# Expected total errors: ~22 errors across all test files
```

## Expected Results Summary

When the reference checker runs against these test files, it should detect:

- **Broken file imports:** ~6-8 errors
- **Broken named imports:** ~6-8 errors  
- **Missing packages:** ~6 errors
- **Circular dependencies:** 1 error

The checker should NOT flag:
- Valid imports to existing files
- Built-in Node.js modules (fs, path, crypto)
- Meteor packages (meteor/meteor)
- Valid named imports from files that actually export them
- npm packages that exist in package.json
