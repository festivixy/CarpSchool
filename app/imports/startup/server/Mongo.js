import { Meteor } from 'meteor/meteor';
import { Stuffs } from '../../api/stuff/Stuff.js';
import { Profiles } from '../../api/profile/Profile.js';
import { Rides } from '../../api/ride/Rides';

/* eslint-disable no-console */

/** Initialize the database with a default data document. */
async function addData(data) {
  console.log(`  Adding: ${data.name} (${data.owner})`);
  await Stuffs.insertAsync(data);
}

/** Initialize the database with default data when empty. */
Meteor.startup(async () => {
  /** Initialize the collection if empty. */
  if (await Stuffs.find().countAsync() === 0) {
    if (Meteor.settings.defaultData) {
      console.log('Creating default data.');
      for (const data of Meteor.settings.defaultData) {
        await addData(data);
      }
    }
  }

  /** START Profile Stuff */
  async function addProfile(data) {
    console.log(`  Adding: ${data.lastName} (${data.owner})`);
    await Profiles.insertAsync(data);
  }

  if (await Profiles.find().countAsync() === 0) {
    if (Meteor.settings.defaultProfiles) {
      console.log('Creating default data.');
      for (const data of Meteor.settings.defaultProfiles) {
        await addProfile(data);
      }
    }
  }

  /** END Profile Stuff */

  /** START Ride Stuff */
  async function addRide(data) {
    console.log(`  Adding: Ride from ${data.driver} `);
    await Rides.insertAsync(data);
  }

  if (await Rides.find().countAsync() === 0) {
    if (Meteor.settings.defaultRides) {
      console.log('Creating default rides.');
      for (const data of Meteor.settings.defaultRides) {
        await addRide(data);
      }
    }
  }

  /** END Ride Stuff */
});