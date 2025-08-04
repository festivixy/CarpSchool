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
├── LoadingSpinner.jsx      # Loading states
└── ErrorBoundary.jsx       # Error handling
```

## ✅ Component Migration Tasks

### Phase 1: Core Form Components

- [ ] **Button Component** - Extract from mobile implementation
  - Create `components/Button.jsx` with base functionality
  - Create `styles/Button.js` with default styling
  - Support for icons, variants, sizes, states
  - Maintain existing API compatibility

- [ ] **TextInput Component** - Extract from mobile implementation
  - Create `components/TextInput.jsx` with base functionality
  - Create `styles/TextInput.js` with default styling
  - Support for validation, types, placeholders, icons
  - Form integration and error handling

- [ ] **Dropdown Component** - Extract from mobile implementation
  - Create `components/Dropdown.jsx` with base functionality
  - Create `styles/Dropdown.js` with default styling
  - Support for search, multi-select, custom options
  - Keyboard navigation and accessibility

### Phase 2: Media Components

- [ ] **ImageUpload Component** - Move from mobile/components
  - Move `ImageUpload.jsx` to `ui/components/`
  - Move corresponding styles to `ui/styles/`
  - Update all import references
  - Test on both desktop and mobile

- [ ] **ImageViewer Component** - Move from mobile/components
  - Move `ImageViewer.jsx` to `ui/components/`
  - Move corresponding styles to `ui/styles/`
  - Add zoom, gallery, and fullscreen features
  - Ensure touch and mouse interaction support

### Phase 3: Interactive Components

- [ ] **MapView Component** - Move from mobile/pages
  - Move `MapView.jsx` to `ui/components/` (convert from page to component)
  - Create reusable map component with props for configuration
  - Support for markers, places, routes, and interactions
  - Integration with external services (tileserver, nominatim, osrm)

- [ ] **Captcha Component** - Move from mobile/components
  - Move `Captcha.jsx` to `ui/components/`
  - Move corresponding styles to `ui/styles/`
  - Ensure security features work across platforms
  - Add refresh and accessibility support

- [ ] **ConfirmFunction Component** - Move from mobile/components
  - Move `ConfirmFunction.jsx` to `ui/components/`
  - Create modal/dialog system for confirmations
  - Support for custom messages, actions, and styling
  - Integration with mobile and desktop layouts

### Phase 4: Utility Components

- [ ] **LoadingSpinner Component** - Create new shared component
  - Design consistent loading states
  - Support for different sizes and colors
  - Accessibility with proper ARIA labels
  - Integration with async operations

- [ ] **ErrorBoundary Component** - Create new shared component
  - React error boundary for graceful error handling
  - Fallback UI for component errors
  - Error reporting and logging integration
  - Development vs production error display

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
# Create shared components directory
mkdir -p imports/ui/components
mkdir -p imports/ui/styles

# Move components (use git mv to preserve history)
git mv imports/ui/mobile/components/ImageUpload.jsx imports/ui/components/
git mv imports/ui/mobile/styles/ImageUpload.js imports/ui/styles/

# Create new components (manual process)
touch imports/ui/components/Button.jsx
touch imports/ui/styles/Button.js
```

## 📝 Example Commit Messages

```bash
feat(ui/components): create shared Button component

- Add Button.jsx with variant, size, and icon support
- Create Button.js styles with primary/secondary variants
- Implement disabled states and hover effects
- Add PropTypes validation and accessibility features

refactor(ui/components): move ImageUpload to shared components

- Move ImageUpload.jsx from mobile/components to ui/components
- Move ImageUpload.js from mobile/styles to ui/styles
- Update all import statements across the codebase
- Component now available for both desktop and mobile use

feat(ui/components): create MapView shared component

- Extract MapView from mobile pages to reusable component
- Add props for configuration, markers, and interactions
- Integrate with tileserver, nominatim, and osrm services
- Support for both desktop and mobile layouts

refactor(ui): update imports to use shared components

- Update all files to import from ui/components
- Remove duplicate mobile-specific component imports
- Test component functionality on both platforms
- Verify all imports resolve correctly
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
