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
      // Try to add role directly to user object as a fallback
      console.log('Attempting to add admin role directly to user...');
      await Meteor.users.updateAsync(adminUser._id, {
        $addToSet: { roles: 'admin' }
      });
      
      // Also try the Roles package method
      console.log('Attempting to use Roles.addUsersToRoles...');
      try {
        Roles.addUsersToRoles(adminUser._id, 'admin');
        console.log('Roles.addUsersToRoles completed successfully');
      } catch (roleError) {
        console.log('Roles.addUsersToRoles failed:', roleError.message);
      }
      
      // Check the updated user
      const updatedUser = await Meteor.users.findOneAsync(adminUser._id);
      console.log('Updated user:', updatedUser);
      
      // Check if role collections exist
      console.log('Checking role collections...');
      const roleAssignments = await Meteor.roleAssignment.find({}).fetchAsync();
      const roles = await Meteor.roles.find({}).fetchAsync();
      console.log('Role assignments:', roleAssignments);
      console.log('Roles:', roles);
      
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

console.log('Admin fix script loaded. Run fixAdminRole() in meteor shell if needed.');
