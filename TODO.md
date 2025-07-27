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

## Security Fixes

- [x] **TODO 9: Fix V007: XSS Vulnerability in CAPTCHA Display** [4d4ac17]
  - ✅ Added DOMPurify sanitization to all CAPTCHA components
  - ✅ Replaced dangerous dangerouslySetInnerHTML with sanitized SVG content
  - ✅ Fixed XSS vulnerability in mobile/components/Captcha.jsx, liquidGlass/components/Captcha.jsx, and legacy/pages/Signin.jsx
  - ✅ Prevents XSS attacks through malicious SVG injection while maintaining SVG functionality

- [x] **TODO 10: Fix V008: Insecure Publications Exposing All Data** [c62faed]
  - ✅ Fixed critical data exposure in Rides publication
  - ✅ Filter rides by user participation instead of exposing all data
  - ✅ Only publish rides where user is driver or rider
  - ✅ Prevents unauthorized access to other users' ride data and GDPR compliance issues

- [x] **TODO 11: Fix V004: Insufficient Input Sanitization** [b56f9d9]
  - ✅ Added comprehensive validation for share code input type and format
  - ✅ Remove all non-alphanumeric characters except valid hyphens
  - ✅ Reject codes with suspicious patterns (multiple hyphens, invalid lengths)
  - ✅ Added regex validation to ensure proper XXXX-XXXX format
  - ✅ Prevents potential injection attacks through malformed share codes

- [x] **TODO 12: Fix V010: Timing Attack in CAPTCHA Validation** [aea2f49]
  - ✅ Implement constant-time evaluation in isCaptchaSolved function
  - ✅ Always perform database lookup regardless of session existence
  - ✅ Add random delay to further obfuscate timing differences
  - ✅ Fix race condition in useCaptcha with atomic update operation
  - ✅ Prevents CAPTCHA session enumeration through timing analysis

- [x] **TODO 13: Fix V013: Missing File Type Validation in Image Upload** [a1fb7d8]
  - ✅ Install file-type package for server-side file signature detection
  - ✅ Add validation using magic bytes/file signatures, not just MIME types
  - ✅ Validate client-provided MIME type matches detected file type
  - ✅ Add file extension validation from filename
  - ✅ Prevent malicious file uploads disguised as images
  - ✅ Support only JPEG, PNG, GIF, and WebP image formats

- [x] **TODO 14: Fix V015: Captcha Brute Force Vulnerability** [506515e]
  - ✅ Mark CAPTCHA session as used when incorrect code is entered
  - ✅ Prevents unlimited guessing attempts on same CAPTCHA session
  - ✅ Forces users to generate new CAPTCHA after failed attempt
  - ✅ Addresses medium-severity brute force vulnerability while preserving user experience

- [x] **TODO 15: Mark V016: Server-Side Request Forgery (SSRF) as intentional** [a91000b]
  - ✅ Add security documentation for all proxy endpoints (tileserver, nominatim, osrm)
  - ✅ Explicitly mark SSRF exposure as intentionally accepted risk
  - ✅ Document that proxy functionality is required for application features
  - ✅ Risk mitigation: Proxies only forward to known internal services with fixed hostnames

- [x] **TODO 16: Fix V018: Missing Input Sanitization in Chat Messages** [ada6171]
  - ✅ Install jsdom for server-side DOM manipulation with DOMPurify
  - ✅ Add sanitizeChatContent function to prevent XSS in chat messages
  - ✅ Remove all HTML tags from chat content while preserving text
  - ✅ Add content length validation (max 1000 characters)
  - ✅ Validate sanitized content is not empty before storing
  - ✅ Prevents stored XSS attacks via malicious chat messages

# end # builder.io section
