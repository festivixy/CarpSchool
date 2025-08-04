# Carp.School Todos Directory

This directory contains organized todo lists for the Carp.School rideshare application development.

## 📁 Directory Structure

Each major feature or refactor has its own dedicated todo file:

- `big-file-system-changes.md` - UI structure reorganization
- `ios26-liquid-glass.md` - iOS 26 Liquid Glass design system
- `mobile-navbar.md` - Mobile navigation bar implementation
- `shared-components.md` - Shared components between desktop/mobile
- `authentication-pages.md` - Authentication flow pages
- `map-integration.md` - Map and location features
- `admin-features.md` - Administrative functionality
- `native-integration.md` - Native iOS integration
- `testing-deployment.md` - Testing and deployment tasks

## 📋 How to Use

### Adding New Todos

1. Create a new `.md` file with a descriptive name
2. Use the template structure from existing files
3. Include specific tasks with checkboxes
4. Add commit message examples
5. Update this README with the new file

### Working on Todos

1. Pick a todo file to work on
2. Follow the tasks in order
3. Check off completed items
4. Commit changes following the guidelines in `GUIDELINES.md`
5. Update progress in the main `../TODO.md` file

### Todo File Structure

Each todo file should include:

```markdown
# Feature Name

## 📋 Overview
Brief description of what this todo covers

## 🎯 Goals
- Goal 1
- Goal 2

## ✅ Tasks
- [ ] Task 1
- [ ] Task 2

## 💡 Implementation Notes
Technical notes and considerations

## 🔧 Example Commands
```bash
# Example commands
```

## 📝 Commit Examples
```bash
feat(scope): add feature
- Detail about the change
```
```

### Tracking Progress

todos/PROGRESS.md
- Use GitHub issues or project boards to track todo file progress
- Update main TODO.md with links to completed sections
- Archive completed todo files to a `completed/` subdirectory

## 🔄 Workflow

1. **Plan** - Review todo file and understand requirements
2. **Implement** - Follow tasks step by step
3. **Test** - Verify functionality works as expected
4. **Commit** - Follow git guidelines for each change
5. **Update** - Mark tasks as complete and update progress

## 📚 Reference

See `GUIDELINES.md` for:
- Project architecture patterns
- Git commit guidelines
- Code style requirements
- Development best practices
