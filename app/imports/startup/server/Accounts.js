import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { Roles } from 'meteor/alanning:roles';

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
    Roles.addUsersToRoles(userID, 'admin');
  }
}

/** When running app for first time, pass a settings file to set up a default user account. */
if (Meteor.users.find().count() === 0) {
  if (Meteor.settings.defaultAccounts) {
    console.log('Creating the default user(s)');
    Meteor.settings.defaultAccounts.map(
        ({ email, firstName, lastName, password, role }) => createUser(email, firstName, lastName, password, role),
    );
  } else {
    console.log('Cannot initialize the database!  Please invoke meteor with a settings file.');
  }
}

Accounts.emailTemplates.resetPassword.from = () => 'UHBer Password Reset <no-reply@uhber.com>';

