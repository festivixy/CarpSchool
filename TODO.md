# TODO

- [x] IMPORTANT: fix how captcha are being validated on client-side.

**Vulnerability:** Client-side only CAPTCHA validation allows attackers to bypass bot protection
by directly calling server methods (e.g., `Accounts.forgotPassword()`) from browser
console or modified JavaScript, enabling automated attacks without solving CAPTCHAs.

[b1b6b42]

~~my idea to fix this is to return a work completion id if the captcha is valid, and that needed to be sent to the sever to verify, that you actually completed the captcha.~~

fixed with mongodb collection and session IDs. [319bfb6]

- [x] Implement the `accounts.email.send.verification` method in `AccountsMethods.js`. [0cbe7a43]
- [ ] Add school regions
- [x] Finish Modern look [???????]
- [x] Move Publications to their own files [f231132]
- [x] Move Methods to their own files [f231132]
- [x] Make captcha its own component [8756649]
- [x] OpenTilesMap server  [???????]
- [x] OpenTilesMap data auto download [9c7dcea]
- [x] Upload opentilesmap bundle to github release [0.0.1]


---

# builder.io section

- [x] Remove dots (nano texture) from LiquidGlass Footer and Navbar - causing lag [cc92558]
- [x] Make LiquidGlass Footer more mobile-friendly [854e897]
- [x] Remove "Carpool Test" text from LiquidGlass Navbar and Footer [854e897]
- [x] Update Footer links: Privacy Policy, Terms of Service to actual pages, replace "Cookie Policy" with "Credits" [854e897]
- [x] Create LiquidGlass TextInput component [422600a]
- [x] Use LiquidGlass TextInput in all LiquidGlass pages and components [f8d645d]
- [x] Create LiquidGlass IconButton component (circle button for 1 char/emoji) [422600a]
- [x] Change Footer link colors to black with underline (gray not visible enough) [854e897]
- [x] Change Dropdown text color to black [854e897]
- [x] Debug performance issues in LiquidGlass components (Firefox lag) [2b9837b]
- [x] **MAJOR PERF FIX**: Optimize LiquidGlass performance by reducing backdrop-filter layers [b64814a]
- [x] Create non-LiquidGlass FooterVerbose component [7e61bc1]
- [x] Create LiquidGlass login page at /_test/liquidglass/login [1cee28d]
- [x] Show place creator in PlaceManager.jsx [ed7d0ba]
- [x] Make captcha its own centralized component [8756649]
- [x] **Fixed legacy import references** [b29c8d0]
  - ✅ Updated `imports/ui/legacy/pages/ActiveRides.jsx` - Line 6: `import Ride from "/imports/ui/legacy/components/Ride";`
  - ✅ Updated `imports/ui/legacy/pages/ListRides.jsx` - Line 6: `import Ride from "/imports/ui/legacy/components/Ride";`
  - ✅ Updated `imports/ui/legacy/pages/UserDrive.jsx` - Line 6: `import Ride from "/imports/ui/legacy/components/Ride";`
  - ✅ Updated `imports/ui/legacy/pages/UserRide.jsx` - Line 7: `import Ride from "/imports/ui/legacy/components/Ride";`
  - ✅ Updated `imports/ui/legacy/pages/UserRide.jsx` - Line 8: `import JoinRideModal from "/imports/ui/legacy/components/JoinRideModal";`
- [x] **Fixed LiquidGlass SignIn button styling** [75a7c6d]
  - ✅ Added width: 100% to LiquidGlassButton in SignIn form for proper full-width layout
  - ✅ Button now matches regular SignIn button behavior with proper centering
  - ✅ LiquidGlass SignIn complete with proper component usage and styling

- [x] **TODO 7: Remove legacy chat functionality and direct messaging** [8493fdf, 0e1e7cc]
  - ✅ Removed "Create Chat" and "Join Chat" buttons from Chat page
  - ✅ Removed related modals and methods for standalone chat creation
  - ✅ Removed "Contact {rider}" buttons from ImDriving and MyRides pages
  - ✅ Added "Messages" link to user menus in both mobile and legacy navbars
  - ✅ Chat system now exclusively uses ride-specific chats, no more direct messaging
  - ✅ Updated empty chat state to indicate ride-based system

- [x] **TODO 8: Create PathMapView component for route finding** [9db9e49]
  - ✅ Created PathMapView.jsx component with OSRM routing integration
  - ✅ Takes start and end coordinates, finds route between two points
  - ✅ Uses OSRM API with reliable straight-line fallback system
  - ✅ Custom styled markers for start (A) and end (B) points
  - ✅ Displays route distance, duration, and visual path on map
  - ✅ Added PathMapView.js styled-components with glass morphism design
  - ✅ Integrated into TestMapView page with comprehensive testing interface
  - ✅ Includes responsive design, error handling, and loading states
  - ✅ Interactive controls for route management (find, clear, swap points)

# end # builder.io section
