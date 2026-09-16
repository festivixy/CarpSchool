import { Meteor } from "meteor/meteor";
import { Schools } from "../../imports/api/schools/Schools";
import { Rides } from "../../imports/api/ride/Rides";
import { Places } from "../../imports/api/places/Places";

/**
 * Migration script to add school support to existing CarpSchool installation
 *
 * This script should be run ONCE when upgrading to multi-school support
 *
 * Usage:
 * 1. In Meteor shell: import './server/migrations/addSchoolSupport.js'
 * 2. Run: await migrateToSchoolSupport()
 */

export async function createDefaultSchool() {
  console.log("Creating default school...");

  // Check if any schools already exist
  const existingSchool = await Schools.findOneAsync({});
  if (existingSchool) {
    console.log("Schools already exist, skipping default school creation");
    return existingSchool._id;
  }

  // Create a default school for existing data
  const defaultSchoolId = await Schools.insertAsync({
    name: "CarpSchool School", // Change this to your institution
    shortName: "CSU",
    code: "CSU",
    domain: "carpschool.edu", // Change this to your domain
    location: {
      city: "Vancouver",
      province: "BC",
      country: "Canada",
      coordinates: {
        lat: 49.2827,
        lng: -123.1207,
      },
    },
    settings: {
      allowPublicRegistration: true,
      requireEmailVerification: true,
      requireDomainMatch: false,
      maxRideDistance: 50,
    },
    isActive: true,
    createdAt: new Date(),
    createdBy: "system-migration",
  });

  console.log(`Created default school with ID: ${defaultSchoolId}`);
  return defaultSchoolId;
}

export async function migrateUsersToSchool(defaultSchoolId) {
  console.log("Migrating existing users to default school...");

  const usersWithoutSchool = await Meteor.users.find({
    schoolId: { $exists: false },
  }).fetchAsync();

  console.log(`Found ${usersWithoutSchool.length} users without school assignment`);

  let migratedCount = 0;
  for (const user of usersWithoutSchool) { // eslint-disable-line no-restricted-syntax
    await Meteor.users.updateAsync(user._id, {
      $set: { schoolId: defaultSchoolId },
    });
    migratedCount++;
  }

  console.log(`Migrated ${migratedCount} users to default school`);
}

export async function migrateRidesToSchool(defaultSchoolId) {
  console.log("Migrating existing rides to default school...");

  const ridesWithoutSchool = await Rides.find({
    schoolId: { $exists: false },
  }).fetchAsync();

  console.log(`Found ${ridesWithoutSchool.length} rides without school assignment`);

  let migratedCount = 0;
  for (const ride of ridesWithoutSchool) { // eslint-disable-line no-restricted-syntax
    await Rides.updateAsync(ride._id, {
      $set: { schoolId: defaultSchoolId },
    });
    migratedCount++;
  }

  console.log(`Migrated ${migratedCount} rides to default school`);
}

export async function migratePlacesToSchool(defaultSchoolId) {
  console.log("Migrating existing places to default school...");

  const placesWithoutSchool = await Places.find({
    schoolId: { $exists: false },
  }).fetchAsync();

  console.log(`Found ${placesWithoutSchool.length} places without school assignment`);

  let migratedCount = 0;
  for (const place of placesWithoutSchool) { // eslint-disable-line no-restricted-syntax
    await Places.updateAsync(place._id, {
      $set: { schoolId: defaultSchoolId },
    });
    migratedCount++;
  }

  console.log(`Migrated ${migratedCount} places to default school`);
}

/**
 * Main migration function - runs all migrations in order
 */
export async function migrateToSchoolSupport() {
  console.log("Starting migration to multi-school support...");

  try {
    // Step 1: Create default school
    const defaultSchoolId = await createDefaultSchool();

    // Step 2: Migrate all existing data to default school
    await migrateUsersToSchool(defaultSchoolId);
    await migrateRidesToSchool(defaultSchoolId);
    await migratePlacesToSchool(defaultSchoolId);

    console.log("Migration completed successfully!");
    console.log("Summary:");
    console.log(`   - Default school created: ${defaultSchoolId}`);
    console.log("   - All existing users, rides, and places assigned to default school");
    console.log("   - Ready for multi-school operation!");

    return {
      success: true,
      defaultSchoolId,
      message: "Migration completed successfully",
    };

  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Auto-run migration on server startup if needed
Meteor.startup(async () => {
  // Uncomment the next line to auto-run migration on server startup
  // await migrateToSchoolSupport();
});
