import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Profiles } from "./Profile";
import { isSystemAdmin, isSchoolAdmin } from "../accounts/RoleUtils";

/**
 * Suspending and reinstating an account.
 *
 * Once a verified school address is enough to get in on its own, nobody stands
 * at the door: an administrator cannot refuse an account, only act on one
 * afterwards. Suspension is that action, and it has to exist before approval
 * is removed rather than after.
 *
 * It is reversible and it keeps everything -- the rides, the messages, the
 * record of who suspended whom and why. Deleting an account destroys that
 * history, which is the wrong default for a safety decision somebody may need
 * to explain later. Delete remains for the cases that genuinely warrant it.
 *
 * `verified` is cleared alongside `suspended`, so every route gate that
 * already reads it keeps working without being taught about suspension.
 */

/** The admin's own scope, and whether they may act on this account. */
const assertMayActOn = async (adminId, targetUserId) => {
  if (!adminId) {
    throw new Meteor.Error("not-authorized", "You must be signed in.");
  }
  if (adminId === targetUserId) {
    throw new Meteor.Error("not-authorized", "You cannot suspend your own account.");
  }

  const isSystem = await isSystemAdmin(adminId);
  const isSchool = isSystem ? false : await isSchoolAdmin(adminId);
  if (!isSystem && !isSchool) {
    throw new Meteor.Error("not-authorized", "Only administrators can do that.");
  }

  const target = await Meteor.users.findOneAsync(targetUserId, { fields: { schoolId: 1, roles: 1 } });
  if (!target) {
    throw new Meteor.Error("user-not-found", "That account no longer exists.");
  }

  /* A school administrator acts within their own school. A system
   * administrator is not theirs to touch either way. */
  if (!isSystem) {
    const admin = await Meteor.users.findOneAsync(adminId, { fields: { schoolId: 1 } });
    if (!admin?.schoolId || admin.schoolId !== target.schoolId) {
      throw new Meteor.Error(
        "not-authorized",
        "School administrators can only act on accounts at their own school.",
      );
    }
  }
  if (target.roles?.includes("system")) {
    throw new Meteor.Error("not-authorized", "A system administrator cannot be suspended here.");
  }

  return target;
};

Meteor.methods({
  /**
   * Suspend an account. The person keeps their data and loses their access.
   */
  async "admin.suspendUser"(userId, reason) {
    check(userId, String);
    check(reason, Match.Optional(String));

    await assertMayActOn(this.userId, userId);

    const profile = await Profiles.findOneAsync({ Owner: userId });
    if (!profile) {
      throw new Meteor.Error("profile-not-found", "That account has no profile.");
    }
    if (profile.suspended) {
      throw new Meteor.Error("already-suspended", "That account is already suspended.");
    }

    await Profiles.updateAsync(
      { Owner: userId, suspended: { $ne: true } },
      {
        $set: {
          suspended: true,
          suspendedAt: new Date(),
          suspendedBy: this.userId,
          suspensionReason: (reason || "").trim().slice(0, 500),
          verified: false,
        },
      },
    );

    console.log(`[Suspension] ${this.userId} suspended ${userId}`);
    return { suspended: true };
  },

  /**
   * Reinstate a suspended account, keeping the record that it happened.
   */
  async "admin.reinstateUser"(userId) {
    check(userId, String);

    await assertMayActOn(this.userId, userId);

    const profile = await Profiles.findOneAsync({ Owner: userId });
    if (!profile) {
      throw new Meteor.Error("profile-not-found", "That account has no profile.");
    }
    if (!profile.suspended) {
      throw new Meteor.Error("not-suspended", "That account is not suspended.");
    }

    /* suspendedAt, suspendedBy and the reason are deliberately left in place:
     * that an account was once suspended is part of its history, and an
     * administrator looking at a repeat problem needs to see it. */
    await Profiles.updateAsync(
      { Owner: userId, suspended: true },
      { $set: { suspended: false, verified: true } },
    );

    console.log(`[Suspension] ${this.userId} reinstated ${userId}`);
    return { reinstated: true };
  },
});
