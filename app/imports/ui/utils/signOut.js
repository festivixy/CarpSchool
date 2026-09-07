import { Meteor } from "meteor/meteor";

/**
 * Sign out of everything, in the right order.
 *
 * Clerk is the source of truth for the session: calling Meteor.logout() alone
 * (what the pending/rejected screens used to do) leaves the Clerk session
 * alive, so the bridge logs the user straight back in on the next load. And
 * the push token has to be retired while the Meteor session still exists,
 * because notifications.deactivateUserTokens needs this.userId.
 *
 * Every step before the Clerk sign-out is best effort: a failed token
 * deactivation or OneSignal logout must never leave the user signed in.
 *
 * @param {(options?: object) => Promise<void>} clerkSignOut
 *   `signOut` from Clerk's useClerk() / useAuth().
 */
export async function fullSignOut(clerkSignOut) {
  if (Meteor.userId()) {
    try {
      await Meteor.callAsync("notifications.deactivateUserTokens");
    } catch (error) {
      console.warn("[SignOut] Token deactivation failed:", error?.reason || error?.message);
    }
  }

  if (window.OneSignal?.logout) {
    try {
      await window.OneSignal.logout();
    } catch (error) {
      console.warn("[SignOut] OneSignal logout failed:", error?.message);
    }
  }

  await new Promise((resolve) => {
    Meteor.logout((error) => {
      if (error) {
        console.warn("[SignOut] Meteor logout failed:", error?.reason || error?.message);
      }
      resolve();
    });
  });

  await clerkSignOut({ redirectUrl: "/" });
}
