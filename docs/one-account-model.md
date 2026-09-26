# One account, one door

Design for the model change agreed 2026-09-25. Supersedes the parent/guardian
work of 2026-09-19 to 21, most of which is deleted.

---

## The model, stated plainly

**One kind of account.** It belongs to somebody with an email address on a
registered school's domain. There is no other way in, and no second account
type.

**Everyone can ride from the moment they sign up.** A verified school address
is the whole check. No administrator approves anybody.

**Driving is earned, not chosen.** An account can post a ride only after a
driver's licence has been verified. Nobody is asked at signup whether they
mean to drive, because the answer does not decide anything.

**A parent drives on their student's account, and says so.** There are no
parent accounts. When a guardian is driving, the ride discloses it by name.

**The administrator's control is reactive.** They cannot stop somebody joining;
they can suspend or remove an account afterwards.

### Why the door changed

The old model asked an administrator to approve every account, which asks them
to make a judgement about a person and carry whatever follows from it. A school
does not want that, and it was the only thing the guardian route existed to
serve. Take approval away and a guardian has no reason to hold an account at
all -- the school's own email system decides who belongs, and nobody at the
school has to endorse anyone.

### What this costs, said out loud

The guide currently says: the email check proves control of a mailbox, not
current enrolment, and administrator review is the step meant to catch that.
That step is going. Somebody who left the school with a working address is now
in automatically.

**Before building this, ask each school whether they deprovision email on
departure.** If they do, the gap mostly closes and the guide can say so. If
they do not, this model admits former students and the guide has to admit it.
That is a question for Collingwood, not a thing to design around.

---

## What is deleted

From the last week's work, almost all of it:

- `accountType` and `guardianOf` on the profile
- `profiles.claimGuardian`, `GuardianMethods.js`, `guardian.tests.js` (8 tests)
- `AddGuardian.jsx` and its styles, and the Parent or guardian section on the
  profile
- The open-signup change: `ClerkLoginHandler` refuses an unmatched domain
  again, as it did before
- `clerk.assignSchool`'s school picker path -- the domain decides, always
- `UserType`, and the rider/driver branches in `RideValidation`
- `profile.changeRole` entirely
- Onboarding steps 1 and 3 collapse; what is left is name, year, photo, terms

Kept deliberately:

- **The settings allow-list.** `iscurt.w@gmail.com` and `monicama0618@gmail.com`
  are not school addresses. With every other route closed this list becomes the
  only way a non-school account exists, so it is security-critical now rather
  than a convenience. Narrow it to `adminEmails` and drop `testEmails`.
- `verified` on the profile, repurposed: it is set true at signup and cleared
  by suspension. The existing route gates keep working unchanged.
- `requested` becomes meaningless and goes.

---

## What is built

### 1. Suspension

**Build this before removing approval, not after.** Once anybody with a school
address is in automatically, suspension is the only control an administrator
has, and today it does not exist -- `admin.rejectUser` only touches a pending
account, which will no longer be a state.

- `admin.suspendUser(userId, reason)` -- sets `verified: false`,
  `suspended: true`, records `suspendedAt`, `suspendedBy`, `suspensionReason`
- `admin.reinstateUser(userId)` -- reverses it, keeps the history
- A suspended account keeps its rides and messages. It is reversible; delete is
  not, and delete stays for the cases that warrant it.
- The holding screen tells a suspended person they are suspended and who to
  contact, rather than leaving them at a generic wait.
- Admin Users screen: a filter for suspended, and the action on each card.

### 2. Driver verification

Persona is already wired -- `ServerRoutes.js` takes a webhook and sets
`identityVerified` with the inquiry id. This extends it rather than replacing
it.

Recorded on the profile:

- `driverVerified` -- boolean
- `driverLicenceClass` -- as returned, e.g. "7N", "5"
- `driverLicenceExpiry` -- date
- `driverVerifiedAt`, `driverInquiryId`

Rules:

- `rides.create` refuses an account without `driverVerified`
- A ride's date must fall before `driverLicenceExpiry`; an expired licence
  stops new rides and flags existing ones
- Vehicle photo appears only once driving is verified

Open with Persona: whether the template returns licence class, and whether it
needs a second template separate from the identity check. **Confirm this before
committing to enforcement below** -- the whole seat cap rests on getting a
trustworthy class back.

### 3. Seat limits from licence class

The part worth building carefully, because it turns the graduated-licence
clause from a promise into a control.

In BC a **Class 7N** novice licence permits **one passenger** other than
immediate family. Our Terms already require a driver to observe that; nothing
checks it, and the driver is sixteen.

- A novice class caps the seats selector at 1
- The server enforces the same cap -- a client cannot post 4 seats on a 7N
- The ride shows why: "novice licence, one passenger"
- Class 5 and above: no cap

Keep the class-to-limit mapping in one table with the province named, because
this is jurisdictional and the first school outside BC breaks it.

### 4. Guardian disclosure on a ride

No parent accounts, so a driving parent uses their student's account. A rider
seeing a name and a year would reasonably expect a classmate.

On the ride, not the profile -- a parent drives some journeys and not others:

- `driverIsGuardian` -- boolean, asked when posting
- `guardianName` -- required when that is set

The ride card and detail show **"Driven by a parent or guardian: <name>"**. It
is disclosed, not verified, and the guide must say exactly that.

This also settles a contradiction: the Terms say a person may not let anybody
else use their account. That clause needs amending to permit a guardian driving
on their student's account, with the disclosure as the condition.

---

## Order of work

Each step should leave the app working. Nothing here needs the next step to be
useful.

1. **Suspension.** Methods, admin UI, the suspended holding screen. Verify: an
   admin can suspend and reinstate, and a suspended person is told why.
2. **Close the door.** Restore the domain refusal, delete the guardian route
   and `accountType`. Verify: a non-school address cannot sign up; the
   allow-list still lets an admin in.
3. **Auto-approve.** `verified: true` at signup, `requested` removed, the
   approval queue retired. Verify: a new school address reaches the app without
   an administrator.
4. **One role.** Remove `UserType` and its branches. Everybody can ride.
   Verify: the rider/driver question is gone from onboarding and nothing reads
   the field.
5. **Driver verification.** Persona template, webhook fields, `rides.create`
   gate, vehicle photo behind it. Verify: an unverified account cannot post.
6. **Seat limits.** Class mapping, client cap, server enforcement. Verify: a 7N
   account cannot post more than one seat, from the client or by hand.
7. **Guardian disclosure.** Ride fields, the two UI surfaces. Verify: a
   disclosed ride says so on the card and the detail.
8. **The documents.** Terms sections 2 and 5, the guide, the video script's
   Parts 2b and 2c. Verify: no document describes a route that no longer
   exists.

Migration, before step 3 ships: every existing profile with a school address
becomes `verified: true`; `accountType`, `guardianOf`, `UserType` and
`requested` are dropped from the collection.

---

## Still open

- **Does the school deprovision email on departure?** Decides whether this
  model quietly admits alumni. Ask before building.
- **Does the Persona template return licence class?** The seat cap depends on
  it. Confirm before step 6.
- **Cost per verification.** Every driver is a paid check, and re-verification
  on licence expiry doubles it over time.
- **Who accepts the Terms for a minor?** A guardian must, and with no guardian
  account the only record is a checkbox the student ticks. That is already true
  today; this change does not fix it and arguably makes it starker.
- **Staff.** A teacher has a school address and would land in the one account
  type, with a year of study that means nothing. Minor, but the field should
  probably become optional rather than sit empty.
