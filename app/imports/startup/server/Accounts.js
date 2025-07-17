import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { isCaptchaSolved } from '../../api/captcha/Captcha';

/* eslint-disable no-console */

Accounts.validateLoginAttempt(async (attempt) => {
  if (!attempt.allowed) {
    return false;
  }
  if (attempt.type == 'password') {
    const captchaSolved = await isCaptchaSolved(attempt.methodArguments[0].password.captchaSessionId);
    if (!captchaSolved) {
      throw new Meteor.Error('invalid-captcha', 'CAPTCHA not solved');
    }
    return captchaSolved;
  }
  return true;
});

async function createUser(email, firstName, lastName, password, role) {
  console.log(`  Creating user ${email}.`);
  const userID = Accounts.createUser({
    username: email,
    profile: {
      firstName: firstName,
      lastName: lastName,
    },
    email: email,
    password: password,
  });
  if (role === 'admin') {
    console.log(`  Assigning admin role to user ${email} with ID ${userID}`);
    // Add admin role directly to user document
    await Meteor.users.updateAsync(userID, {
      $addToSet: { roles: 'admin' },
    });
    console.log(`  Admin role assignment completed for user ${email}`);
  }
}

/** When running app for first time, pass a settings file to set up a default user account. */
Meteor.startup(async () => {
  if (await Meteor.users.find().countAsync() === 0) {
    if (Meteor.settings.defaultAccounts) {
      console.log('Creating the default user(s)');
      for (const { email, firstName, lastName, password, role } of Meteor.settings.defaultAccounts) {
        await createUser(email, firstName, lastName, password, role);
      }
    } else {
      console.log('Cannot initialize the database!  Please invoke meteor with a settings file.');
    }
  }
});

Accounts.emailTemplates.resetPassword.from = () => 'Carpool Password Reset <no-reply@carpool.com>';
