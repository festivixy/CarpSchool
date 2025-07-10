import { Meteor } from 'meteor/meteor';
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
Meteor.publish('StuffAdmin', async function publish() {
  if (this.userId) {
    // Check role assignments directly from the database
    const user = await Meteor.users.findOneAsync(this.userId);
    if (user && user.roles && user.roles.includes('admin')) {
      return Stuffs.find();
    }
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
Meteor.publish('ProfilesAdmin', async function publish() {
  if (this.userId) {
    // Check role assignments directly from the database
    const user = await Meteor.users.findOneAsync(this.userId);
    if (user && user.roles && user.roles.includes('admin')) {
      return Profiles.find();
    }
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

/** Publish user roles for the current user */
Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.users.find(this.userId, { fields: { roles: 1 } });
  }
  return this.ready();
});

/** Publish all users for admin management */
Meteor.publish('AllUsers', async function () {
  if (this.userId) {
    const user = await Meteor.users.findOneAsync(this.userId);
    if (user && user.roles && user.roles.includes('admin')) {
      return Meteor.users.find({}, {
        fields: {
          username: 1,
          emails: 1,
          profile: 1,
          roles: 1,
          createdAt: 1
        }
      });
    }
  }
  return this.ready();
});
