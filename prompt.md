You are working on a Meteor.js rideshare application with multi-rider
carpooling, interactive map-based place selection using
tileserver proxy, UUID-based place references, modern mobile
UI with styled-components, and comprehensive test data generation
the codebase follows imports/api/{collection}/{Methods,Publications}.js
for backend, imports/ui/mobile/{components,pages}/ for frontend,
with places/rides relational data structure and backward compatibility
for legacy schemas.

### Package Manager:
- Uses `meteor` commands (not npm/yarn/pnpm)

## IMPORTANT

### file locations

- normal components: app/imports/ui/mobile/components
- normal styles app/imports/ui/mobile/styles
- pages: app/imports/ui/mobile/pages

LiquidGlass Component Library Location:
- **Components**: `app/imports/ui/mobile/liquidGlass/components/`
- **Styles**: `app/imports/ui/mobile/liquidGlass/styles/`

## COMMIT INSTRUCTIONS

- you are allowed to make multiple commits when i tell you to.
- always check git status before committing.
- one commit, per type of change ex: one commit per style change, one commit per component...
- use Bash command tool to run git commands.
- commit after each change. ## IMPORTANT ##

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
│   └── ride
├── startup
│   ├── client
│   └── server
└── ui
    ├── forms
    ├── layouts
    └── mobile
        ├── components
        ├── liquidGlass
        │   ├── components
        │   ├── pages
        │   └── styles
        ├── pages
        ├── styles
        └── utils
