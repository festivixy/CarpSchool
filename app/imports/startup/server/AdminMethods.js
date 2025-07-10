import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Rides } from '../../api/ride/Rides';

Meteor.methods({
  async 'rides.remove'(rideId) {
    check(rideId, String);
    
    // Check if user is admin
    const user = await Meteor.userAsync();
    if (!user || !user.roles || !user.roles.includes('admin')) {
      throw new Meteor.Error('access-denied', 'You must be an admin to delete rides');
    }
    
    Rides.remove(rideId);
  },

  async 'rides.update'(rideId, updateData) {
    check(rideId, String);
    check(updateData, {
      driver: String,
      rider: String,
      origin: String,
      destination: String,
      date: String
    });
    
    // Check if user is admin
    const user = await Meteor.userAsync();
    if (!user || !user.roles || !user.roles.includes('admin')) {
      throw new Meteor.Error('access-denied', 'You must be an admin to edit rides');
    }
    
    // Only update fields that exist in the schema
    const allowedFields = {
      driver: updateData.driver,
      rider: updateData.rider,
      origin: updateData.origin,
      destination: updateData.destination,
      date: new Date(updateData.date)
    };
    
    Rides.update(rideId, { $set: allowedFields });
  },

  async 'users.remove'(userId) {
    check(userId, String);
    
    // Check if user is admin
    const user = await Meteor.userAsync();
    if (!user || !user.roles || !user.roles.includes('admin')) {
      throw new Meteor.Error('access-denied', 'You must be an admin to delete users');
    }
    
    // Prevent self-deletion
    if (userId === Meteor.userId()) {
      throw new Meteor.Error('invalid-operation', 'You cannot delete your own account');
    }
    
    Meteor.users.remove(userId);
  },

  async 'users.update'(userId, updateData) {
    check(userId, String);
    check(updateData, {
      username: String,
      firstName: String,
      lastName: String,
      email: String
    });
    
    // Check if user is admin
    const user = await Meteor.userAsync();
    if (!user || !user.roles || !user.roles.includes('admin')) {
      throw new Meteor.Error('access-denied', 'You must be an admin to edit users');
    }
    
    // Update user data
    Meteor.users.update(userId, {
      $set: {
        username: updateData.username,
        'profile.firstName': updateData.firstName,
        'profile.lastName': updateData.lastName,
        'emails.0.address': updateData.email
      }
    });
  },

  async 'users.toggleAdmin'(userId, action) {
    check(userId, String);
    check(action, String);
    
    // Check if user is admin
    const user = await Meteor.userAsync();
    if (!user || !user.roles || !user.roles.includes('admin')) {
      throw new Meteor.Error('access-denied', 'You must be an admin to modify user roles');
    }
    
    // Prevent removing admin role from self
    if (userId === Meteor.userId() && action === 'remove') {
      throw new Meteor.Error('invalid-operation', 'You cannot remove admin role from yourself');
    }
    
    if (action === 'add') {
      Meteor.users.update(userId, { $addToSet: { roles: 'admin' } });
    } else if (action === 'remove') {
      Meteor.users.update(userId, { $pull: { roles: 'admin' } });
    }
  }
});
