import { Meteor } from "meteor/meteor";
import { Stuffs } from "../../api/stuff/Stuff.js";
import { Profiles } from "../../api/profile/Profile.js";
import { Rides } from "../../api/ride/Rides";

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
      console.log("Creating default data.");
      // eslint-disable-next-line no-restricted-syntax
      for (const data of Meteor.settings.defaultData) {
        // eslint-disable-next-line no-await-in-loop
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
      console.log("Creating default data.");
      // eslint-disable-next-line no-restricted-syntax
      for (const data of Meteor.settings.defaultProfiles) {
        // eslint-disable-next-line no-await-in-loop
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
      console.log("Creating default rides.");
      // eslint-disable-next-line no-restricted-syntax
      for (const data of Meteor.settings.defaultRides) {
        // eslint-disable-next-line no-await-in-loop
        await addRide(data);
      }
    }
  }

  /** END Ride Stuff */
});
