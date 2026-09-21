import React from "react";
import ReactMarkdown from "react-markdown";
import { stripLeadingH1 } from "../../utils/docContent";
import {
  Container,
  DocHeader,
  SectionTitle,
  DocContent,
} from "../styles/Landing";
import { MobileOnly, DesktopOnly } from "../../layouts/Devices";
import { HeaderWithBack } from "../styles/Credits";
import BackButton from "../components/BackButton";

/*
 * Production notes for the walkthrough video.
 *
 * Deliberately unlisted: nothing links here, and the route asks search engines
 * not to index it while it is open. That is obscurity, not access control --
 * anyone given the URL can read it -- so it must never carry a credential or
 * anything about a real person. If it ever needs to, put it behind AdminRoute
 * instead of trusting the URL to stay secret.
 */
const videoPlan = `
# Walkthrough video — plan and script

Working notes for the two of us. Not linked from anywhere, and the page asks
search engines not to index it, but anyone with the URL can read it — so keep
credentials, real addresses and anything about a real person out of here.

**Target length:** 18–24 minutes. Long is fine; confused is not. The running
order below is built so a viewer can stop after Part 1 and still understand
what CarpSchool is, or skip to their own role.

---

## Before you film

### Accounts you need

Four, all in the test school, all on plus-aliases so they land in one inbox:

- **Admin** — system or school admin. For the approval queue and the rail.
- **Driver** — approved, role set to Driver or Both. Only these can post a ride.
- **Rider** — approved, role set to Rider or Both. Only these can join one.
- **Parent** — signed up as a parent and left unclaimed, so the holding state
  and then the claim can both be filmed.

Set the driver and rider up **before** filming — you do not want to record
yourself waiting on an approval. The parent is the exception: leave it
unclaimed, because the holding screen is the thing worth showing.

### Seed the data first

Record nothing against an empty database. Before you start, have:

- **two or three saved places** on the driver account, named like a real
  person would name them — *Northside by the library*, *Main lot*. Not
  *Test Place 1*.
- **at least two rides already posted** by other accounts, so the browse
  screen has something in it.
- **one short message thread** already going, so the inbox is not empty.

### Check before you hit record

- Sign out of every other CarpSchool session in that browser profile.
- Turn off desktop notifications, Slack, mail.
- Browser at **1440×900**, zoom at 100%. Bigger than that and text gets tiny
  on a phone screen; smaller and the admin rail collapses to its mobile strip.
- Hide the bookmarks bar.
- Use a plus-alias inbox you are happy to show on camera, and blur it anyway
  in the edit if it resolves to a real address.

### Three things not to film

1. **The Clerk "Development mode" banner** on the sign-in and sign-up cards.
   It is there because production still runs a test key. Either get the live
   key in first, or frame the shot below it.
2. **Anyone else's data.** The admin screens show real accounts. Use the test
   school and check what is on screen before recording.
3. **Real email addresses**, yours included, in full.

---

## Part 1 — What CarpSchool is (2–3 min)

No screen yet, or the landing page behind you.

> CarpSchool helps people in one school community share rides. That is the
> whole idea. Somebody is already driving to school; somebody else needs to get
> there. We put the two together, and we keep it inside your school.

Then, plainly, **what it is not** — say this early, because it is what parents
are listening for:

> It is not a taxi service. Nobody is dispatched, nobody is paid, and there is
> no driver working for us. It is people who already know each other's school
> arranging a lift.
>
> We do not take payment, we do not price rides, and we do not carry insurance
> of any kind. If people split petrol between themselves, that is between them
> and nothing to do with us.

Show the landing page. Point at the example ride card. Say what a rider sees
before anything else: the route, the time, seats left.

---

## Part 2 — Getting in (4–5 min)

### 2a. A student signs up

Screen record the whole thing at real speed. Do not cut the waiting.

1. **Sign up** with a school email address. Say out loud why: *the part after
   the @ has to belong to a school we have registered. That is the first gate.*
2. **The code arrives.** Show the inbox, show the code, come back.
3. **Onboarding step 1** — the new bit. Point at the two choices:
   *I'm a student* and *I'm a parent or guardian*. Choose student. The school
   is already filled in, because the email domain resolved it.
4. **Step 2** — name and year. Stop here and answer the nickname question,
   because it comes up constantly:

   > You do not have to use your legal name. Two letters or more, no numbers or
   > symbols. Your school may ask everyone to use a real first name and last
   > initial — that is your school's rule, enforced by whoever approves
   > accounts, not something the app checks.

5. **Step 3** — driver, rider, or both. Say what it actually controls:
   *rider only cannot post a ride; driver only cannot join one as a passenger.*
   Say that it is changeable later.
6. **Terms.** Do not skip past this. Read the checkbox aloud. Say that if the
   student is under the age of majority, a parent or guardian has to accept for
   them.
7. **The holding screen.** Land on it and stay there. *Nothing works yet.* Show
   that browse, post and inbox are unreachable.

### 2b. A parent signs up

The route that does not use a school email.

1. Sign up with an ordinary address — gmail, whatever they use.
2. Choose **I'm a parent or guardian** at step 1. Note what changes: no school
   to confirm, no school to pick.
3. Finish the profile, land on the holding screen, and say clearly:

   > This account is not attached to any school and it does nothing. It cannot
   > see rides, it cannot see people, and no administrator has been asked to
   > look at it. It stays exactly like this until a student says this is my
   > parent.

4. **Switch to the student account.** Profile → *Parent or guardian* → type the
   parent's address → Add.
5. **Switch back to the parent.** Now it is queued.

This is the section parents will actually watch. Take your time over it.

### 2c. The admin approves

Switch to the admin account.

1. Open the rail. Walk the sections briefly — Overview, Rides, Users,
   Verification queue.
2. **Verification queue.** Show the pending student and the pending parent.
3. Approve both. Show what the admin can see when deciding: name, year, role,
   school email, and for the parent, which student vouched for them.
4. Say what admin approval is *for*:

   > The email check proves somebody could open a mailbox on the school's
   > domain. It does not prove they still go there. A person who left last year
   > with a working address would pass it. This step is where a human who knows
   > the community catches that.

---

## Part 3 — A driver posts a ride (3–4 min)

On the driver account.

1. **Offer a ride.** Go through the four required fields and name them as
   required: **pickup**, **drop-off**, **date and time** (future only),
   **seats** (one to seven).
2. **Saved places.** This is the privacy point, so make it:

   > Pickup and drop-off come from places you saved yourself — a point you
   > picked on a map and named. You decide how precise to be. Nothing makes you
   > use your home address, and most people pick a corner, a car park, or a
   > landmark instead.

3. **Optional fields.** Up to five stops in driving order, and a note up to
   500 characters. Add one stop so the route redraws on screen.
4. **Post it.** Show it appear in the list.
5. Say what CarpSchool never asked for:

   > It did not ask for a home address, a licence number, a plate, or insurance
   > documents, and it does not hold any of those.

---

## Part 4 — A rider finds and joins (3–4 min)

On the rider account. **This is the most important camera angle in the video**,
because it is the one that answers *what can other people see about my child*.

1. **Browse.** Show the list. Read out what is on a card: route, stops, date
   and time, seats left, the driver's note, estimated distance and time.
2. **Open the ride.** Now stop and be specific:

   > About the driver, this screen shows a display name and a year of study.
   > That is the entire list. No email address, no phone number, no home
   > address. The screen that supplies those names is limited to exactly those
   > two fields.

3. **Join.** Show the seat count drop.
4. **Messaging.** Open the ride chat. Say that each ride has its own
   conversation, that you can also message someone directly, and that messages
   are stored so the thread is there when you come back.
5. Then the honest part:

   > We do not read private conversations as a matter of course. They can be
   > looked at when there is a real reason — a safety report, abuse, fraud, or
   > where the law requires it.

---

## Part 5 — What our checks prove, and what they do not (3–4 min)

No clicking. Talk to camera. This section exists because it is the question
every parent asks, and answering it badly is worse than not making the video.

**What the email check does prove.** At sign-up, this person could open a
mailbox on a domain belonging to a registered school. The check runs on our
server, and the sign-in token is verified cryptographically before any account
is touched. It is not something a user can talk their way past from the
browser.

**What it does not prove.** Four things, and say all four:

1. It proves control of a mailbox, **not current enrolment**.
2. **It is not a background check.** No criminal records, no driving records.
3. **We do not verify licences, insurance or vehicles.** A driver agrees to
   terms that require a valid licence, insurance that covers carrying
   passengers, and a roadworthy vehicle. That is a promise they make, not a
   document we have seen.
4. **The ID check is optional.** It shows a badge. It is not required to post
   or join a ride, so its absence does not mean anybody failed anything.

Then the one that matters most for this age group:

> If the driver is a new driver, check what their licence actually allows. In
> most places a learner or provisional licence limits how many passengers they
> can carry, or bars passengers altogether for the first several months. Our
> terms require them to follow that. We cannot check it.

And:

> CarpSchool carries no insurance. In any ride, the driver's own policy is the
> only cover that applies.

---

## Part 6, in full — Terms, privacy, reporting

Roughly 4 minutes. Screen share **/terms** and **/privacy**, scroll slowly while
you talk. Do not read the documents aloud; pull the six things a family
actually needs and point at where each one lives.

Section numbers below are the real ones, so you can scroll straight to them.

### 6a. Framing (20 sec)

> Two documents, and you should read them properly at some point — this is me
> pulling out the parts that change what you'd actually do.
>
> The short version: we connect people who already share a school. We are not
> the driver, we do not take payment, and we do not insure anything.

---

### 6b. Who can hold an account — Terms §2 (40 sec)

Scroll to **2. Eligibility and Accounts**.

> Three kinds of account. Students, who verify a school email address. Parents
> and guardians, who join by invitation from their student. And staff, where
> the school allows it.
>
> Nobody under 13. And **if you are under the age of majority where you live, a
> parent or guardian has to accept these terms for you** — that is here in
> writing, and it is what the checkbox at the end of signup refers to.

Then, plainly:

> That means the agreement is with the adult, not the fifteen-year-old.

---

### 6c. Drivers — Terms §5 (60 sec)

**This is the most important minute in the video.** Scroll to **5. Drivers**
and stay there.

> A driver promises several things every time they post a ride. A valid
> licence. Insurance that covers carrying passengers. A roadworthy vehicle. No
> driving impaired, no handheld phone, no more passengers than seatbelts.

Then slow down for the bullet that matters at this age:

> And this one. Any passenger restriction on their licence has to be observed.
> A learner, provisional, novice or graduated licence very often limits how
> many passengers you may carry, or bars passengers altogether for the first
> several months. That is the law where you live, not our rule.
>
> We cannot check any of it. These are promises the driver makes. If your
> student is being driven by another student, that is the thing to ask about.

Then:

> And it says here in bold — **CarpSchool does not provide, arrange, or carry
> any insurance for any ride.** The driver's own policy is the only cover that
> applies. If the driver is on a family policy, someone should check it covers
> passengers who are not family, because plenty of them do not.

---

### 6d. No money — Terms §10 (20 sec)

Scroll to **10. No Payments Through the Platform**.

> There is no payment feature. We do not price rides, we do not process money,
> and we take no part in anything people settle privately. If two families
> split fuel between themselves, that is entirely theirs.

---

### 6e. What we are, and what we are not — Terms §22 (30 sec)

Scroll to **22. CarpSchool's Role**.

> Worth reading this one slowly. We are a coordination platform. We are not the
> carrier, the driver, the vehicle owner, the employer, or the transport
> provider, and we are not a party to any arrangement between users.
>
> A claim arising from a ride is between the people in the car.

Do not skip past **23. Limitation of Liability** in silence — mention it exists
and that the cap is there, rather than letting a viewer discover it later and
feel it was hidden.

---

### 6f. Privacy — the four questions people actually ask (50 sec)

Switch to **/privacy**.

**What do other people see?** — §4, What Other Users Can See.

> A display name and a year of study. That is the whole list for someone
> browsing. No email address, no phone number, no home address.

**What do you keep, and for how long?** — §9, Data Retention.

> Profile, rides and messages while the account is active. If someone completes
> the optional ID check, the images stay with the verification provider — we
> keep the result and the date, not the document.

**Do you read messages?** — §6 and the Terms' §8.

> Not as a matter of course. They can be looked at where there is a real
> reason: a safety report, abuse, fraud, or where the law requires it.

**Can we get our data out, or delete it?** — §11, Your Privacy Choices.

> Yes. Ask what we hold, correct it, or delete the account. A guardian can do
> that for their student. Some records are kept longer where safety or the law
> requires.

---

### 6g. Reporting, and the hard stop (30 sec)

Show where the report control is on screen.

> If someone concerns you, stop the arrangement and report it. An administrator
> at the school can restrict, suspend or remove an account. We would much
> rather hear about something small than find out about something serious
> later.

Then, straight to camera, and do not soften it:

> **CarpSchool is not an emergency service. If anyone is in immediate danger,
> call 911.**

---

### Delivery notes for this part

**Do not apologise for the terms.** The honest reading is the selling point:
most services in this space are vaguer than this about insurance and
licensing.

**Do not say "obviously" or "of course".** None of it is obvious to a parent
hearing it for the first time.

**Say "we cannot check that" out loud** wherever it is true. A viewer who hears
you admit a limit believes the things you do claim.

**Do not quote a number you have not checked.** No "usually approved within a
day", no "thousands of students" — the app makes no such promise and neither
should the video.

**If you fluff the graduated-licence bullet, re-record it.** It is the one line
most likely to stop something going wrong.

---

## Part 7 — Close (1 min)

- Where to get help: **/guide** covers all of this in writing, **/help**,
  **/faq**, and contact@carpschool.com.
- Repeat the single sentence you most want remembered. Suggestion:

  > Everyone here is tied to your school, an administrator approved them, and
  > past that point you use your own judgement — same as you would with any
  > lift.

---

## Shooting notes

**Record each role in one continuous take** where you can. Switching accounts
mid-take is where these videos fall apart. Film Part 2a end to end on the
student, then 2b on the parent, and so on.

**Say what you are about to click before you click it.** It makes the edit
easier and it makes the video usable as audio.

**Do not narrate the UI.** Nobody needs *now I click the blue button*. Say why:
*I am picking a corner near the library rather than my house.*

**Leave the mistakes in** where they are instructive. If the form rejects a
past date, keep it — that is a useful second of video.

**Re-record Part 3 and 4 if the seat count does not visibly change.** The seat
count dropping is the clearest proof in the whole video that the thing works.

---

## Rough edges — check these before filming, or avoid the shot

Honest list of what will look wrong on camera today:

- **"Development mode"** on every Clerk card until the live keys are in.
- **Maps** are public OpenStreetMap tiles, which is not a production
  arrangement. They render fine; just be aware the attribution is visible.
- **Distances are in miles** throughout.
- The footer strapline has a dangling *"reduce their environmental impact"*.
- The homepage says CarpSchool helps **families**, which is not quite what the
  product does yet — parents ride along with their student's account rather
  than acting independently.

If any of these get fixed before the shoot, delete them from this list.
`;

/** Ask crawlers not to index this page for as long as it is mounted. */
const useNoIndex = () => {
  React.useEffect(() => {
    const tag = document.createElement("meta");
    tag.name = "robots";
    tag.content = "noindex, nofollow, noarchive";
    document.head.appendChild(tag);
    return () => {
      document.head.removeChild(tag);
    };
  }, []);
};

function VideoPlan() {
  useNoIndex();

  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <MobileOnly>
        <BackButton />
        <HeaderWithBack>
          <SectionTitle>Video plan</SectionTitle>
        </HeaderWithBack>
      </MobileOnly>
      <DesktopOnly>
        <DocHeader>
          <SectionTitle>Video plan</SectionTitle>
        </DocHeader>
      </DesktopOnly>
      <DocContent>
        <ReactMarkdown>{stripLeadingH1(videoPlan)}</ReactMarkdown>
      </DocContent>
    </Container>
  );
}

export default VideoPlan;
