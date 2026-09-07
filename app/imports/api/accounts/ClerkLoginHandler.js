import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check, Match } from "meteor/check";
import { verifyToken, createClerkClient } from "@clerk/backend";
import { schoolForEmail } from "./SchoolDomain";

/**
 * Bridges Clerk authentication to a Meteor session.
 *
 * Clerk signs the user in on the client, but nothing was establishing a
 * Meteor session, so Meteor.userId() stayed null for the whole app. Every
 * publication and method gates on this.userId, so publications returned
 * nothing and methods threw "You must be logged in" even while the UI
 * considered you signed in.
 *
 * SECURITY: the client sends a Clerk session JWT and nothing else. The token
 * is verified against Clerk's JWKS using the instance secret key before any
 * user is resolved. The Clerk user id is taken from the *verified* token
 * payload (`sub`), never from client-supplied data, so a caller cannot claim
 * another user's identity. A failed verification logs the reason server-side
 * and returns a generic error to the client.
 */

const CLERK_LOGIN_TYPE = "clerk";

const secretKey = () => Meteor.settings?.private?.clerk?.secretKey
  || process.env.CLERK_SECRET_KEY;

/**
 * The verified session token does not always carry an email claim, so ask
 * Clerk for the account's primary verified address. Returns null if it cannot
 * be established.
 */
const primaryEmailFor = async (clerkUserId, claims) => {
  if (claims?.email) return claims.email;
  try {
    const client = createClerkClient({ secretKey: secretKey() });
    const user = await client.users.getUser(clerkUserId);
    const primary = user.emailAddresses
      .find(e => e.id === user.primaryEmailAddressId) || user.emailAddresses[0];
    return primary?.emailAddress || null;
  } catch (error) {
    console.warn("[ClerkLogin] Could not read email from Clerk:", error?.message || error);
    return null;
  }
};

/** Find, or lazily create, the Meteor user that mirrors a Clerk account. */
/*
 * Emails exempt from the school-domain rule: settings.private.adminEmails and
 * settings.private.testEmails. A test entry may be a full address or a
 * "user+*@host" pattern, which admits every plus-alias of that mailbox so a
 * fresh sign-up can be created for each onboarding walkthrough.
 */
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const isAllowListedEmail = (email) => {
  const settings = Meteor.settings?.private || {};
  const entries = [...(settings.adminEmails || []), ...(settings.testEmails || [])]
    .filter(e => typeof e === "string" && e.trim());
  const candidate = email.trim().toLowerCase();
  return entries.some((entry) => {
    const pattern = entry.trim().toLowerCase();
    if (!pattern.includes("*")) return pattern === candidate;
    const re = new RegExp(`^${pattern.split("*").map(escapeRegex).join(".*")}$`);
    return re.test(candidate);
  });
};

const allowListSchool = async () => {
  const { Schools } = await import("../schools/Schools");
  const code = Meteor.settings?.private?.testSchoolCode;
  if (code) {
    const byCode = await Schools.findOneAsync({ code: String(code).toUpperCase(), isActive: true });
    if (byCode) return byCode;
  }
  return Schools.findOneAsync({ isActive: true }, { sort: { createdAt: 1 } });
};

const resolveMeteorUserId = async (clerkUserId, claims) => {
  const existing = await Meteor.users.findOneAsync({
    "profile.clerkUserId": clerkUserId,
  });
  if (existing) return existing._id;

  // First login for this Clerk account. Enforce the school-email rule here:
  // signup runs through Clerk, so this is the only server-side point where a
  // new account can be refused. accounts.registerStudent enforced the same
  // rule on the legacy registration path, which is no longer routed.
  const email = await primaryEmailFor(clerkUserId, claims);
  if (!email) {
    throw new Meteor.Error(
      "clerk-no-email",
      "Could not read your email address. Please contact support.",
    );
  }

  let { school, error } = await schoolForEmail(email);
  if (error && isAllowListedEmail(email)) {
    // Administrators and test accounts from settings may sign in with any
    // domain; they are placed in the configured test school (or the first
    // active one) so every school-scoped query still works for them.
    school = await allowListSchool();
    error = school ? null : "No active school exists to assign this account to";
  }
  if (error) {
    console.warn(`[ClerkLogin] Rejected signup for ${email}: ${error}`);
    throw new Meteor.Error("school-email-required", error);
  }

  // Must be createUserAsync: in Meteor 3 Accounts.createUser is async on the
  // server, so an un-awaited call yields a Promise and setUserId then throws
  // "must be called on string or null" — breaking the first login of every
  // new user, the exact case this handler exists to serve.
  //
  // schoolId is set from the verified email domain, so a user is never left
  // without a school (which made every school-scoped query return nothing).
  const userId = await Accounts.createUserAsync({
    username: `clerk_${clerkUserId}`,
    email,
    profile: {
      clerkUserId,
      name: "",
    },
    roles: [],
  });
  await Meteor.users.updateAsync(userId, { $set: { schoolId: school._id } });

  console.log(`✅ Created Meteor user for Clerk ID ${clerkUserId}: ${userId} (${school.shortName})`);
  return userId;
};

Accounts.registerLoginHandler(CLERK_LOGIN_TYPE, async (options) => {
  // Let other handlers deal with anything that is not a Clerk attempt.
  if (!options || options.type !== CLERK_LOGIN_TYPE) return undefined;

  check(options, Match.ObjectIncluding({
    type: String,
    clerkToken: String,
  }));

  const key = secretKey();
  if (!key) {
    console.error("[ClerkLogin] No Clerk secret key configured; refusing login.");
    throw new Meteor.Error("clerk-not-configured", "Authentication is not configured.");
  }

  let payload;
  try {
    payload = await verifyToken(options.clerkToken, { secretKey: key });
  } catch (error) {
    // Log the real reason, return a generic message.
    console.warn("[ClerkLogin] Token verification failed:", error?.message || error);
    throw new Meteor.Error("clerk-invalid-token", "Could not verify your session.");
  }

  const clerkUserId = payload?.sub;
  if (!clerkUserId) {
    console.warn("[ClerkLogin] Verified token carried no subject claim.");
    throw new Meteor.Error("clerk-invalid-token", "Could not verify your session.");
  }

  const userId = await resolveMeteorUserId(clerkUserId, payload);
  return { userId };
});
