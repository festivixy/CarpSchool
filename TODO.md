# Carp School App - TODO List

> **Overall Assessment**: 8/10 - Production-ready with focused improvements needed.
>
> The app has a **strong architectural foundation** with impressive native iOS integration. Focus areas: security hardening, performance optimization, UX polish, and code quality improvements.

---

## 🐛 Critical Bugs to Fix

### Build System Issues
- [x] ~~**FIXED**: Inconsistent path variable usage in `meteor-utils.sh` - Replaced `$pathpwd` with `$(pwd)`~~ (d521a5f, 56f0456)

### App Startup Race Condition
- [x] ~~**FIXED**: `imports/startup/client/Startup.jsx` - Added proper state management for deviceready events to prevent double-rendering~~
- [x] ~~**Priority**: High~~

```javascript
// TODO: Fix this problematic code:
setTimeout(() => {
  if (!deviceReadyFired) {
    console.warn("deviceready event did not fire within 10 seconds, rendering app anyway");
    deviceReadyFired = true;
    renderApp();
  }
}, 10000);
```

### useEffect Cleanup
- [x] ~~**FIXED**: LiquidGlass Dropdown setTimeout cleanup~~
- [ ] **Audit**: Review remaining components for potential memory leaks
- [ ] **Priority**: Medium (most components already have proper cleanup)

---

## 🔒 Security Vulnerabilities

### External Service Protection
- [x] ~~**IMPLEMENTED**: Rate limiting - Nominatim (30r/m), OSRM /route/* (1r/s), Tileserver (100r/s)~~
- [x] ~~**IMPLEMENTED**: Enhanced caching - Tiles (1 week), OSRM (15m), Nominatim (5m)~~
- [x] ~~**IMPLEMENTED**: Security headers and nginx hardening~~
- [ ] **Future**: API key validation system (optional enhancement)
- [x] ~~**Priority**: High~~ ✅ **COMPLETED** (4ac4897)

### Input Validation & XSS Prevention
- [ ] **File**: `imports/api/places/Places.js`
- [ ] **Enhance**: Place name validation beyond length checks
- [ ] **Add**: Content sanitization to prevent XSS
- [ ] **Priority**: High

```javascript
// TODO: Enhance validation
text: Joi.string().required().min(1).max(100)
  .pattern(/^[a-zA-Z0-9\s\-,.()]+$/) // Allow only safe characters
  .label("Location Name"),
```

### Data Logic Validation
- [ ] **File**: `imports/api/ride/Rides.js`
- [ ] **Add**: Maximum riders validation vs. seats limit
- [ ] **Ensure**: Logical consistency in ride capacity
- [ ] **Priority**: Medium

---

## 🎨 UX/UI Improvements

### Loading States & Feedback
- [x] ~~**IMPLEMENTED**: MyRides skeleton loading component with shimmer animation~~
- [x] ~~**CREATED**: SkeletonComponentsTest page for testing and demonstration~~
- [ ] **Extend**: Add skeleton components for other pages (Chat, Profile, etc.)
- [ ] **Standardize**: Replace remaining basic loading spinners
- [ ] **Priority**: Medium ✅ **Partially Complete** (e2d21bc, 47a7058)

### Error Handling UX
- [ ] **Replace**: Technical error messages with user-friendly ones
- [ ] **Add**: Error recovery action buttons
- [ ] **Implement**: Graceful degradation for network errors
- [ ] **Priority**: High

### Offline Experience
- [ ] **Implement**: Service worker for offline functionality
- [ ] **Add**: Offline state detection and messaging
- [ ] **Create**: Offline fallbacks for critical features
- [ ] **Priority**: Medium

### Accessibility Compliance
- [ ] **Add**: ARIA attributes to styled components
- [ ] **Implement**: Visible focus indicators for all interactive elements
- [ ] **Audit**: Color contrast in LiquidGlass components
- [ ] **Test**: Screen reader compatibility
- [ ] **Priority**: Medium-High

---

## ⚡ Performance Optimizations

### Map Service Optimization
- [ ] **Add**: Request debouncing for search API calls
- [ ] **Implement**: Result caching for repeated queries
- [ ] **Files**: `InteractiveMapPicker.jsx`, route calculation components
- [ ] **Priority**: High

```javascript
// TODO: Replace immediate API calls with debounced version
const response = await fetch(`https://nominatim.carp.school/search?q=${encodeURIComponent(searchQuery)}`);
```

### React Performance
- [ ] **Implement**: `React.memo` for expensive components
- [ ] **Add**: `useMemo` and `useCallback` optimizations
- [ ] **Target**: Map components and ride lists
- [ ] **Priority**: Medium

### Bundle Size Optimization
- [ ] **Implement**: Code splitting for map libraries
- [ ] **Add**: Dynamic imports for heavy components
- [ ] **Optimize**: Asset loading and compression
- [ ] **Priority**: Medium

---

## 🔧 Code Quality Improvements

### Error Handling Standardization
- [ ] **Standardize**: Error handling patterns across codebase
- [ ] **Implement**: Centralized error reporting system
- [ ] **Add**: Consistent try-catch block structure
- [ ] **Priority**: Medium

### Type Safety & Validation
- [ ] **Add**: Missing PropTypes to all components
- [ ] **Files**: Mobile and LiquidGlass components
- [ ] **Implement**: Runtime type checking
- [ ] **Priority**: Medium

### Code Cleanup
- [ ] **Remove**: Unused imports and dead code
- [ ] **Tool**: Configure ESLint with unused-imports rule
- [ ] **Clean**: Commented code blocks
- [ ] **Priority**: Low

### Naming & Style Consistency
- [ ] **Establish**: Naming convention guidelines
- [ ] **Fix**: camelCase vs kebab-case inconsistencies
- [ ] **Standardize**: Component and file naming patterns
- [ ] **Priority**: Low

---

## 🚀 Feature Enhancements

### Progressive Web App (PWA)
- [ ] **Create**: Web app manifest
- [ ] **Add**: Service worker for caching
- [ ] **Implement**: Push notifications for ride updates
- [ ] **Enable**: App installation prompts
- [ ] **Priority**: High

### Advanced Routing Features
- [ ] **Enhance**: Multi-stop route optimization
- [ ] **Integrate**: Advanced OSRM service features
- [ ] **Add**: Alternative route suggestions
- [ ] **Priority**: Medium

### Real-time Enhancements
- [ ] **Add**: Live location tracking for drivers
- [ ] **Implement**: Real-time ETA updates
- [ ] **Create**: Live ride status notifications
- [ ] **Priority**: Medium

### Analytics & Monitoring
- [ ] **Integrate**: User behavior analytics
- [ ] **Add**: Performance monitoring (bundle size, load times)
- [ ] **Implement**: Error tracking (consider Sentry)
- [ ] **Create**: Usage metrics dashboard
- [ ] **Priority**: Medium

---

## 📱 Mobile-Specific Improvements

### Native iOS Enhancements
- [ ] **Add**: More UIKit-style components
- [ ] **Implement**: Haptic feedback integration
- [ ] **Handle**: Background app refresh scenarios
- [ ] **Priority**: Medium

### Android Platform Support
- [ ] **Create**: Android-specific UI components
- [ ] **Implement**: Material Design compliance
- [ ] **Optimize**: Android performance and UX
- [ ] **Priority**: Low

### Mobile Performance
- [ ] **Optimize**: Bundle size for mobile networks
- [ ] **Implement**: Progressive image loading
- [ ] **Add**: Offline content caching
- [ ] **Priority**: Medium

---

## 🧪 Testing Implementation

### Unit Testing
- [ ] **Setup**: Jest testing framework
- [ ] **Add**: Utility function tests
- [ ] **Implement**: Component testing with React Testing Library
- [ ] **Priority**: High

### Integration Testing
- [ ] **Test**: API endpoint functionality
- [ ] **Add**: Map component integration tests
- [ ] **Verify**: Cross-component interactions
- [ ] **Priority**: Medium

### End-to-End Testing
- [ ] **Setup**: E2E testing framework (Playwright or Cypress)
- [ ] **Test**: Critical user flows (signup, ride creation, joining)
- [ ] **Automate**: Regression testing
- [ ] **Priority**: Medium

### Performance Testing
- [ ] **Monitor**: Bundle size changes
- [ ] **Test**: Runtime performance metrics
- [ ] **Benchmark**: API response times
- [ ] **Priority**: Medium

---

## 📊 Implementation Timeline

### 🚨 Immediate (1-2 weeks)
- [x] ~~Fix build system issues~~
- [ ] Fix deviceready race condition
- [ ] Add request debouncing for map services
- [ ] Security audit and input validation

### ⏰ Short-term (1 month)
- [ ] Implement rate limiting for external services
- [ ] Standardize loading states and error messages
- [ ] Add comprehensive PropTypes validation
- [ ] Accessibility improvements

### 📅 Medium-term (2-3 months)
- [ ] PWA implementation
- [ ] Performance optimizations
- [ ] Offline handling
- [ ] Testing framework setup

### 🎯 Long-term (3-6 months)
- [ ] Advanced routing features
- [ ] Analytics and monitoring
- [ ] Enhanced mobile integrations
- [ ] Code quality automation

---

## 📝 Notes

- **Architecture**: Excellent foundation with clean separation of concerns
- **Styling**: Well-organized styled-components architecture
- **Native Integration**: Impressive iOS-specific features
- **External Services**: Smart use of self-hosted infrastructure
- **Code Quality**: Generally high with good patterns

**Next Steps**: Focus on security hardening and performance optimization before adding new features.

# 🔧 **Username to User ID Conversion Plan**

## **Files and Features Requiring Conversion**

### **🚗 Ride System**
- **`imports/api/ride/Rides.js`**
  - `driver` field: Change from username string to user ID
  - `riders` array: Change from username strings to user ID strings
  - Update JOI schema comments

- **`imports/api/ride/RideMethods.js`**
  - `rides.remove` - Driver verification: `ride.driver !== user.username` → `ride.driver !== user._id`
  - `rides.join` - Rider checks: `ride.riders.includes(user.username)` → `ride.riders.includes(user._id)`
  - `rides.joinRide` - Rider addition: `$push: { riders: user.username }` → `$push: { riders: user._id }`
  - `rides.leaveRide` - Rider removal: `$pull: { riders: user.username }` → `$pull: { riders: user._id }`
  - `rides.removeRider` - Driver verification and rider checks

- **`imports/api/ride/RidePublications.js`**
  - `Rides` publication: Filter `{ driver: currentUser.username }` → `{ driver: currentUser._id }`
  - Rider filter: `{ riders: currentUser.username }` → `{ riders: currentUser._id }`

### **💬 Chat System**
- **`imports/api/chat/ChatPublications.js`**
  - Chat participants: `Participants: currentUser.username` → `Participants: currentUser._id`
  - Driver verification: `ride.driver === currentUser.username` → `ride.driver === currentUser._id`
  - Rider verification: `ride.riders.includes(currentUser.username)` → `ride.riders.includes(currentUser._id)`

- **`imports/api/chat/ChatMethods.js`**
  - `chats.create` - Participant checks and driver/rider verification
  - `chats.sendMessage` - Sender field: `Sender: currentUser.username` → `Sender: currentUser._id`
  - Participant validation: `chat.Participants.includes(currentUser.username)` → `chat.Participants.includes(currentUser._id)`

### **📍 Places System**
- **`imports/api/places/PlacesPublications.js`**
  - Ride filtering: `{ driver: currentUser.username }` → `{ driver: currentUser._id }`
  - Rider filtering: `{ riders: currentUser.username }` → `{ riders: currentUser._id }`

### **🎯 UI Components**
- **`imports/ui/components/AddRides.jsx`**
  - Driver assignment: `driver: Meteor.user().username` → `driver: Meteor.user()._id`

- **`imports/ui/components/Ride.jsx`**
  - `isCurrentUserDriver()`: `ride.driver === Meteor.user().username` → `ride.driver === Meteor.user()._id`
  - Rider checks: `riders.includes(currentUser.username)` → `riders.includes(currentUser._id)`
  - Legacy rider check: `rider === currentUser.username` → `rider === currentUser._id`
  - Status display filtering

- **`imports/ui/mobile/ios/pages/CreateRide.jsx`**
  - Driver assignment: `driver: Meteor.user().username` → `driver: Meteor.user()._id`

### **📱 UI Display & Navigation**
- **`imports/ui/desktop/components/NavBar.jsx`**
  - Current user display: Update to use username for display only, not identification

- **`imports/ui/mobile/components/MobileNavBarCSS.jsx`**
  - Current user display: Update to use username for display only

- **`imports/ui/mobile/pages/Onboarding.jsx`**
  - Current user tracking: Update withTracker patterns

- **`imports/ui/pages/EditProfile.jsx`**
  - Current user tracking: Update withTracker patterns

### **📊 Error Reporting**
- **`imports/api/errorReport/ErrorReportMethods.js`**
  - `updatedBy: currentUser.username` → `updatedBy: currentUser._id`

### **🔧 Migration Requirements**

#### **Database Schema Updates:**
- **Rides Collection:**
  - Migrate `driver` field from usernames to user IDs
  - Migrate `riders` array from usernames to user IDs

- **Chat Collections:**
  - Migrate `Participants` from usernames to user IDs  
  - Migrate `Sender` field from usernames to user IDs

- **Error Reports:**
  - Migrate `updatedBy` from usernames to user IDs

#### **New Helper Methods Needed:**
- **Username Resolution Service:** Create centralized service to convert user IDs to usernames for display
- **Migration Script:** Data conversion script to update existing records
- **Validation Updates:** Update all JOI schemas and validation rules

#### **Testing Requirements:**
- **Backward Compatibility:** Ensure no data loss during migration
- **Chat Functionality:** Verify chat participants and messaging work with user IDs
- **Ride Management:** Verify ride creation, joining, and management with user IDs
- **Publications:** Verify all publications filter correctly with user IDs

### **⚠️ High Priority Items:**
1. **Rides collection schema change** (affects core functionality)
2. **Chat system conversion** (affects real-time messaging)
3. **UI component updates** (affects user interactions)
4. **Publications filtering** (affects data access)

### **📝 Implementation Order:**
1. **Backend API changes** (methods, publications, schemas)
2. **Database migration script**
3. **UI component updates**
4. **Testing and validation**
5. **Cleanup and optimization**

---

## **Problem Context:**
The app currently has a **fundamental inconsistency** where:
- **Rides collection** uses usernames for driver/riders identification
- **RideSession collection** uses user IDs for driver/riders identification
- **Username can be emails** (with dots), causing MongoDB field name errors
- **Mixed identification systems** throughout the codebase

This conversion will eliminate MongoDB field name issues and create a consistent identification system throughout the application.

---

## **Benefits After Conversion:**
- ✅ **Consistent identification** across all collections and components
- ✅ **No MongoDB dot notation errors** with email-based usernames
- ✅ **Better data integrity** with user ID references
- ✅ **Improved performance** with indexed user ID lookups
- ✅ **Simplified user management** and display logic
