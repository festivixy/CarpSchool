import { Meteor } from 'meteor/meteor';
import { Stuffs } from '../../api/stuff/Stuff.js';
import { Profiles } from '../../api/profile/Profile.js';
import { Rides } from '../../api/ride/Rides';

/* eslint-disable no-console */

/** Initialize the database with a default data document. */
function addData(data) {
  console.log(`  Adding: ${data.name} (${data.owner})`);
  Stuffs.insert(data);
}

/** Initialize the collection if empty. */
if (Stuffs.find().count() === 0) {
  if (Meteor.settings.defaultData) {
    console.log('Creating default data.');
    Meteor.settings.defaultData.map(data => addData(data));
  }
}

/** START Profile Stuff */
function addProfile(data) {
  console.log(`  Adding: ${data.lastName} (${data.owner})`);
  Profiles.insert(data);
}

if (Profiles.find().count() === 0) {
  if (Meteor.settings.defaultProfiles) {
    console.log('Creating default data.');
    Meteor.settings.defaultProfiles.map(data => addProfile(data));
  }
}

/** END Profile Stuff */

/** START Ride Stuff */
function addRide(data) {
  console.log(`  Adding: Ride from ${data.driver} `);
  Rides.insert(data);
}

if (Rides.find().count() === 0) {
  if (Meteor.settings.defaultRides) {
    console.log('Creating default rides.');
    Meteor.settings.defaultRides.map(data => addRide(data));
  }
}

/** END Ride Stuff */
