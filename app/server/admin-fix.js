// Temporary admin role fix script
// Run this in meteor shell if admin role isn't working

import { Meteor } from 'meteor/meteor';

// Function to manually assign admin role
async function fixAdminRole() {
  console.log('Fixing admin role...');
  
  // Find admin user
  const adminUser = await Meteor.users.findOneAsync({ 'emails.address': 'admin@foo.com' });
  
  if (adminUser) {
    console.log('Found admin user:', adminUser._id);
    
    try {
      // Add role directly to user object (our current role system)
      console.log('Adding admin role directly to user...');
      await Meteor.users.updateAsync(adminUser._id, {
        $addToSet: { roles: 'admin' }
      });
      
      // Check the updated user
      const updatedUser = await Meteor.users.findOneAsync(adminUser._id);
      console.log('Updated user roles:', updatedUser.roles);
      console.log('Admin role fix completed successfully!');
      
      return true;
    } catch (error) {
      console.error('Error assigning admin role:', error);
      return false;
    }
  } else {
    console.log('Admin user not found!');
    return false;
  }
}

// Export for meteor shell
global.fixAdminRole = fixAdminRole;

// Auto-run on startup
Meteor.startup(async () => {
  console.log('Auto-running admin role fix on startup...');
  try {
    await fixAdminRole();
    console.log('Admin role fix completed on startup.');
  } catch (error) {
    console.error('Error running admin role fix on startup:', error);
  }
});

console.log('Admin fix script loaded. Run fixAdminRole() in meteor shell if needed.');
