import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { Profiles } from "../../api/profile/Profile";

/**
 * Whether the signed-in account has finished onboarding and been approved.
 *
 * The routes already refuse an unapproved account, but the navigation did not
 * know about approval at all: it offered Find a ride, My rides and Inbox to
 * someone still stuck at onboarding, every one of which bounced them
 * straight back.
 *
 * `ready` is false until the subscription resolves, so a caller can choose
 * what to do while the answer is unknown rather than treating "not yet
 * loaded" as "not approved".
 */
export const useApprovalStatus = () => useTracker(() => {
  const userId = Meteor.userId();
  if (!userId) {
    return { ready: true, profile: null, approved: false };
  }

  const subscription = Meteor.subscribe("profiles.mineWithApprovalStatus");
  const profile = Profiles.findOne({ Owner: userId });

  return {
    ready: subscription.ready(),
    profile: profile || null,
    approved: Boolean(profile?.verified),
  };
}, []);

export default useApprovalStatus;
