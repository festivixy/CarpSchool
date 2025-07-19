import { Meteor } from "meteor/meteor";

async function isEmailVerified(userId) {
    // check(userId, String);
    if (userId) {
        const user = await Meteor.users.findOneAsync(userId);
        if (user.emails[0].verified) {
            return true;
        }
    }
    return false;
}

export { isEmailVerified };
