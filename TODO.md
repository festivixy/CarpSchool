# TODO

Outstanding work on CarpSchool, roughly in the order I would do it. Each item
says what is wrong, where, and what "done" looks like, so it can be picked up
cold.

Last reviewed: 2026-09-20.

This file previously held the username-to-user-ID conversion log, which was
finished work rather than outstanding work; it is archived at
[docs/username-to-userid-conversion.md](docs/username-to-userid-conversion.md).

---

## 1. Blocking launch

### Email and DNS

Nothing about mail is configured. Verified 2026-09-20 against `1.1.1.1`:
`carpschool.com` returns **zero** MX records (control: `gmail.com` returns 5),
no SPF TXT, no DMARC.

- [ ] **MX records.** `contact@carpschool.com` currently bounces. That address
      is printed in the footer of every page, in `/guide`, in the Terms, and as
      the Privacy Officer contact — so every route we give people to reach us
      is dead. Any host will do: Workspace, Fastmail, or a forwarder to a
      personal inbox.
- [ ] **SPF, then DMARC.** With neither, anyone can send mail that appears to
      come from `@carpschool.com` to parents at our schools, and nothing marks
      it as forged. Start DMARC at `p=none` to collect reports before
      enforcing.
- [ ] **Set `MAIL_URL` in Railway.** The plumbing already exists —
      `server/main.js` warns at startup when it is unset, `docker-compose.yml`
      passes it through, `DEPLOY.md` documents it. Nobody has set it. Until
      then school-email verification and the account emails silently do
      nothing. Check the deploy log for `MAIL_URL not set` to confirm.
- [ ] **DKIM / custom sending domain in Clerk**, at the same time as the live
      keys below.

### Clerk is running on test keys

- [ ] **Swap `pk_test`/`sk_test` for live keys.** Production serves
      `pk_test_...`, which is why **"Development mode" is printed on the
      sign-in and sign-up cards for every visitor**. Also blocks filming the
      walkthrough video cleanly.

### Legal

- [ ] **Fill the bracketed placeholders in `imports/api/legal/terms.js`** —
      `[CONTACT EMAIL]` (lines 275, 306), `[WEBSITE]` (307),
      `[NAME OR POSITION]` and `[PRIVACY EMAIL]` (309, 442). The file's own
      header comment says these must be filled before publishing, and they are
      live right now.
- [ ] **Have a lawyer read the Terms and Privacy Policy.** They were rewritten
      on 2026-09-19 for a high-school audience: minors, guardian consent, the
      graduated-licence passenger restriction. That rewrite made the documents
      describe the product honestly, which is necessary but not sufficient.
      Minors plus vehicles plus a platform disclaiming liability is specialist
      territory, and the graduated-licensing rules differ by jurisdiction.
- [ ] **Terms re-acceptance.** `TERMS_VERSION` moved to `2026-09-19` but
      nothing re-prompts anyone. Acceptance is recorded on the profile at
      onboarding only, so every existing account is still recorded against the
      old 19-plus text. For a change this material there should be a gate.

### School web filters

Schools run Securly, GoGuardian, Lightspeed, Iboss or Cisco Umbrella. They do
not block a site for being harmful so much as for being **uncategorised**,
which every new domain is until somebody classifies it. A student on school
wifi then hits a block page and concludes the app is broken.

The crawling half is fixed: the page had zero characters of body text and no
description, so anything that does not run JavaScript had nothing to read.
It now carries a description, Open Graph tags, JSON-LD naming the audience as
students, parents and school administrators, and a noscript block describing
the service and linking the guide, help, FAQ, privacy and terms.

What is left is submission, and it is slow enough to start before onboarding a
school:

- [ ] **Submit the domain for categorisation** to each vendor's public request
      form: Securly, GoGuardian, Lightspeed, Iboss, Cisco Umbrella/Talos,
      Symantec/Broadcom WebPulse, Fortinet, Palo Alto. Ask for *Education* or
      *Transportation*. Not Social Networking -- the messaging feature invites
      that reading, and it is the category schools block hardest.
- [ ] **Register the domain in Google Search Console.** Without it there is no
      warning if Safe Browsing ever flags us, and no route to appeal.
- [ ] **Add allowlisting to school onboarding.** One line asking their IT to
      permit carpschool.com will save more support email than anything else
      here.

Two items elsewhere in this list make a bad categorisation more likely: the
Clerk "Development mode" banner reads as an unfinished or spoofed page to a
human reviewer, and having no SPF or DMARC lowers domain reputation with the
same systems that feed these classifications.

### Map provider

- [ ] **Stop using `tile.openstreetmap.org` in production.** `config/settings.json`
      points at the public OSM tile server, whose usage policy forbids this.
      Either self-host (the Cordova config already references
      `tileserver.carp.school`, which does not exist) or pay a provider.

---

## 2. Follows from the parent-signup change

Anyone can now create an account; an account with no school reaches nothing
until a student claims it. Consequences not yet handled:

- [ ] **No rate limiting on sign-up.** A bad address used to bounce at the
      door; now it creates a row. `RegistrationRateLimits.js` covers
      `schoolEmail.sendVerificationCode` but not account creation.
- [ ] **An admin view for unclaimed accounts.** Nobody can currently see
      accounts with no `schoolId`. Build this *before* automating any cleanup:
      the right threshold depends on whether this is a trickle or a flood.
- [ ] **Then decide an archiving policy.** Note that "30 days of inactivity"
      is the wrong trigger — for a parent waiting to be claimed, inactivity is
      the correct state. Measure from creation, only for school-less accounts,
      soft-archive rather than delete (deleting the Meteor user leaves the
      Clerk account, so they silently reappear on next sign-in), and email once
      before archiving.
- [ ] **Render the student/parent onboarding branch.** Written and shipped but
      never seen: `/onboarding` redirects a completed account to `/verify`, so
      exercising it needs a fresh sign-up. Note that sign-up is behind a
      Cloudflare Turnstile, so it cannot be driven automatically.

---

## 3. Known-wrong copy and content

- [ ] **The homepage says "families".** `Landing.jsx:122` and `:191` —
      "connecting with other confirmed families", "helps families in your
      school community". Parents ride along with a student's account rather
      than acting independently, so this overstates it.
- [ ] **Footer strapline has a dangling pronoun** — "share rides to save money
      and reduce **their** environmental impact". On every page.
- [ ] **Miles, not kilometres**, in 5 places across the UI.
- [ ] **"We do not read your private conversations regularly"** in `/guide`.
      *Regularly* can be read as "we read them, just not often". The wording it
      replaced was "as a matter of course".
- [ ] **Year options do not fit high school.** `Freshman/Sophomore/Junior/
      Senior` happen to work, but `Graduate` and `Faculty/Staff` do not, and
      the guide says "enrolment" throughout.

---

## 4. UI debt

The admin panel was audited on 2026-09-19 and the structural problems fixed
(shared shell, one palette, one focus ring). What remains is measured but not
addressed:

- [ ] **30 elements with an empty body**, left by the emoji purge. Some are
      legitimately empty (spinners, divider lines) but most are icon slots and
      unlabelled controls: `SwapButton` on add-rides, `MenuToggle` in the
      desktop nav, three `ControlButton`s on the map picker, and a dozen
      `TitleIcon`/`EmptyStateIcon`/`NotFoundIcon` placeholders across places,
      chat and not-found.
- [ ] **24 distinct font sizes** across the admin styles.
- [ ] **28 distinct spacing values**, with no spacing token to anchor them.
      The design system has colour, radius and font tokens but no spacing
      scale.
- [ ] **Six breakpoints** — 768, 820, 480, 450, 1100, 1200.
- [ ] **No z-index scale** — 4, 20, 1000, 9999.
- [ ] **Two accounts to tidy.** The Sep 7 account with the
      `clerk_user_...@clerk.local` placeholder address is orphaned from the old
      auth bridge; check it owns no rides or messages, then delete it. And
      decide whether `monicama0618@gmail.com` is a student or a parent — she is
      currently a plain account with no name and no school.

---

## 5. iOS app

Further along than it looks: `ios` is in `.meteor/platforms`, `mobile-config.js`
is fully specified, 26 icons and splash screens are present, five Cordova
plugins are declared including a custom `cordova-plugin-native-navbar`, and
twelve source files already branch on `Meteor.isCordova`.

- [ ] **Fix the access rules in `mobile-config.js`.** All 8 entries point at
      `carp.school` — including `tileserver.carp.school`, `nominatim.carp.school`
      and `osrm.carp.school`, which are not servers we run. As written the
      packaged app is firewalled off from the real backend. Ten-minute fix,
      total blocker.
- [ ] **A Mac with Xcode.** Cordova iOS cannot be built from Windows. This is
      probably why it stalled.
- [ ] **Apple Developer Program**, $99/yr.
- [ ] **Test Clerk inside a WKWebView.** Email-code sign-in should survive;
      redirect-based flows historically break in Cordova.
- [ ] **Prepare for App Store review.** A service arranging in-person meetings
      between minors will be scrutinised: age rating, the reporting flow, and
      what our verification actually proves.

---

## 6. Housekeeping

- [ ] **181 Dependabot advisories** on the default branch (11 critical, 93
      high, 55 moderate, 22 low).
- [ ] **The old public fork `smiles0527/Carpool`** still exists.
- [ ] **`/video` is unlisted, not private.** Nothing links to it and it sets
      `noindex`, but anyone with the URL can read it. Move it behind
      `AdminRoute` if it ever carries anything sensitive.
- [ ] **Delete the impeccable Copilot copy** if we do not use Copilot —
      `.github/skills`, `.github/agents`, `.github/hooks`, about 17MB. Already
      gitignored.
