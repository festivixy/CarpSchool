import { Meteor } from 'meteor/meteor';

async function isLoggedInAndEmailVerified(userId) {
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
