import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';

/* eslint-disable no-console */

function createUser(email, firstName, lastName, password, role) {
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
    Meteor.users.update(userID, {
      $addToSet: { roles: 'admin' }
    });
    console.log(`  Admin role assignment completed for user ${email}`);
  }
}

/** When running app for first time, pass a settings file to set up a default user account. */
Meteor.startup(async () => {
  if (await Meteor.users.find().countAsync() === 0) {
    if (Meteor.settings.defaultAccounts) {
      console.log('Creating the default user(s)');
      Meteor.settings.defaultAccounts.map(
          ({ email, firstName, lastName, password, role }) => createUser(email, firstName, lastName, password, role),
      );
    } else {
      console.log('Cannot initialize the database!  Please invoke meteor with a settings file.');
    }
  }
});

Accounts.emailTemplates.resetPassword.from = () => 'Carpool Password Reset <no-reply@carpool.com>';