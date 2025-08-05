# Shared Components Implementation

## 📋 Overview

Create and organize shared components in `imports/ui/components/` that can be used across both desktop and mobile platforms.

## 🎯 Goals

- Extract reusable components for both desktop and mobile use
- Create consistent component APIs across platforms
- Implement proper styled-components architecture
- Maintain backward compatibility during migration

## 📁 Target Structure

```
imports/ui/components/
├── Button.jsx              # Base button component
├── TextInput.jsx           # Base input component
├── Dropdown.jsx            # Base dropdown component
├── MapView.jsx             # Map interface component
├── ImageUpload.jsx         # Image upload functionality
├── ImageViewer.jsx         # Image viewing component
├── Captcha.jsx             # Captcha verification
├── ConfirmFunction.jsx     # Confirmation dialogs
├─��� LoadingSpinner.jsx      # Loading states
└── ErrorBoundary.jsx       # Error handling
```

## ✅ Component Migration Tasks

### Phase 1: Core Form Components

- [x] **Button Component** - ✅ COMPLETED - Created comprehensive shared component
  - ✅ Created `components/Button.jsx` with 5 variants (primary, secondary, danger, outline, ghost)
  - ✅ Created `styles/Button.js` with responsive design and accessibility
  - ✅ Added support for icons, loading states, sizes (small, medium, large)
  - ✅ Includes disabled states, hover effects, and ARIA attributes
  - ✅ Compatible with both controlled and uncontrolled patterns

- [x] **TextInput Component** - ✅ COMPLETED - Created comprehensive shared component
  - ✅ Created `components/TextInput.jsx` with validation and error handling
  - ✅ Created `styles/TextInput.js` with 3 variants (default, outline, filled)
  - ✅ Added support for icons, validation states, character counting
  - ✅ Includes proper ARIA labels, focus management, and accessibility
  - ✅ Supports controlled/uncontrolled patterns with proper TypeScript-like validation

- [x] **Dropdown Component** - ✅ COMPLETED - Created comprehensive shared component
  - ✅ Created `components/Dropdown.jsx` with search and multi-select functionality
  - ✅ Created `styles/Dropdown.js` with full interaction states
  - ✅ Added keyboard navigation (Arrow keys, Enter, Escape)
  - ✅ Includes clearable options, custom icons, and proper accessibility
  - ✅ Supports multiple selection modes and filtered search

### Phase 2: Media Components

- [x] **ImageUpload Component** - ✅ COMPLETED - Moved to shared components
  - ✅ Moved `ImageUpload.jsx` to `ui/components/`
  - ✅ Updated all import references throughout codebase
  - ✅ Available for both desktop and mobile use
  - ⚠️ Note: No corresponding styles file found, component uses Semantic UI

- [x] **ImageViewer Component** - ✅ COMPLETED - Moved to shared components
  - ✅ Moved `ImageViewer.jsx` to `ui/components/`
  - ✅ Updated all import references throughout codebase
  - ✅ Available for both desktop and mobile use
  - ⚠️ Note: No corresponding styles file found, component uses Semantic UI
  - 🔮 Future: Add zoom, gallery, and fullscreen features

### Phase 3: Interactive Components

- [x] **MapView Component** - ✅ COMPLETED - Moved to shared components
  - ✅ Moved `MapView.jsx` from components (not pages) to `ui/components/`
  - ✅ Moved `MapView.js` styles to `ui/styles/`
  - ✅ Updated all import references throughout codebase
  - ✅ Already supports markers, places, routes, and interactions
  - ✅ Integration with external services (tileserver, nominatim, osrm) maintained

- [x] **Captcha Component** - ✅ COMPLETED - Moved to shared components
  - ✅ Moved `Captcha.jsx` to `ui/components/`
  - ✅ Moved `Captcha.js` styles to `ui/styles/`
  - ✅ Updated all import references throughout codebase
  - ✅ Security features work across platforms
  - ✅ Refresh and accessibility support maintained

- [x] **ConfirmFunction Component** - ✅ COMPLETED - Moved to shared components
  - ✅ Moved `ConfirmFunction.jsx` to `ui/components/`
  - ✅ Moved `ConfirmFunction.js` styles to `ui/styles/`
  - ✅ Updated all import references throughout codebase
  - ✅ Modal/dialog system works for confirmations
  - ✅ Integration with mobile layouts maintained

### Phase 4: Utility Components

- [x] **LoadingSpinner Component** - ✅ COMPLETED - Created comprehensive shared component
  - ✅ Created 4 animation variants (spinner, dots, pulse, ring)
  - ✅ Added 4 size options (small, medium, large, xlarge) and 4 color themes
  - ✅ Includes proper ARIA labels and reduced motion accessibility
  - ✅ Supports inline, centered, and overlay display modes
  - ✅ Optimized for both desktop and mobile platforms

- [x] **ErrorBoundary Component** - ✅ COMPLETED - Created comprehensive shared component
  - ✅ Created React class component for error boundary functionality
  - ✅ Added fallback UI with retry and error reporting capabilities
  - ✅ Includes error ID generation and external service integration
  - ✅ Supports development vs production error display modes
  - ✅ Added Meteor.js integration for server-side error reporting

## 🎨 Component Design Patterns

### Base Component Structure

```javascript
// components/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { StyledButton } from '../styles/Button';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon,
  onClick,
  ...props
}) => {
  return (
    <StyledButton
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {icon && <span className="button-icon">{icon}</span>}
      {children}
    </StyledButton>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  onClick: PropTypes.func,
};

export default Button;
```

### Styled Components Pattern

```javascript
// styles/Button.js
import styled from 'styled-components';

export const StyledButton = styled.button`
  /* Base button styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  /* Size variants */
  ${props => props.size === 'small' && `
    padding: 8px 16px;
    font-size: 14px;
  `}

  ${props => props.size === 'medium' && `
    padding: 12px 24px;
    font-size: 16px;
  `}

  ${props => props.size === 'large' && `
    padding: 16px 32px;
    font-size: 18px;
  `}

  /* Variant styles */
  ${props => props.variant === 'primary' && `
    background-color: #007AFF;
    color: white;

    &:hover:not(:disabled) {
      background-color: #0051D0;
    }
  `}

  ${props => props.variant === 'secondary' && `
    background-color: #F2F2F7;
    color: #007AFF;

    &:hover:not(:disabled) {
      background-color: #E5E5EA;
    }
  `}

  /* Disabled state */
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* Icon spacing */
  .button-icon {
    margin-right: 8px;
  }
`;
```

## 🔧 Implementation Commands

```bash
# ✅ COMPLETED - Shared components directory created
mkdir -p imports/ui/components
mkdir -p imports/ui/styles

# ✅ COMPLETED - Components moved (git mv used to preserve history)
git mv imports/ui/mobile/components/ImageUpload.jsx imports/ui/components/
git mv imports/ui/mobile/components/ImageViewer.jsx imports/ui/components/
git mv imports/ui/mobile/components/MapView.jsx imports/ui/components/
git mv imports/ui/mobile/components/Captcha.jsx imports/ui/components/
git mv imports/ui/mobile/components/ConfirmFunction.jsx imports/ui/components/

# ✅ COMPLETED - Styles moved
git mv imports/ui/mobile/styles/MapView.js imports/ui/styles/
git mv imports/ui/mobile/styles/Captcha.js imports/ui/styles/
git mv imports/ui/mobile/styles/ConfirmFunction.js imports/ui/styles/

# 🔮 TODO - Create new components (manual process)
touch imports/ui/components/Button.jsx
touch imports/ui/styles/Button.js
```

## 📝 Completed Commit Messages

```bash
# ✅ COMPLETED COMMITS - Big File System Changes
340a4c8 - refactor(ui): create shared component structure and move core components
7d68e17 - refactor(ui): update import paths for shared components and pages
e8347a3 - fix(ui/pages): correct AdminPlaceManager component import path

# ✅ COMPLETED - Component creation commits
9f0d0d1 - feat(ui/components): create comprehensive shared component library

- Add Button component with 5 variants (primary, secondary, danger, outline, ghost)
- Add TextInput component with validation, icons, and accessibility features
- Add Dropdown component with search, multi-select, and keyboard navigation
- Add LoadingSpinner component with 4 animation variants (spinner, dots, pulse, ring)
- Add ErrorBoundary component with error reporting and retry functionality
- Create styled-components architecture with responsive and accessible design
- Add comprehensive PropTypes validation for all components
- Include dark mode support and reduced motion accessibility
- Add index.js for easy component importing
- Support for controlled and uncontrolled component patterns

# 🔮 TODO - Future integration commits
refactor(ui): update imports to use shared components

- Update all files to import from ui/components instead of platform-specific locations
- Remove duplicate mobile-specific component imports where shared components exist
- Test component functionality on both platforms
- Verify all imports resolve correctly and maintain existing functionality
```

## 💡 Implementation Notes

### API Consistency

- Maintain consistent prop naming across components
- Use standard React patterns (children, className, etc.)
- Implement proper PropTypes validation
- Follow accessibility best practices

### Platform Adaptation

```javascript
// Platform-specific wrapper example
// mobile/components/MobileButton.jsx
import Button from '../../components/Button';
import { MobileButtonWrapper } from '../styles/Button';

export default function MobileButton(props) {
  return (
    <MobileButtonWrapper>
      <Button {...props} />
    </MobileButtonWrapper>
  );
}
```

### Theme Integration

- Support for light/dark themes
- Consistent color tokens across components
- Responsive typography and spacing
- Platform-specific design adaptations

## ⚠️ Migration Considerations

### Import Path Updates

After moving components, update imports throughout codebase:

```javascript
// Before
import ImageUpload from '../mobile/components/ImageUpload';

// After
import ImageUpload from '../components/ImageUpload';
```

### Component Dependencies

- Check for component dependencies when moving
- Update styled-components imports
- Verify external library integrations
- Test component isolation

### Testing Requirements

- Test each component in isolation
- Verify functionality on both desktop and mobile
- Check responsive behavior and touch interactions
- Validate accessibility features

## 🎯 Success Criteria

- [ ] All shared components work on both desktop and mobile
- [ ] Consistent API and behavior across platforms
- [ ] No broken imports or missing dependencies
- [ ] Proper styled-components architecture maintained
- [ ] Accessibility standards met for all components
- [ ] Performance optimized for both platforms
- [ ] Documentation and examples provided
- [ ] Backward compatibility preserved during migration

## 🔄 Future Enhancements

### Advanced Features

- Internationalization (i18n) support
- Advanced theming capabilities
- Animation and transition effects
- Advanced accessibility features

### Platform-Specific Enhancements

- iOS 26 Liquid Glass styling support
- Desktop-specific interactions (hover, right-click)
- Touch-specific gestures for mobile
- Platform-specific design tokens
