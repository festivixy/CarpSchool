import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import { Rides } from "../../api/ride/Rides";
import { Places } from "../../api/places/Places";
import { Captcha } from "../../api/captcha/Captcha";
import { Schools } from "../../api/schools/Schools";

/* eslint-disable no-console */

async function createSchool(schoolData) {
  console.log(`  Creating school: ${schoolData.name} (${schoolData.code})`);

  const school = {
    ...schoolData,
    code: schoolData.code.toUpperCase(),
    isActive: true,
    createdAt: new Date(),
    createdBy: "system",
  };

  const schoolId = await Schools.insertAsync(school);
  console.log(`  School ${schoolData.name} created with ID: ${schoolId}`);
  return schoolId;
}

async function createUser(email, firstName, lastName, password, role, schoolCode) {
  const captchaSessionId = await Captcha.insertAsync({
    text: "dummy-captcha-text",
    timestamp: Date.now(),
    solved: true,
    used: false,
  });
  console.log(`  Created dummy captcha session ID: ${captchaSessionId}`);
  // Find school by code if provided
  let school = null;
  if (schoolCode) {
    school = await Schools.findOneAsync({ code: schoolCode.toUpperCase() });
    if (!school) {
      throw new Error(`School with code ${schoolCode} not found`);
    }
  }

  console.log(`  Creating user ${email}${school ? ` for school ${school.name}` : ""}.`);
  const userID = await new Promise((resolve, _reject) => {
    const id = Accounts.createUser({
      username: email,
      profile: {
        firstName: firstName,
        lastName: lastName,
        captchaSessionId: captchaSessionId,
      },
      email: email,
      password: password,
      captchaSessionId: captchaSessionId,
      schoolId: school ? school._id : null,
    });
    resolve(id);
  });

  // Assign roles based on type
  if (role === "system") {
    console.log(`  Assigning system role to user ${email} with ID ${userID}`);
    await Meteor.users.updateAsync(userID, {
      $set: { roles: ["system"] },
    });
    console.log(`  System role assignment completed for user ${email}`);
  } else if (role === "admin" && school) {
    console.log(`  Assigning school admin role to user ${email} with ID ${userID}`);
    await Meteor.users.updateAsync(userID, {
      $set: { roles: [`admin.${school._id}`] },
    });
    console.log(`  School admin role assignment completed for user ${email}`);
  }

  return userID;
}

async function addPlace(data) {
  console.log(`  Adding: Place "${data.text}" for ${data.createdBy}`);

  // Find the user by email to get their user ID
  let user = await Meteor.users.findOneAsync({
    $or: [
      { "emails.address": data.createdBy },
      { username: data.createdBy },
      { "emails.0.address": data.createdBy },
    ],
  });

  // If still not found, try a more exhaustive search
  if (!user) {
    user = await Meteor.users.findOneAsync({
      $or: [
        { emails: { $elemMatch: { address: data.createdBy } } },
        { username: data.createdBy },
      ],
    });
  }

  if (!user) {
    console.error(`    Error: User not found for ${data.createdBy}`);
    console.log(
      "    Available users:",
      await Meteor.users
        .find({}, { fields: { emails: 1, username: 1 } })
        .fetchAsync(),
    );
    return;
  }

  // Generate SHA256 hashed UUID for place ID
  const uuid = uuidv4();
  const hashedId = crypto.createHash("sha256").update(uuid).digest("hex");

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
    // Check for existing place by text and user
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
    // Use the SHA256 hashed UUID as the place ID
    placeData._id = hashedId;
  }

  console.log(`    Generated place ID: ${placeData._id} (from UUID: ${uuid})`);

  await Places.insertAsync(placeData);
}

async function addRide(data) {
  console.log(`  Adding: Ride from ${data.driver} `);

  // Convert legacy ride format to new format if needed
  const rideData = { ...data };

  // If this is legacy format (has 'rider' field), convert to new format
  if (rideData.rider !== undefined && rideData.riders === undefined) {
    console.log("    Converting legacy ride format to new schema");
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

  // Validate and resolve origin and destination places
  if (rideData.origin) {
    let originPlace = await Places.findOneAsync({ _id: rideData.origin });
    // If not found by ID, try to find by text (place name)
    if (!originPlace) {
      originPlace = await Places.findOneAsync({ text: rideData.origin });
      if (originPlace) {
        console.log(
          `    Resolved origin "${rideData.origin}" to place ID: ${originPlace._id}`,
        );
        rideData.origin = originPlace._id;
      } else {
        console.error(
          `    Error: Origin place "${rideData.origin}" not found by ID or name`,
        );
        return;
      }
    }
  }

  if (rideData.destination) {
    let destinationPlace = await Places.findOneAsync({
      _id: rideData.destination,
    });
    // If not found by ID, try to find by text (place name)
    if (!destinationPlace) {
      destinationPlace = await Places.findOneAsync({
        text: rideData.destination,
      });
      if (destinationPlace) {
        console.log(
          `    Resolved destination "${rideData.destination}" to place ID: ${destinationPlace._id}`,
        );
        rideData.destination = destinationPlace._id;
      } else {
        console.error(
          `    Error: Destination place "${rideData.destination}" not found by ID or name`,
        );
        return;
      }
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

    await Promise.all(legacyRides.map(async (ride) => {
      const updateData = {
        riders: ride.rider === "TBD" ? [] : [ride.rider],
        seats: ride.seats || 1,
        notes: ride.notes || "",
        createdAt: ride.createdAt || new Date(),
      };

      return Rides.updateAsync(ride._id, {
        $set: updateData,
        $unset: { rider: "" },
      });
    }));

    console.log(`Successfully migrated ${legacyRides.length} legacy rides.`);
  }
}

/** When running app for first time, pass a settings file to set up a default user account. */
Meteor.startup(async () => {
  // Migrate any existing legacy ride data
  await migrateLegacyRides();

  // Create default schools first
  if ((await Schools.find().countAsync()) === 0) {
    if (Meteor.settings.defaultSchools) {
      console.log("Creating the default school(s)");
      for (const schoolData of Meteor.settings.defaultSchools) { // eslint-disable-line
        await createSchool(schoolData);
      }
      // Wait a moment for schools to be fully indexed
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
    }
  }

  // Create default users
  if ((await Meteor.users.find().countAsync()) === 0) {
    if (Meteor.settings.defaultAccounts) {
      console.log("Creating the default user(s)");
      for (const { email, firstName, lastName, password, role, schoolCode } of Meteor // eslint-disable-line
        .settings.defaultAccounts) {
        await createUser(email, firstName, lastName, password, role, schoolCode);
      }
      // Wait a moment for all users to be fully indexed
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      });
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
