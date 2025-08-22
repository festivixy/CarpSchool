import { Meteor } from "meteor/meteor";
import { Schools } from "../schools/Schools";

/**
 * Get user's school
 */
export async function getUserSchool(userId) {
  if (!userId) return null;
  
  const user = await Meteor.users.findOneAsync(userId);
  if (!user || !user.schoolId) return null;
  
  return await Schools.findOneAsync(user.schoolId);
}

/**
 * Get current user's school
 */
export async function getCurrentUserSchool() {
  const userId = Meteor.userId();
  return await getUserSchool(userId);
}

/**
 * Check if user belongs to a specific school
 */
export async function userBelongsToSchool(userId, schoolId) {
  if (!userId || !schoolId) return false;
  
  const user = await Meteor.users.findOneAsync(userId);
  return user?.schoolId === schoolId;
}

/**
 * Validate user can access school-specific data
 */
export async function validateSchoolAccess(userId, schoolId) {
  const user = await Meteor.users.findOneAsync(userId);
  
  // Admins can access any school
  if (user?.roles?.includes("admin")) {
    return true;
  }
  
  // Users can only access their own school
  if (user?.schoolId === schoolId) {
    return true;
  }
  
  throw new Meteor.Error("access-denied", "You can only access data from your school");
}

/**
 * Get school filter for current user
 */
export async function getSchoolFilter(userId = null) {
  const currentUserId = userId || Meteor.userId();
  if (!currentUserId) {
    throw new Meteor.Error("not-logged-in", "Please log in first");
  }
  
  const user = await Meteor.users.findOneAsync(currentUserId);
  
  // Admins can see all schools if no specific school filter
  if (user?.roles?.includes("admin")) {
    return {}; // No filter for admins
  }
  
  // Regular users can only see their school
  if (!user?.schoolId) {
    throw new Meteor.Error("no-school", "User has no school assigned");
  }
  
  return { schoolId: user.schoolId };
}

/**
 * Auto-detect school from email domain
 */
export async function detectSchoolFromEmail(email) {
  if (!email || !email.includes('@')) return null;
  
  const domain = email.split('@')[1].toLowerCase();
  
  const school = await Schools.findOneAsync({ 
    domain: domain,
    isActive: true 
  });
  
  return school;
}
