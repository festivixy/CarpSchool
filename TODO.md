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
- [ ] Make captcha its own component
- [x] OpenTilesMap server  [???????]
- [ ] OpenTilesMap data auto download
- [x] Upload opentilesmap bundle to github release [0.0.1]


---

# builder.io section

# end # builder.io section