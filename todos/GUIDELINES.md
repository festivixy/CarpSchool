# Carp.School Development Guidelines

## 🚗 Project Overview

**Meteor.js rideshare application** with multi-rider carpooling, interactive map-based place selection, UUID-based place references, modern mobile UI with styled-components, and comprehensive features.

## 🏗️ Architecture Patterns

### Backend Structure
- **Collections**: `imports/api/{collection}/{Collection}.js`
- **Methods**: `imports/api/{collection}/{Collection}Methods.js`  
- **Publications**: `imports/api/{collection}/{Collection}Publications.js`
- **Schema**: SimpleSchema with Joi validation

### Frontend Structure (New Organization)
- **Shared Components**: `imports/ui/components/` - Components used on both desktop and mobile
- **Shared Pages**: `imports/ui/pages/` - Pages used on both desktop and mobile  
- **Shared Styles**: `imports/ui/styles/` - Styles used on both desktop and mobile
- **Mobile-Only**: `imports/ui/mobile/` - Mobile-specific components (navbar, etc.)
- **Desktop-Only**: `imports/ui/desktop/` - Desktop-specific components (footer, etc.)
- **iOS 26**: `imports/ui/mobile/ios26/` - iOS 26 Liquid Glass implementation

### Styling Architecture
- **All components use styled-components**
- **Separate style files** in `../styles/ComponentName.js` format
- **Theme consistency** across components
- **Component + Style separation** maintained

## 🌐 External Services (Direct Access)

- **TileServer**: `https://tileserver.carp.school` - OpenMapTiles for map rendering
- **Nominatim**: `https://nominatim.carp.school` - Geocoding and address search
- **OSRM**: `https://osrm.carp.school` - Route calculation

## 📦 Package Management

- **Primary**: `meteor` commands (not npm/yarn/pnpm)
- **Examples**: `meteor add-platform ios`, `meteor run ios-device`
- **Dependencies**: Added via `meteor add package-name`

## 📝 Git Commit Guidelines (MANDATORY)

### Commit After Each Change
**EVERY change must be committed immediately after completion**

### Commit Message Format
```
type(scope): brief description in present tense

- Detailed bullet point explaining what was done
- Another bullet point for additional changes  
- Use action verbs (Add, Remove, Update, Fix, Refactor)
```

### Commit Types
- **feat**: New features or functionality
- **fix**: Bug fixes
- **refactor**: Code changes that neither fix bugs nor add features
- **docs**: Documentation updates
- **style**: Code style changes (formatting, etc.)
- **lint**: Linting fixes

### Commit Rules
- ✅ `git add <specific-files>` (multiple files allowed)
- ❌ `git add .` or `git add -A` NOT ALLOWED
- ✅ Check `git status` before committing
- ✅ One commit per logical change type
- ✅ Descriptive commit messages with bullet points

### Example Commit Messages
```bash
feat(ui/mobile): add iOS 26 liquid glass navbar

- Create floating navigation bar with system blur effects
- Add 44x44pt touch targets with proper spacing
- Implement bottom-edge positioning for iPhone
- Add auto-hide behavior on scroll and keyboard

refactor(ui/components): move Button to shared components

- Move Button.jsx from mobile/components to ui/components
- Update all imports to use new shared location
- Maintain existing component API and functionality
- Update tests to reflect new file structure

fix(api/rides): correct ride matching algorithm

- Fix bug where rides with same destination weren't matching
- Add proper UUID comparison for place references
- Update ride query to handle multiple riders correctly
```

## 🎨 Design System Guidelines

### iOS 26 Liquid Glass Design
- **Touch Targets**: Minimum 44×44pt
- **Spacing**: 8pt grid system
- **Blur Effects**: System materials (thin/thick/ultra-thin)
- **Icons**: SF Symbols monochrome
- **Surfaces**: Floating glass with proper underlap

### Component Guidelines
- **Reusability**: Components should work across desktop/mobile
- **API Consistency**: Maintain existing props and behavior
- **Accessibility**: Follow WCAG guidelines
- **Performance**: Optimize for mobile devices

## 🔧 Development Commands

### File Operations
```bash
# Create directories
mkdir -p imports/ui/components

# Move files (preserving git history)
git mv oldfile newfile

# Remove files
rm -rf file-or-directory
```

### Development Commands
```bash
# Start development server
meteor --no-release-check --settings ../config/settings.development.json --port 3001

# Run linting
meteor npm run lint

# Fix linting issues
meteor npm run fixlint

# Build for production
meteor build ../build --architecture os.linux.x86_64 --server-only
```

### iOS Development
```bash
# Add iOS platform
meteor add-platform ios

# Run on iOS device
meteor run ios-device

# Run on iOS simulator
meteor run ios
```

## ⚠️ Important Rules

### Never Modify
- **builder-registry** directory
- Core Meteor packages without explicit need

### Always Use
- **styled-components** for all styling
- **Component + Style separation**
- **Specific git adds** (never `git add .`)
- **Descriptive commit messages**

### Code Quality
- **No TODO comments** - Use todo files instead
- **No placeholder code** - Implement fully
- **Proper error handling**
- **TypeScript-style prop validation** with PropTypes

## 🐳 Docker Guidelines

- **Command**: Use `docker compose` (not `docker-compose`)
- **Config**: `docker-compose.yml` in project root
- **Environment**: Development settings in `../config/settings.development.json`

## 📱 Mobile-Specific Guidelines

### iOS Human Interface Guidelines
- Follow Apple's HIG strictly for iOS 26 implementation
- Use native iOS patterns and behaviors
- Implement proper safe area handling
- Add haptic feedback where appropriate

### Responsive Design
- Mobile-first approach
- Touch-friendly interface design
- Proper keyboard handling
- Orientation support

## 🧪 Testing Guidelines

### Test Strategy
- Component unit tests
- Integration tests for API methods
- End-to-end tests for critical user flows
- Performance testing on target devices

### Test Organization
- Tests in `__tests__` directories
- Mock external services appropriately
- Test both success and error cases

## 📚 Documentation Requirements

### Code Documentation
- JSDoc comments for complex functions
- PropTypes for all React components
- README files for major features
- API documentation for methods

### User Documentation
- Feature usage guides
- Setup and installation instructions
- Troubleshooting guides
- Deployment documentation

## 🚀 Deployment Guidelines

### Build Process
- Test thoroughly before deployment
- Use production settings
- Verify all external service integrations
- Check mobile platform compatibility

### Release Process
- Version tagging with semantic versioning
- Changelog updates
- App Store submission requirements
- Performance monitoring setup

## 💡 Best Practices

### Performance
- Lazy load components where possible
- Optimize images and assets
- Use efficient data structures
- Monitor memory usage on mobile

### Security
- Validate all user inputs
- Use secure authentication practices
- Protect API endpoints appropriately
- Follow OWASP guidelines

### Maintainability
- Keep functions small and focused
- Use meaningful variable names
- Implement proper error boundaries
- Write self-documenting code
