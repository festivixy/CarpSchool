import { Meteor } from "meteor/meteor";
import { Rides } from "../../api/ride/Rides";

/* eslint-disable no-console */

/** Initialize the database with default data when empty. */
Meteor.startup(async () => {
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
});
