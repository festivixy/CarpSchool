import { Meteor } from "meteor/meteor";

/**
 * Grants the system role to the accounts listed in settings.
 *
 * There is otherwise no way to create the first administrator: the admin
 * screens are gated on the system role, and the only method that can grant a
 * role is itself admin-only. This closes that bootstrap gap.
 *
 * settings.json:
 *   "private": { "adminEmails": ["someone@example.edu"] }
 *
 * Idempotent - it only writes when a listed account is missing a role, and it
 * never removes roles or touches accounts that are not listed.
 */

const SYSTEM_ROLE = "system";
// The legacy navbar gates on a plain "admin" role while RoleUtils uses
// "system"; granting both means every admin surface recognises the account.
const ADMIN_ROLE = "admin";

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/*
 * An administrator must be able to use the product, not just the admin
 * screens: the approval gate requires an approved profile and every
 * school-scoped query requires a schoolId. Give the account both if missing.
 */
const ensureAdminIsUsable = async (user, address) => {
  const { Profiles } = await import("../../api/profile/Profile");
  const { Schools } = await import("../../api/schools/Schools");

  let { schoolId } = user;
  if (!schoolId) {
    const code = Meteor.settings?.private?.testSchoolCode;
    const school = (code && await Schools.findOneAsync({ code: String(code).toUpperCase(), isActive: true }))
      || await Schools.findOneAsync({ isActive: true }, { sort: { createdAt: 1 } });
    if (school) {
      schoolId = school._id;
      await Meteor.users.updateAsync(user._id, { $set: { schoolId } });
      console.log(`[AdminBootstrap] Assigned ${address} to school ${school.shortName || school.code}`);
    }
  }

  const profile = await Profiles.findOneAsync({ Owner: user._id });
  if (!profile) {
    await Profiles.insertAsync({
      Owner: user._id,
      Name: user.profile?.name || user.profile?.firstName || "Administrator",
      Location: "",
      UserType: "Both",
      verified: true,
      requested: false,
      rejected: false,
      identityVerified: true,
      createdAt: new Date(),
    });
    console.log(`[AdminBootstrap] Created an approved profile for ${address}`);
  } else if (!profile.verified || profile.rejected) {
    await Profiles.updateAsync(profile._id, {
      $set: { verified: true, requested: false, rejected: false },
      $unset: { rejectedAt: "", rejectedBy: "", rejectionReason: "" },
    });
    console.log(`[AdminBootstrap] Approved the profile for ${address}`);
  }
};

Meteor.startup(async () => {
  const emails = Meteor.settings?.private?.adminEmails;
  if (!Array.isArray(emails) || emails.length === 0) return;

  for (const email of emails) {
    if (typeof email !== "string" || !email.trim()) continue;
    const address = email.trim();

    // eslint-disable-next-line no-await-in-loop
    const user = await Meteor.users.findOneAsync({
      "emails.address": { $regex: new RegExp(`^${escapeRegex(address)}$`, "i") },
    });

    if (!user) {
      console.log(`[AdminBootstrap] No account for ${address} yet; will grant on a later start.`);
      continue;
    }

    const roles = user.roles || [];
    const missing = [SYSTEM_ROLE, ADMIN_ROLE].filter(r => !roles.includes(r));
    if (missing.length > 0) {
      // eslint-disable-next-line no-await-in-loop
      await Meteor.users.updateAsync(user._id, {
        $addToSet: { roles: { $each: missing } },
      });
      console.log(`[AdminBootstrap] Granted ${missing.join(", ")} to ${address}`);
    }

    // eslint-disable-next-line no-await-in-loop
    await ensureAdminIsUsable(user, address);
  }
});
