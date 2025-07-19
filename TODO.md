# TODO

[ ] - IMPORTANT: fix how captcha are being validated on client-side.

**Vulnerability:** Client-side only CAPTCHA validation allows attackers to bypass bot protection
by directly calling server methods (e.g., `Accounts.forgotPassword()`) from browser
console or modified JavaScript, enabling automated attacks without solving CAPTCHAs.

~~my idea to fix this is to return a work completion id if the captcha is valid, and that needed to be sent to the sever to verify, that you actually completed the captcha.~~

fixed with mongodb collection and session IDs.

only implemented for Login, Register, and Send Verify Email.

[ ] - Implement the `accounts.email.send.verification` method in `AccountsMethods.js`.
[ ] - Add school regions
[ ] - Finish Modern look
[ ] - Move Publications to their own files
[ ] - Move Methods to their own files
[ ] - Make captcha its own component
