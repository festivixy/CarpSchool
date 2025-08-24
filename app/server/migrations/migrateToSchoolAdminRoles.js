import { Meteor } from "meteor/meteor";

/**
 * Migration script to convert global admin roles to school-specific admin roles
 *
 * This migrates:
 * - "admin" role → "admin.{schoolId}" for users with assigned schools
 * - "admin" users without school → get first available school or remain as system admin
 *
 * Usage:
 * 1. In Meteor shell: import './server/migrations/migrateToSchoolAdminRoles.js'
 * 2. Run: await migrateAdminRolesToSchoolSpecific()
 */

export async function migrateAdminRolesToSchoolSpecific() {
  console.log("🔧 Starting migration of admin roles to school-specific system...");

  try {
    // Find all users with "admin" role
    const adminUsers = await Meteor.users.find({
      roles: "admin",
    }).fetchAsync();

    console.log(`Found ${adminUsers.length} users with global admin role`);

    if (adminUsers.length === 0) {
      console.log("✅ No global admin users found - migration not needed");
      return { success: true, message: "No migration needed" };
    }

    const { Schools } = await import("../../imports/api/schools/Schools");

    let migratedCount = 0;
    let systemAdminCount = 0;

    for (const user of adminUsers) {
      console.log(`Processing admin user: ${user.emails[0].address}`);

      // Remove old "admin" role
      await Meteor.users.updateAsync(user._id, {
        $pull: { roles: "admin" },
      });

      if (user.schoolId) {
        // User has a school - convert to school admin
        const schoolAdminRole = `admin.${user.schoolId}`;
        await Meteor.users.updateAsync(user._id, {
          $addToSet: { roles: schoolAdminRole },
        });

        console.log(`  ✅ Converted to school admin: ${schoolAdminRole}`);
        migratedCount++;

      } else {
        // User has no school - check if any schools exist
        const firstSchool = await Schools.findOneAsync({ isActive: true });

        if (firstSchool) {
          // Assign to first available school and make school admin
          await Meteor.users.updateAsync(user._id, {
            $set: { schoolId: firstSchool._id },
            $addToSet: { roles: `admin.${firstSchool._id}` },
          });

          console.log(`  ✅ Assigned to school ${firstSchool.name} and made admin`);
          migratedCount++;

        } else {
          // No schools exist - make system admin
          await Meteor.users.updateAsync(user._id, {
            $addToSet: { roles: "system" },
          });

          console.log("  🌟 Converted to system admin (no schools available)");
          systemAdminCount++;
        }
      }
    }

    console.log("🎉 Admin role migration completed successfully!");
    console.log("📊 Summary:");
    console.log(`   - School admins created: ${migratedCount}`);
    console.log(`   - System admins created: ${systemAdminCount}`);
    console.log(`   - Total users processed: ${adminUsers.length}`);

    return {
      success: true,
      migratedCount,
      systemAdminCount,
      totalProcessed: adminUsers.length,
      message: "Admin role migration completed successfully",
    };

  } catch (error) {
    console.error("❌ Admin role migration failed:", error);
    throw error;
  }
}

/**
 * Create a system administrator (for initial setup)
 */
export async function createSystemAdmin(userEmail) {
  console.log(`🌟 Creating system admin for: ${userEmail}`);

  const user = await Meteor.users.findOneAsync({
    "emails.address": userEmail,
  });

  if (!user) {
    throw new Error(`User with email ${userEmail} not found`);
  }

  // Add system role
  await Meteor.users.updateAsync(user._id, {
    $addToSet: { roles: "system" },
  });

  console.log(`✅ ${userEmail} is now a system administrator`);
  return true;
}

/**
 * Verify role migration results
 */
export async function verifyRoleMigration() {
  console.log("🔍 Verifying role migration results...");

  const globalAdmins = await Meteor.users.find({ roles: "admin" }).countAsync();
  const systemAdmins = await Meteor.users.find({ roles: "system" }).countAsync();
  const schoolAdmins = await Meteor.users.find({
    roles: { $regex: /^admin\./ },
  }).countAsync();

  console.log("📊 Current role distribution:");
  console.log(`   - Global admins (should be 0): ${globalAdmins}`);
  console.log(`   - System admins: ${systemAdmins}`);
  console.log(`   - School admins: ${schoolAdmins}`);

  if (globalAdmins > 0) {
    console.warn(`⚠️  Warning: ${globalAdmins} users still have global admin role`);
  } else {
    console.log("✅ Migration successful - no global admin roles remaining");
  }

  return {
    globalAdmins,
    systemAdmins,
    schoolAdmins,
    migrationComplete: globalAdmins === 0,
  };
}

// Auto-run migration on server startup if needed
Meteor.startup(async () => {
  // Uncomment the next line to auto-run admin role migration on server startup
  // await migrateAdminRolesToSchoolSpecific();
});
