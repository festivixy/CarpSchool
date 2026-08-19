import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { check, Match } from "meteor/check";
import { verifyToken } from "@clerk/backend";

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

/** Find, or lazily create, the Meteor user that mirrors a Clerk account. */
const resolveMeteorUserId = async (clerkUserId, claims) => {
  const existing = await Meteor.users.findOneAsync({
    "profile.clerkUserId": clerkUserId,
  });
  if (existing) return existing._id;

  // Mirrors clerk.getMeteorUser so both paths produce identical records.
  const userId = Accounts.createUser({
    username: `clerk_${clerkUserId}`,
    email: claims?.email || `clerk_${clerkUserId}@clerk.local`,
    profile: {
      clerkUserId,
      name: "",
    },
    roles: [],
  });
  console.log(`✅ Created Meteor user for Clerk ID ${clerkUserId}: ${userId}`);
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
