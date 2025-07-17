import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

async function isLoggedInAndEmailVerified(userId) {
    check(userId, String)
    if (userId) {
        const user = await Meteor.users.findOneAsync(userId);
        console.log(userId);
        if (user.emails[0].verified) {
            return true;
        }
    }
    return false;
}

export { isLoggedInAndEmailVerified };
