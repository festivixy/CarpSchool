# Carp.School Development Tools

This directory contains utility scripts for maintaining and validating the codebase.

## 🔍 checkRefs.py

Comprehensive reference checker for React/Meteor codebase. Validates import statements, component exports, and file references after refactoring.

### Features

- ✅ **Broken Import Detection** - Finds imports that point to non-existent files
- ✅ **Circular Dependency Detection** - Finds circular import chains
- ✅ **Fix Suggestions** - Suggests alternative import paths for broken references
- ✅ **Component Export Validation** - Checks component exports and usage
- ✅ **Meteor-Aware** - Understands Meteor package imports and project structure

### Usage

```bash
# Run all checks (recommended)
python checkRefs.py

# Run specific checks
python checkRefs.py --imports      # Check import statements only
python checkRefs.py --circular     # Check for circular dependencies only

# Options
python checkRefs.py --verbose      # Show detailed output
python checkRefs.py --fix          # Show fix suggestions
python checkRefs.py --root ../app  # Specify different root directory
```

### Example Output

```
🔍 Starting comprehensive reference check...

[ERROR] imports/ui/mobile/pages/ComponentsTest.jsx:31 - Broken import: '../components/FooterVerbose'
[WARNING] Circular dependency: imports/ui/components/A.jsx → imports/ui/components/B.jsx → imports/ui/components/A.jsx

============================================================
📊 REFERENCE CHECK SUMMARY
============================================================
❌ Errors: 1
⚠️  Warnings: 1
💡 Suggestions: 1

🔧 Found issues that may need attention.
```

### When to Use

- ✅ After moving/renaming components or files
- ✅ During refactoring sessions
- ✅ Before committing major structural changes
- ✅ When setting up CI/CD validation
- ✅ After updating import paths in bulk

### Integration

Add to your development workflow:

```bash
# Pre-commit hook
python tools/checkRefs.py

# CI/CD pipeline
python tools/checkRefs.py --verbose
```

The tool is designed to catch common issues that arise during the kind of refactoring work we do with React components and Meteor projects.
