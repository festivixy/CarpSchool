import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

Meteor.methods({
  async 'accounts.email.send.verification'() {
    const user = await Accounts.userAsync();
    if (!user) {
      return false;
    }
    const result = await Accounts.sendVerificationEmail(user._id);
    return result;
  },
});
