import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { Schools } from "../schools/Schools";
import { detectSchoolFromEmail } from "./AccountsSchoolUtils";

// Extend the existing onCreateUser to handle school assignment
Accounts.onCreateUser(async (options, user) => {
  // Create user with default profile structure
  const newUser = {
    ...user,
    profile: {
      firstName: options.profile?.firstName || "",
      lastName: options.profile?.lastName || "",
      ...options.profile,
    },
    roles: options.roles || [],
  };

  // Handle school assignment - safely access email
  const userEmail = newUser.emails?.[0]?.address;
  if (!userEmail) {
    throw new Meteor.Error("invalid-email", "Email address is required for registration");
  }
  let schoolId = options.schoolId || null;

  // If no school provided, try to auto-detect from email domain
  if (!schoolId) {
    const detectedSchool = await detectSchoolFromEmail(userEmail);
    if (detectedSchool) {
      schoolId = detectedSchool._id;
      console.log(`🏫 Auto-detected school ${detectedSchool.name} for ${userEmail}`);
    }
  }

  // Validate school exists
  if (schoolId) {
    const school = await Schools.findOneAsync({ _id: schoolId, isActive: true });
    if (school) {
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
    } else {
      throw new Meteor.Error("invalid-school", "Selected school is not valid or active");
    }
  }
  // School selection will happen later in the onboarding process

  // Send verification email after user is saved to database (existing logic)
  // userEmail was already validated earlier, so this is safe
  Meteor.setTimeout(async () => {
    try {
      const savedUser = await Meteor.users.findOneAsync({ "emails.address": userEmail });
      if (savedUser && process.env.MAIL_URL) {
        Accounts.sendVerificationEmail(savedUser._id);
        console.log(`📧 Verification email sent to ${userEmail}`);
      } else if (!process.env.MAIL_URL) {
        console.warn(`⚠️  MAIL_URL not configured - skipping verification email for ${userEmail}`);
      }
    } catch (error) {
      console.error(`❌ Failed to send verification email to ${userEmail}:`, error.message || error);
    }
  }, 2000);

  return newUser;
});
