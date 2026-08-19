import { Meteor } from "meteor/meteor";

async function isEmailVerified(userId) {
    // check(userId, String);
    if (userId) {
        const user = await Meteor.users.findOneAsync(userId);
        // The user doc can be missing (deleted account, Clerk-only id) and a user
        // created without an email has no emails array, so guard the whole path.
        return Boolean(user?.emails?.[0]?.verified);
    }
    return false;
}

export { isEmailVerified };
