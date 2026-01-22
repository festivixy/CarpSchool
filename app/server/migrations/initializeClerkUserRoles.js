import { Meteor } from "meteor/meteor";

/**
 * Migration: Initialize roles array for existing Clerk users
 * 
 * After Clerk migration, some users may not have a roles array initialized.
 * This migration ensures all users (especially Clerk users) have a roles array.
 */
export async function initializeClerkUserRoles() {
  console.log("🔄 Starting Clerk user roles initialization migration...");

  try {
    // Find all users without a roles field or with null/undefined roles
    const usersWithoutRoles = await Meteor.users.find({
      $or: [
        { roles: { $exists: false } },
        { roles: null },
        { roles: { $not: { $type: "array" } } }
      ]
    }).fetchAsync();

    console.log(`📊 Found ${usersWithoutRoles.length} users without proper roles array`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutRoles) {
      try {
        await Meteor.users.updateAsync(user._id, {
          $set: { roles: [] }
        });

        console.log(`✅ Initialized roles for user ${user._id} (${user.username || user.emails?.[0]?.address})`);
        updatedCount++;
      } catch (err) {
        console.error(`❌ Error updating user ${user._id}:`, err);
        errorCount++;
      }
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`   ✅ Successfully updated: ${updatedCount} users`);
    console.log(`   ❌ Errors: ${errorCount} users`);
    console.log(`   📊 Total processed: ${usersWithoutRoles.length} users`);

    // Log some stats about Clerk users
    const clerkUsers = await Meteor.users.find({
      "profile.clerkUserId": { $exists: true }
    }).countAsync();

    const clerkUsersWithRoles = await Meteor.users.find({
      "profile.clerkUserId": { $exists: true },
      roles: { $exists: true, $type: "array" }
    }).countAsync();

    console.log(`\n👥 Clerk Users Stats:`);
    console.log(`   Total Clerk users: ${clerkUsers}`);
    console.log(`   Clerk users with roles array: ${clerkUsersWithRoles}`);

    console.log("\n✅ Clerk user roles initialization migration completed!");
    return { success: true, updated: updatedCount, errors: errorCount };

  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Auto-run migration on server startup if needed
Meteor.startup(async () => {
  // Check if migration is needed
  const usersNeedingMigration = await Meteor.users.find({
    $or: [
      { roles: { $exists: false } },
      { roles: null },
      { roles: { $not: { $type: "array" } } }
    ]
  }).countAsync();

  if (usersNeedingMigration > 0) {
    console.log(`⚠️  Found ${usersNeedingMigration} users needing roles initialization`);
    console.log("🚀 Running automatic roles initialization migration...");
    
    try {
      await initializeClerkUserRoles();
    } catch (err) {
      console.error("❌ Automatic migration failed:", err);
      console.log("💡 You can manually run the migration by calling initializeClerkUserRoles()");
    }
  } else {
    console.log("✅ All users have proper roles array initialized");
  }
});
