import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { Stuffs } from '../../api/stuff/Stuff';
import { Profiles } from '../../api/profile/Profile';
import { Notes } from '../../api/note/Notes';
import { Rides } from '../../api/ride/Rides';

/** This subscription publishes only the documents associated with the logged in user */
Meteor.publish('Stuff', async function publish() {
  if (this.userId) {
    const user = await Meteor.users.findOneAsync(this.userId);
    const username = user.username;
    return Stuffs.find({ owner: username });
  }
  return this.ready();
});

/** This subscription publishes all documents regardless of user, but only if the logged in user is the Admin. */
Meteor.publish('StuffAdmin', function publish() {
  if (this.userId && Roles.userIsInRole(this.userId, 'admin')) {
    return Stuffs.find();
  }
  return this.ready();
});


/** START OF PROFILE STUFF */
Meteor.publish('Profiles', async function publish() {
  if (this.userId) {
    const user = await Meteor.users.findOneAsync(this.userId);
    const username = user._id;
    return Profiles.find({ Owner: username });
  }
  return this.ready();
});

/** This subscription publishes all documents regardless of user, but only if the logged in user is the Admin. */
Meteor.publish('ProfilesAdmin', function publish() {
  if (this.userId && Roles.userIsInRole(this.userId, 'admin')) {
    return Profiles.find();
  }
  return this.ready();
});

/** END OF PROFILE STUFF */


/** This subscription publishes only the documents associated with the logged in user */
Meteor.publish('Notes', async function publish() {
  if (this.userId) {
    const user = await Meteor.users.findOneAsync(this.userId);
    const username = user.username;
    return Notes.find({ owner: username });
  }
  return this.ready();
});

/** This subscription publishes all rides regardless of user. */
Meteor.publish('Rides', function publish() {
  if (this.userId) {
    return Rides.find();
  }
  return this.ready();
});
