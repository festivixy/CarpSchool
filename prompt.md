You are working on a Meteor.js rideshare application with multi-rider
carpooling, interactive map-based place selection using
external services (tileserver.carp.school, nominatim.carp.school, osrm.carp.school),
UUID-based place references, modern mobile UI with styled-components,
and comprehensive test data generation. The codebase follows
imports/api/{collection}/{Methods,Publications}.js for backend,
imports/ui/mobile/{components,pages}/ for frontend, with places/rides
relational data structure and backward compatibility for legacy schemas.

### Package Manager:
- Uses `meteor` commands (not npm/yarn/pnpm)

### External Services:
- **TileServer**: `https://tileserver.carp.school` - OpenMapTiles server for map rendering
- **Nominatim**: `https://nominatim.carp.school` - Geocoding and address search service
- **OSRM**: `https://osrm.carp.school` - Open Source Routing Machine for route calculation
- **Note**: No proxy endpoints - services are accessed directly via external URLs

## IMPORTANT

### file locations

#### Mobile Components:
- **Mobile Components**: `app/imports/ui/mobile/components/` (includes MobileNavBarAuto)
- **Mobile Styles**: `app/imports/ui/mobile/styles/`
- **Mobile Pages**: `app/imports/ui/mobile/pages/`
- **Mobile Hooks**: `app/imports/ui/mobile/hooks/`
- **Mobile Utils**: `app/imports/ui/mobile/utils/`

#### Native iOS Components:
- **iOS Components**: `app/imports/ui/mobile/ios/components/` (includes NativeNavBar)
- **iOS Hooks**: `app/imports/ui/mobile/ios/hooks/`
- **iOS Styles**: `app/imports/ui/mobile/ios/styles/`

#### LiquidGlass Component Library:
- **Components**: `app/imports/ui/liquidGlass/components/`
- **Pages**: `app/imports/ui/liquidGlass/pages/`
- **Styles**: `app/imports/ui/liquidGlass/styles/`

#### Shared Components:
- **Shared Components**: `app/imports/ui/components/`
- **Shared Pages**: `app/imports/ui/pages/`
- **Shared Styles**: `app/imports/ui/styles/`

#### Desktop Components:
- **Desktop Components**: `app/imports/ui/desktop/components/`
- **Desktop Pages**: `app/imports/ui/desktop/pages/`
- **Desktop Styles**: `app/imports/ui/desktop/styles/`

#### Backend API:
- **API Collections**: `app/imports/api/{collection}/`
- **API Structure**: `{Collection}.js`, `{Collection}Methods.js`, `{Collection}Publications.js`

## COMMIT INSTRUCTIONS

- you are allowed to make multiple commits when i tell you to.
- always check git status before committing.
- one commit, per type of features ex: one commit per style change, one commit per component...
- use Bash command tool to run git commands.
- commit after each change. ## IMPORTANT ##
- `git add .` or `git add -A` is NOT ALLOWED.
- use `git add <file> [<other files>]` to add specific files (allow multiple).
- if the context of the change is unknown, use `git diff <file>` to see the changes
- if a file contains changes from multiple features, use `git add -p <file>` to interactively stage changes

### COMMIT MESSAGE FORMAT

Follow this format for consistent, professional commit messages:

#### **Structure:**

type(scope): brief description in present tense

- Detailed bullet point explaining what was done
- Another bullet point for additional changes
- Keep each bullet focused on one specific change
- Use action verbs (Add, Remove, Update, Fix, Refactor, etc.)
```

#### **Types:**
- **feat**: New features or functionality
- **fix**: Bug fixes
- **refactor**: Code changes that neither fix bugs nor add features
- **docs**: Documentation updates
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **lint**: Linting fixes or adjustments

#### **Scopes (examples):**
- **api**: Backend API changes
- **ui/mobile**: Mobile UI components
- **app**: General application changes
- **security**: Security-related changes
- **liquidGlass**: LiquidGlass component library changes
- **other**: Other scopes

#### **Examples from this project:**
```
feat(app/imports/ui/mobile): extract captcha styles to separate file

Refactor the Captcha component by extracting styled components into a new file `Captcha.js` under `app/imports/ui/mobile/styles`. This improves code organization and maintainability while keeping the main component clean and focused on functionality.
```

```
refactor(api): use centralized captcha component

- Removed captcha input fields and verification logic from SignIn, SignUp, and VerifyEmail pages
- Used `Captcha` component for handling captcha validation centrally
- Updated authentication flow to utilize the new captcha component
```

```
Convert LiquidGlass SignIn to use centralized captcha pattern

- Remove manual captcha state management (captchaInput, captchaSvg, captchaSessionId)
- Remove manual captcha generation methods (generateNewCaptcha, generateNewCaptchaKeepError)
- Add captchaRef using React.createRef() for centralized component access
- Update submit method to use captchaRef.current.verify() pattern like other pages
- Update LiquidGlassCaptcha usage to use ref and autoGenerate props
- Maintains same UI/UX but follows centralized captcha architecture
```

#### **Guidelines:**
1. **Subject line (50 chars max)**: Clear, imperative mood
2. **Body**: Explain WHAT and WHY, not HOW
3. **Use bullet points**: For multiple changes in one commit
4. **Be specific**: Mention file names, component names, function names
5. **Action verbs**: Add, Remove, Update, Fix, Refactor, Convert, Extract
6. **Present tense**: "Add feature" not "Added feature"

## Python Tools

### Reference Checker Script: `../tools/checkRefs.py`

A comprehensive Python tool for validating and fixing import/export references in the codebase.

#### **Features:**
- **Import Validation**: Detects broken import statements (including multi-line imports)
- **Export Detection**: Analyzes component exports and validates named/default imports
- **Circular Dependencies**: Finds circular import dependencies
- **Autofix**: Automatically fixes broken imports with `--fix` flag
- **Multi-line Support**: Handles complex import statements across multiple lines
- **Environment Detection**: Smart suggestions based on file exports
- **Re-checking**: Automatically re-runs checks after applying fixes

#### **Usage:**
```bash
# Check imports only
python ../tools/checkRefs.py --imports -v

# Check imports and automatically fix issues
python ../tools/checkRefs.py --imports --fix -v

# Run comprehensive check (imports + circular dependencies + suggestions)
python ../tools/checkRefs.py --all -v

# Run all checks with autofix
python ../tools/checkRefs.py --all --fix -v
```

#### **Key Capabilities:**
- **Self-reference Filtering**: Prevents files from importing themselves
- **Export Analysis**: Validates that imports match actual exports (e.g., `AddRidesModal` exists)
- **HOC Support**: Detects exports wrapped in `withRouter(withTracker()(Component))`
- **Path Resolution**: Suggests correct relative paths for broken imports
- **Development Integration**: Use `--fix` for automated import repair

#### **Example Output:**
```
[ERROR] imports/ui/components/Test.jsx:5 - Broken import: '../broken/path'
[AUTOFIX APPLIED] Fixed broken import '../broken/path' → './correct/Component'
🔄 Re-running checks after applying fixes...
✅ All import issues have been resolved!
```

## docker

- docker compose: docker-compose.yml
- use docker compose instead of docker-compose

# IMPORTANT

- all components, and pages use styled-components.
and have all the styled-components in separate
file at ../styles/name.js
- commit to git, after each changes. see "COMMIT INSTRUCTIONS"

## file tree

../
docker-compose.yml
console.log
builder.io.prompt
vulnerabilities.md

./imports/
├── api
│   ├── accounts
│   ├── captcha
│   ├── chat
│   ├── images
│   ├── places
│   ├── profile
│   ├── rateLimit
│   └── ride
├── startup
│   ├── client
│   └── server
└── ui
    ├── components       # Shared components (desktop + mobile)
    ├── desktop          # Desktop-specific components
    │   ├── components
    │   ├── pages
    │   └── styles
    ├── forms            # Form utilities and validation
    ├── layouts          # App layout components
    ├── liquidGlass      # LiquidGlass component library
    │   ├── components
    │   ├── pages
    │   └── styles
    ├── mobile           # Mobile-specific components
    │   ├── components   # Mobile components (includes MobileNavBarAuto)
    │   ├── hooks        # Mobile-specific React hooks
    │   ├── ios          # Native iOS components
    │   │   ├── components
    │   │   ├── hooks
    │   │   └── styles
    │   ├── pages        # Mobile page components
    │   ├── styles       # Mobile styled-components
    │   └── utils        # Mobile utility functions
    ├── pages            # Shared pages (desktop + mobile)
    ├── styles           # Shared styled-components
    └── test             # Test components and utilities
        ├── pages
        └── styles

./plugins/
├── cordova-plugin-floating-toolbar    # Native iOS 26 Liquid Glass floating toolbars
│   ├── src
│   │   ├── android                    # Android implementation
│   │   └── ios                        # iOS Swift implementation
│   └── www                           # JavaScript interface
├── cordova-plugin-liquid-blur         # Native iOS 26 Liquid Glass blur effects
│   ├── src
│   │   ├── android                    # Android implementation
│   │   └── ios                        # iOS UIVisualEffectView implementation
│   └── www                           # JavaScript interface
└── cordova-plugin-native-navbar       # Native iOS navigation bar
    ├── src
    │   └── ios                        # iOS UITabBar implementation
    └── www                           # JavaScript interface

# meteor is running. use

``` shell
osascript ../tools/read_terminal.applescript | tail -50
```

to read logs

to run commands in term,

``` shell
osascript ../tools/write_terminal.applescript "command"
```

your grep tool is broken. use grep with bash. 