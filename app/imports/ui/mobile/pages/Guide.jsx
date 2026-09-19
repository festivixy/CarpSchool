import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
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
 * The public guide, written for families deciding whether to let their
 * student use this.
 *
 * Every factual claim here describes what the code actually does, and the
 * limits are stated as plainly as the features. If the product changes, this
 * page changes with it -- a guide that overstates what verification proves is
 * worse than no guide at all.
 */
const guideContent = `
# Guide to CarpSchool

CarpSchool helps people in one school community share rides. This guide
explains exactly what the service does, what it asks of you, what other
people can see, and what our checks do and do not prove.

## Getting an account

Accounts are not open to the public. Joining takes three steps, and all
three must pass.

1. **Sign up with your school email address.** We email you a code, so you
   must be able to open that mailbox. Sign-in is handled by Clerk, an
   authentication provider; CarpSchool never sees or stores your password.
2. **Your email's domain must belong to a school already registered with
   CarpSchool.** The match is on the part after the @. If the domain is not
   registered, the account is refused at this point and nothing is created.
3. **A community administrator reviews the account.** Until they approve it,
   you cannot browse rides, post one, or message anyone. While you wait, the
   app shows a holding screen and nothing else.

You can also complete an optional identity check, which asks for a
government ID through a provider called Persona. See *What our checks
prove* below for what this does and does not mean today.

## Setting up your profile

You are asked for:

- **A display name.** Required, at least two characters.
- **Year of study.** Chosen from a list.
- **Whether you drive, ride, or both.** This controls what you can do: an
  account set to rider only cannot post a ride at all.
- **A profile photo**, and **a photo of your vehicle** if you drive. Both
  optional.
- **A phone number.** Optional, and not shown on your profile.

### Can you use a nickname?

**Yes.** The display name only has to be two or more characters made of
letters, spaces, hyphens, apostrophes, commas or periods. Numbers and
symbols are rejected, but nothing requires the name to be your legal one,
and nothing checks it against any document.

Being straightforward about this: **the software does not enforce real
names.** Some communities want people identifiable to each other and will
ask everyone to use a real first name and last initial. That is a rule your
school's administrator sets and enforces by reviewing accounts, not
something the app can check.

## Posting a ride

A driver supplies four things. Everything else is optional:

**Required:**

- **Pickup point** — chosen from your saved places
- **Drop-off point** — chosen from your saved places
- **Date and time** — must be in the future
- **Seats** — between 1 and 7

**Optional:**

- **Stops along the way** — up to five, in the order you drive them
- **Notes** — up to 500 characters

**Pickup and drop-off are places you have saved yourself**, each one a point
you chose on a map and gave a name. You decide how precise to be. Nothing
forces you to use your home address, and many people pick a nearby corner,
a car park or a landmark instead.

CarpSchool does **not** ask a driver for a home address, a driver's licence
number, a licence plate, or insurance documents. It does not hold any of
those.

There is no payment feature. CarpSchool does not price rides, does not
process money, and takes no part in anything people settle privately
between themselves.

## What other people see

Two different things are visible, and it is worth separating them.

**On a ride in the list, everyone approved at your school sees:**

- The pickup and drop-off points, the stops, and the route between them
- The date and time
- How many seats are left
- Any notes the driver wrote
- An estimated distance and travel time

**About the driver, the same people see only:**

- The display name
- Year of study

That is the whole list. The screen that supplies those names is limited to
exactly those fields, so a browsing rider is not given an email address, a
phone number, a home address, or anything else from the profile.

Once you join a ride, the driver and the other riders can see that you
joined, and you can message each other in the app.

Nothing on CarpSchool is public. There is no page a search engine can index,
and someone at another school cannot see your school's rides or people at
all — every query is limited to your own school.

## Messaging

Each ride has its own conversation for the people in it. You can also
message another person at your school directly. Messages are stored so the
conversation is there when you come back.

We do not read private conversations as a matter of course. Messages can be
looked at where it is genuinely necessary — investigating a safety report,
acting on abuse, preventing fraud, or where the law requires it.

## What our checks prove, and what they do not

This is the part families ask about most, so here it is plainly.

**What the email check does prove.** At the moment of signing up, the person
could open a mailbox on a domain that belongs to a registered school. That
is a real barrier: a stranger with no connection to the school cannot get
past it, and neither can someone using a personal address.

The check is done on our server, not in the browser. The sign-in token is
verified cryptographically with the authentication provider before any
account is touched, and the identity is taken from that verified token —
never from anything the browser claims. It is not something a user can talk
their way past by editing a page.

**What it does not prove.** Four things, honestly:

1. **It proves control of a mailbox, not current enrolment.** Someone who
   has left the school but kept a working address would pass. Administrator
   review is the step that is meant to catch that, and it depends on an
   administrator who knows the community.
2. **It is not a background check.** We do not check criminal records, and
   we do not check driving records.
3. **We do not verify licences, insurance or vehicles.** A driver agrees to
   our terms, which require a valid licence, valid insurance that covers
   carrying passengers, and a roadworthy vehicle. That is a promise they
   make, not a document we have seen.
4. **The identity check is optional today.** Completing it shows a badge on
   a profile. It is not currently required in order to post or join a ride,
   so its absence does not mean an account failed anything.

**CarpSchool carries no insurance of any kind.** In any ride, the driver's
own policy is the only cover that applies.

Nothing here replaces your own judgement. Look at who you are travelling
with, agree where you are meeting, and if something feels wrong, do not take
the ride.

## Reporting a problem

If someone concerns you, stop the arrangement and report it. An
administrator can restrict, suspend or remove an account. We would rather
hear about something small than find out later.

CarpSchool is not an emergency service. If anyone is in immediate danger,
call 911.

## Your data

- Your profile, your rides, and your messages are kept while your account is
  active.
- If you complete the identity check, the ID images stay with the
  verification provider. CarpSchool stores only the result and the date.
- You can ask what we hold about you, correct it, or ask for your account to
  be deleted. Some records are kept longer where safety or the law requires.

The [Privacy Policy](/privacy) sets this out in full, and the
[Terms of Use](/terms) cover the rules everyone agrees to.

## Questions

Write to contact@carpschool.com and we will answer.
`;

function MobileGuide() {
  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <MobileOnly>
        <BackButton />
        <HeaderWithBack>
          <SectionTitle>Guide</SectionTitle>
        </HeaderWithBack>
      </MobileOnly>
      <DesktopOnly>
        <DocHeader>
          <SectionTitle>Guide</SectionTitle>
        </DocHeader>
      </DesktopOnly>
      <DocContent>
        <ReactMarkdown>{stripLeadingH1(guideContent)}</ReactMarkdown>
      </DocContent>
    </Container>
  );
}

MobileGuide.propTypes = {
  history: PropTypes.object,
};

MobileGuide.defaultProps = {
  history: null,
};

export default withRouter(MobileGuide);
