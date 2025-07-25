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
- [x] Create non-LiquidGlass FooterVerbose component [7e61bc1]
- [x] Create LiquidGlass login page at /_test/liquidglass/login [1cee28d]
- [x] Show place creator in PlaceManager.jsx [ed7d0ba]
- [x] Make captcha its own centralized component [8756649]

## Legacy Import References to Fix

- [x] **Fixed legacy import references** [b29c8d0]
  - ✅ Updated `imports/ui/legacy/pages/ActiveRides.jsx` - Line 6: `import Ride from "/imports/ui/legacy/components/Ride";`
  - ✅ Updated `imports/ui/legacy/pages/ListRides.jsx` - Line 6: `import Ride from "/imports/ui/legacy/components/Ride";`
  - ✅ Updated `imports/ui/legacy/pages/UserDrive.jsx` - Line 6: `import Ride from "/imports/ui/legacy/components/Ride";`
  - ✅ Updated `imports/ui/legacy/pages/UserRide.jsx` - Line 7: `import Ride from "/imports/ui/legacy/components/Ride";`
  - ✅ Updated `imports/ui/legacy/pages/UserRide.jsx` - Line 8: `import JoinRideModal from "/imports/ui/legacy/components/JoinRideModal";`

No references to "/imports/ui/pages" were found.

# end # builder.io section
