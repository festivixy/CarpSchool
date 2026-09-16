import { Meteor } from "meteor/meteor";
import { grantAllListedAdmins } from "../../api/accounts/adminGrant";

/**
 * Grants the administrator roles at boot to every account listed in
 * settings.private.adminEmails.
 *
 * The grant itself lives in api/accounts/adminGrant, because it also has to
 * run when a listed account signs in: an account created after the server
 * started used to stay an ordinary user until the next restart.
 *
 * settings.json:
 *   "private": { "adminEmails": ["someone@example.edu"] }
 */

Meteor.startup(async () => {
  try {
    const granted = await grantAllListedAdmins();
    if (granted > 0) {
      console.log(`[AdminBootstrap] Checked ${granted} listed administrator account(s).`);
    }
  } catch (error) {
    console.error("[AdminBootstrap] Failed to grant administrator roles:", error);
  }
});
