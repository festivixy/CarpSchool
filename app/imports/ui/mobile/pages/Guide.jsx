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

CarpSchool makes people from one school community exchange rides. This guide
will clarify what the service does, what is expected of you, what other people
may see, and what our checks do and do not prove.

## Getting an account

Accounts are private and require registration, which consists of three steps to
complete and pass.

1. **Registration takes place with the help of your school email address.** You
   receive a code via email, thus, you need to access this mailbox.
   Authentication is provided by the third-party service Clerk; CarpSchool does
   not see nor store your password.
2. **The domain of your email should correspond to one of schools registered in
   CarpSchool.** The matching is performed for the string after the @ symbol.
   This is what attaches a student to their school community.
3. **A community administrator approves the account.** Until it is approved, you
   cannot browse rides, post a ride and communicate with other users. While
   waiting for this step, the app displays a special holding screen.

### If you are a parent or guardian

Parents do not have a school email address, so they take a different route.
Sign up with whatever address you use and choose *I'm a parent or guardian*.
Your account is then created but does nothing at all: it belongs to no school
and cannot browse rides, post one, or message anyone.

It stays that way until **your student adds you from their profile**, using the
address you signed up with. That is what attaches you to their school. Only
then does your account reach the administrator for approval, in step 3 above.

A student must have been approved themselves before they can add anyone.

You can also complete the optional identity check through the third-party
provider Persona, which requires you to provide a governmental identification
document. See *What our checks prove* below for details of what this means now.

## Setting up your profile

Here is what we ask:

- **Display name** - required, at least 2 characters.
- **Year of study** - select from the list.
- **Whether you drive, ride or both.** It affects what actions you may perform -
  an account set to rider only cannot post a ride, and an account set to driver
  only cannot join one as a rider.
- **Profile photo** and **photo of your vehicle** if you drive. Optional.
- **Phone number.** Optional and not shown on the profile.

### May I use a nickname?

**Sure.** The display name should consist of at least 2 characters made of
letters, spaces, hyphens, apostrophes, commas and periods. Numbers and special
symbols are not accepted, but nothing requires you to use your real name, and no
verification is performed.

Let us be straightforward about it: **the software does not enforce real names.**
Some communities want people to be identifiable and will require everyone to use
their real first name and last initial. It is a community requirement, enforced
by community administrators during account approval.

## Posting a ride

The driver provides the following information. Everything else is optional.

**Required:**

- **Pickup point** - selected from your saved places
- **Drop-off point** - selected from your saved places
- **Date and time** - must be in the future
- **Number of seats** - from 1 to 7

**Optional:**

- **Additional stops** - up to 5, in the order of driving
- **Notes** - up to 500 characters

Both pickup and drop-off are places saved by you, consisting of the coordinates
selected on the map and the name you assigned. You choose the level of accuracy.
No one forces you to use your home address, and people usually save the nearest
intersection, parking lot or landmark.

CarpSchool does **not** ask a driver for a home address, driver's license
number, license plate number, and insurance documents. It does not store any of
these.

There is no payment feature. CarpSchool does not set prices for rides and does
not take part in money exchange processes between users.

## What other people see

Two different pieces of information are visible, and it is important to
distinguish between them.

**For the listed ride, everyone approved at your school sees the following
information:**

- Pickup and drop-off points, additional stops, and the route between them
- Date and time
- Number of available seats
- Notes provided by driver
- Estimated distance and travel time

**As for the driver, the same people see the following:**

- Display name
- Year of study

It is the full list. The screen providing these names has exactly these fields,
thus the browsing rider will not see email address, phone number or any other
information from the profile.

After joining a ride, the driver and the other riders will be able to see that
you joined the ride and message each other in the app.

Nothing in CarpSchool is publicly available. There is no page indexed by any
search engine, and people from another school will not be able to see rides or
other people from your school community - all queries are limited to your own
school.

## Messaging

Every ride has a separate chat for the members of the ride. You can also send
direct messages to other people from your school. Messages are saved, so you
will have the conversation history available when you return.

We do not read your private conversations regularly. Messages may be accessed
where it is really necessary - in case of safety report investigation, dealing
with abuse, preventing fraud or where the law requires it.

## What our checks prove, and what they do not

This section answers the questions that concern families the most, so it is
stated clearly.

**What the email check proves.** For a student, at the moment of registration
this person had the access to a mailbox at the domain which belongs to the
registered school.

Anyone may create an account with any address, but an account which did not
prove a school domain reaches nothing: it cannot see rides, people, or
messages, and it is not put in front of an administrator. It leaves that state
only when an already approved student names its address as their parent or
guardian. So a stranger with no connection to the school can hold an empty
record, and still cannot reach anything without somebody verified vouching for
them and an administrator agreeing.

The check is performed on our server, not in the browser. The sign-in token is
cryptographically verified with the authentication provider before the account
creation starts, and the identity information is extracted from that token - not
from the information provided by the browser. It is not something user can trick
by modifying the page.

**What it does not prove.** Four things, to be honest:

1. **It proves access to a mailbox, not the current enrolment.** The person who
   has left the school and still has a working email address would pass.
   Administrator approval step is intended to detect this situation, and it
   depends on administrator who knows the community.
2. **It is not a background check.** We do not check criminal records, and we do
   not check driving records.
3. **We do not verify licenses, insurances and vehicles.** The driver agrees to
   our terms, which require having a valid license, valid insurance which covers
   transporting passengers, and a roadworthy vehicle. It is a promise the driver
   makes, not a document we have seen.
4. **The identity check is optional today.** If it is completed, you receive a
   badge on your profile. It is not currently required to post or join a ride,
   so lack of such verification does not imply failure of any check.

**CarpSchool is not insured in any way.** In every ride, the driver's own policy
is the only insurance that applies.

This section does not replace your own judgment. Look at the person you will
travel with, agree on a meeting place, and if something does not feel right, do
not take the ride.

## Reporting a problem

If you are concerned with someone's behavior, stop the arrangement and report
it. An administrator may restrict, suspend or even delete the account. We prefer
to hear about minor issues, not to find out about serious problems later.

CarpSchool is not an emergency service. If anyone is in immediate danger, call
911.

## Your data

- Your profile, rides and messages will be stored while your account is active.
- If you completed the identity check, images of ID will be stored by the
  verification provider. CarpSchool will keep only the result of this check and
  its date.
- You can request the information we hold about you, correct it or request
  account deletion. Some information may be stored longer due to safety or legal
  requirements.

The [Privacy Policy](/privacy) describes it in detail, and the
[Terms of Use](/terms) include all agreements.

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
