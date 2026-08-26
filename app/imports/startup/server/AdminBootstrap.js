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
    if (missing.length === 0) continue;

    // eslint-disable-next-line no-await-in-loop
    await Meteor.users.updateAsync(user._id, {
      $addToSet: { roles: { $each: missing } },
    });
    console.log(`[AdminBootstrap] Granted ${missing.join(", ")} to ${address}`);
  }
});
