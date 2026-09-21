import { Meteor } from "meteor/meteor";

/**
 * Grants the administrator roles to the accounts listed in settings.
 *
 * There is otherwise no way to create the first administrator: the admin
 * screens are gated on the system role, and the only method that can grant a
 * role is itself admin-only.
 *
 * This lives apart from the startup pass because the grant has to happen at
 * two moments. Running it only at boot meant an account created afterwards
 * stayed an ordinary user until the next restart, which on a hosted
 * deployment is whenever someone happens to deploy.
 *
 * Idempotent: it only writes what is missing, and never removes a role or
 * touches an account that is not listed.
 */

const SYSTEM_ROLE = "system";

/* The legacy navbar gates on a plain "admin" role while RoleUtils uses
 * "system"; granting both means every admin surface recognises the account. */
const ADMIN_ROLE = "admin";

export const listedAdminEmails = () => {
  const configured = Meteor.settings?.private?.adminEmails;
  if (!Array.isArray(configured)) return [];
  return configured
    .filter(entry => typeof entry === "string" && entry.trim())
    .map(entry => entry.trim().toLowerCase());
};

/** Does any address on this user match the configured administrator list? */
export const userIsListedAdmin = (user) => {
  const listed = listedAdminEmails();
  if (listed.length === 0) return false;

  const addresses = (user?.emails || [])
    .map(entry => entry?.address)
    .filter(Boolean)
    .map(address => address.toLowerCase());

  return addresses.some(address => listed.includes(address));
};

/*
 * An administrator must be able to use the product, not just the admin
 * screens: the approval gate requires an approved profile and every
 * school-scoped query requires a schoolId. Give the account both if missing.
 */
export const ensureAdminIsUsable = async (user, label) => {
  const { Profiles } = await import("../profile/Profile");

  /* No school is assigned. An administrator operates the platform rather than
   * belonging to a school in it, every admin query already treats them as
   * school-less, and the member routes now let them through without one. If
   * an administrator also wants to ride or drive somewhere, that is a separate
   * account at that school. */

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
    console.log(`[AdminGrant] Created an approved profile for ${label}`);
  } else if (!profile.verified || profile.rejected) {
    await Profiles.updateAsync(profile._id, {
      $set: { verified: true, requested: false, rejected: false },
      $unset: { rejectedAt: "", rejectedBy: "", rejectionReason: "" },
    });
    console.log(`[AdminGrant] Approved the profile for ${label}`);
  }
};

/**
 * Grant the roles, and make the account usable, if this user is listed.
 *
 * @param {string} userId
 * @returns {Promise<boolean>} whether the user was a listed administrator.
 */
export const grantAdminIfListed = async (userId) => {
  if (!userId) return false;

  const user = await Meteor.users.findOneAsync(userId, {
    fields: { emails: 1, roles: 1, schoolId: 1, profile: 1 },
  });
  if (!user || !userIsListedAdmin(user)) return false;

  const label = user.emails?.[0]?.address || userId;
  const roles = user.roles || [];
  const missing = [SYSTEM_ROLE, ADMIN_ROLE].filter(role => !roles.includes(role));

  if (missing.length > 0) {
    await Meteor.users.updateAsync(user._id, {
      $addToSet: { roles: { $each: missing } },
    });
    console.log(`[AdminGrant] Granted ${missing.join(", ")} to ${label}`);
  }

  await ensureAdminIsUsable(user, label);
  return true;
};

/** Every listed administrator that already has an account. Used at startup. */
export const grantAllListedAdmins = async () => {
  const listed = listedAdminEmails();

  if (listed.length === 0) {
    /* Said out loud: a deployment whose settings lost this list has no way to
     * reach its own admin screens, and silence made that impossible to spot. */
    console.warn("[AdminGrant] No private.adminEmails configured; nobody will be made an administrator.");
    return 0;
  }

  const escape = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = listed.map(address => new RegExp(`^${escape(address)}$`, "i"));

  const users = await Meteor.users.find(
    { "emails.address": { $in: patterns } },
    { fields: { _id: 1 } },
  ).fetchAsync();

  if (users.length === 0) {
    console.log(`[AdminGrant] No account yet for ${listed.join(", ")}; will grant on first sign-in.`);
    return 0;
  }

  const results = await Promise.all(users.map(user => grantAdminIfListed(user._id)));
  return results.filter(Boolean).length;
};
