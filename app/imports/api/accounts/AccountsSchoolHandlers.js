import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Schools } from "../schools/Schools";

// Note: This file is primarily for standard Meteor account creation
// Clerk users are created via ClerkMethods.js instead

// Meteor onCreateUser handler for non-Clerk users (if any)
// For Clerk users, creation is handled in ClerkMethods.js via Accounts.createUser()
// This handler can remain for API users or other programmatic accounts
Accounts.onCreateUser(async (options, user) => {
  // If this is a Clerk user, let it pass through
  // Clerk user creation is handled in ClerkMethods.js
  if (user.profile?.clerkUserId) {
    return {
      ...user,
      profile: {
        firstName: options.profile?.firstName || "",
        lastName: options.profile?.lastName || "",
        ...options.profile,
        clerkUserId: user.profile.clerkUserId,
      },
      roles: options.roles || [],
    };
  }

  // For non-Clerk users (API users, admin accounts, etc.)
  const newUser = {
    ...user,
    profile: {
      firstName: options.profile?.firstName || "",
      lastName: options.profile?.lastName || "",
      ...options.profile,
    },
    roles: options.roles || [],
  };

  const userEmail = newUser.emails?.[0]?.address;
  if (!userEmail) {
    throw new Meteor.Error("invalid-email", "Email address is required");
  }

  let schoolId = options.schoolId || null;

  // If no school provided, try to auto-detect from email domain
  if (!schoolId && options.autoDetectSchool !== false) {
    const emailParts = userEmail.split("@");
    const domain = emailParts[1];
    if (domain) {
      const school = await Schools.findOneAsync({
        domain: domain.toLowerCase(),
        isActive: true,
      });
      if (school) {
        schoolId = school._id;
        console.log(`🏫 Auto-detected school ${school.name} for ${userEmail}`);
      }
    }
  }

  // Validate school exists
  if (schoolId) {
    const school = await Schools.findOneAsync({ _id: schoolId, isActive: true });
    if (!school) {
      throw new Meteor.Error("invalid-school", "Selected school is not valid or active");
    }

    newUser.schoolId = schoolId;

    // Check if school requires email domain verification
    if (school.settings?.requireDomainMatch && school.domain) {
      const emailParts = userEmail.split("@");
      const emailDomain = emailParts.length === 2 && emailParts[1] ? emailParts[1].toLowerCase() : "";
      if (!emailDomain || emailDomain !== school.domain.toLowerCase()) {
        throw new Meteor.Error(
          "invalid-email-domain",
          `Email must be from ${school.domain} domain to join ${school.name}`,
        );
      }
    }
  }

  return newUser;
});
