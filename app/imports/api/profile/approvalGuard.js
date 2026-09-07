import { Meteor } from "meteor/meteor";
import { Profiles } from "./Profile";

/**
 * Server-side enforcement of the admin-approval workflow.
 *
 * Until now every "must be approved" rule lived in route guards on the client,
 * and the guard that would have redirected pending or rejected users was
 * never wired into the router at all. Nothing stopped a rejected account from
 * posting rides, joining them, chatting or adding places by calling the
 * methods directly.
 *
 * Every mutation a member performs should pass through here. Reads that any
 * signed-in user may perform (browsing, viewing a ride) do not.
 */

/**
 * Resolve the caller's profile and throw unless it is approved.
 *
 * Returns the profile so callers that need UserType or Name do not query
 * twice. Throws Meteor.Error with a reason the client can show verbatim.
 */
export const assertProfileApproved = async (userId) => {
  if (!userId) {
    throw new Meteor.Error("not-authorized", "You must be logged in");
  }

  const profile = await Profiles.findOneAsync({ Owner: userId });

  if (!profile) {
    throw new Meteor.Error("profile-required", "Complete your profile before using this feature");
  }
  if (profile.rejected) {
    throw new Meteor.Error("profile-rejected", "Your account was not approved. Contact your school administrator");
  }
  if (!profile.verified) {
    throw new Meteor.Error("profile-pending", "Your account is awaiting approval");
  }

  return profile;
};
