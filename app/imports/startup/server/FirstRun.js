import { Meteor } from "meteor/meteor";
import { Rides } from "../../api/ride/Rides";
import { Places } from "../../api/places/Places";
import { Accounts } from "meteor/accounts-base";
import { Captcha } from "../../api/captcha/Captcha";

/* eslint-disable no-console */

async function createUser(email, firstName, lastName, password, role) {
  const captchaSessionId = await Captcha.insertAsync({
    text: "dummy-captcha-text",
    timestamp: Date.now(),
    solved: true,
    used: false,
  });
  console.log(`  Created dummy captcha session ID: ${captchaSessionId}`);
  console.log(`  Creating user ${email}.`);
  const userID = Accounts.createUser({
    username: email,
    profile: {
      firstName: firstName,
      lastName: lastName,
      captchaSessionId: captchaSessionId,
    },
    email: email,
    password: password,
    captchaSessionId: captchaSessionId,
  });
  if (role === "admin") {
    console.log(`  Assigning admin role to user ${email} with ID ${userID}`);
    // Add admin role directly to user document
    await Meteor.users.updateAsync(userID, {
      $addToSet: { roles: ["admin"] },
    });
    console.log(`  Admin role assignment completed for user ${email}`);
  }
}

async function addPlace(data) {
  console.log(`  Adding: Place "${data.text}" for ${data.createdBy}`);

  // Find the user by email to get their user ID
  const user = await Meteor.users.findOneAsync({
    $or: [{ "emails.address": data.createdBy }, { username: data.createdBy }],
  });

  if (!user) {
    console.error(`    Error: User not found for ${data.createdBy}`);
    return;
  }

  // Create place data with user ID
  const placeData = {
    text: data.text,
    value: data.value,
    createdBy: user._id,
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
  };

  // Check if place already exists (by _id if provided, or by text+user)
  let existingPlace;
  if (data._id) {
    existingPlace = await Places.findOneAsync({ _id: data._id });
    if (existingPlace) {
      console.log(`    Place with ID "${data._id}" already exists`);
      return;
    }
    placeData._id = data._id;
  } else {
    existingPlace = await Places.findOneAsync({
      text: placeData.text,
      createdBy: placeData.createdBy,
    });
    if (existingPlace) {
      console.log(
        `    Place "${data.text}" already exists for user ${data.createdBy}`,
      );
      return;
    }
  }

  await Places.insertAsync(placeData);
}

async function addRide(data) {
  console.log(`  Adding: Ride from ${data.driver} `);

  // Convert legacy ride format to new format if needed
  let rideData = { ...data };

  // If this is legacy format (has 'rider' field), convert to new format
  if (rideData.rider !== undefined && rideData.riders === undefined) {
    console.log(`    Converting legacy ride format to new schema`);
    rideData.riders = rideData.rider === "TBD" ? [] : [rideData.rider];
    rideData.seats = rideData.seats || 1; // Default to 1 seat if not specified
    delete rideData.rider; // Remove legacy field
  }

  // Ensure new format has required fields with defaults
  if (rideData.riders === undefined) {
    rideData.riders = [];
  }
  if (rideData.seats === undefined) {
    rideData.seats = 1;
  }
  if (rideData.notes === undefined) {
    rideData.notes = "";
  }
  if (rideData.createdAt === undefined) {
    rideData.createdAt = new Date();
  }

  // Validate that origin and destination place IDs exist
  if (rideData.origin) {
    const originPlace = await Places.findOneAsync({ _id: rideData.origin });
    if (!originPlace) {
      console.error(
        `    Error: Origin place ID "${rideData.origin}" not found`,
      );
      return;
    }
  }

  if (rideData.destination) {
    const destinationPlace = await Places.findOneAsync({
      _id: rideData.destination,
    });
    if (!destinationPlace) {
      console.error(
        `    Error: Destination place ID "${rideData.destination}" not found`,
      );
      return;
    }
  }

  await Rides.insertAsync(rideData);
}

async function migrateLegacyRides() {
  // Find rides with legacy schema (has 'rider' field but no 'riders' field)
  const legacyRides = await Rides.find({
    rider: { $exists: true },
    riders: { $exists: false },
  }).fetchAsync();

  if (legacyRides.length > 0) {
    console.log(
      `Migrating ${legacyRides.length} legacy rides to new schema...`,
    );

    for (const ride of legacyRides) {
      // eslint-disable-next-line no-await-in-loop
      const updateData = {
        riders: ride.rider === "TBD" ? [] : [ride.rider],
        seats: ride.seats || 1,
        notes: ride.notes || "",
        createdAt: ride.createdAt || new Date(),
      };

      // eslint-disable-next-line no-await-in-loop
      await Rides.updateAsync(ride._id, {
        $set: updateData,
        $unset: { rider: "" },
      });
    }

    console.log(`Successfully migrated ${legacyRides.length} legacy rides.`);
  }
}

/** When running app for first time, pass a settings file to set up a default user account. */
Meteor.startup(async () => {
  // Migrate any existing legacy ride data
  await migrateLegacyRides();

  if ((await Meteor.users.find().countAsync()) === 0) {
    if (Meteor.settings.defaultAccounts) {
      console.log("Creating the default user(s)");
      for (const { email, firstName, lastName, password, role } of Meteor // eslint-disable-line
        .settings.defaultAccounts) {
        await createUser(email, firstName, lastName, password, role);
      }
    } else {
      console.log(
        "Cannot initialize the database!  Please invoke meteor with a settings file.",
      );
    }
  }
  // Create default places
  if ((await Places.find().countAsync()) === 0) {
    if (Meteor.settings.defaultPlaces) {
      console.log("Creating default places.");
      // eslint-disable-next-line no-restricted-syntax
      for (const data of Meteor.settings.defaultPlaces) {
        // eslint-disable-next-line no-await-in-loop
        await addPlace(data);
      }
    }
  }

  // Create default rides
  if ((await Rides.find().countAsync()) === 0) {
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
