import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Accounts } from "meteor/accounts-base";
import { Profiles } from "../profile/Profile";
import { Schools } from "../schools/Schools";
import { Rides } from "../ride/Rides";
import { TERMS_VERSION } from "../legal/terms";
import { schoolForEmail } from "./SchoolDomain";
import { isAllowListedEmail } from "./ClerkLoginHandler";

Meteor.methods({

  /**
   * Get or create Meteor user from Clerk user ID
   * This links Clerk auth to your existing Meteor user structure
   */
  "clerk.getMeteorUser": async function(clerkUserId) {
    check(clerkUserId, String);

    // The caller's identity comes from the DDP session, never from the
    // argument. Previously this method took an arbitrary Clerk id from an
    // anonymous caller and returned that user's whole document (login token
    // hashes included), or created an account for it with no school check.
    // Account creation belongs to the login handler alone.
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in");
    }

    const user = await Meteor.users.findOneAsync(this.userId, {
      fields: {
        roles: 1,
        schoolId: 1,
        emails: 1,
        "profile.clerkUserId": 1,
        "profile.firstName": 1,
        "profile.lastName": 1,
        "profile.name": 1,
        "profile.imageUrl": 1,
        createdAt: 1,
      },
    });

    if (!user) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    return user;
  },

  /**
   * Complete onboarding for Clerk users
   */
  "clerk.completeOnboarding": async function(profileData) {
    check(profileData, Object);

    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Authentication required");
    }

    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    // One profile per user. Four code paths can insert a profile and only
    // one of them checked for an existing one.
    const existingProfile = await Profiles.findOneAsync({ Owner: this.userId }, { fields: { _id: 1 } });
    if (existingProfile) {
      throw new Meteor.Error("profile-exists", "You have already completed onboarding");
    }

    // Every field is an optional, bounded string. check(Object) alone let
    // objects and unbounded strings through into the profile document.
    const bounded = (max) => Match.Where((v) => typeof v === "string" && v.length <= max);
    check(profileData, {
      // Acceptance of the Terms of Use and Privacy Policy is mandatory. It is
      // checked here, not only in the UI, so a crafted call cannot skip it.
      acceptedTerms: Boolean,
      name: Match.Optional(bounded(100)),
      userType: Match.Optional(Match.OneOf("Driver", "Rider", "Both")),
      accountType: Match.Optional(Match.OneOf("student", "parent")),
      major: Match.Optional(bounded(100)),
      year: Match.Optional(bounded(30)),
      phone: Match.Optional(bounded(20)),
      other: Match.Optional(bounded(500)),
      image: Match.Optional(bounded(64)),
      ride: Match.Optional(bounded(64)),
    });
    if (profileData.acceptedTerms !== true) {
      throw new Meteor.Error("terms-required", "You must accept the Terms of Use and Privacy Policy to continue.");
    }

    const accountType = profileData.accountType || "student";

    const profileDoc = {
      Owner: this.userId,
      Name: profileData.name || "",
      schoolemail: user.emails?.[0]?.address || "",
      UserType: profileData.userType || "Driver",
      major: profileData.major || "",
      year: profileData.year || "",
      Phone: profileData.phone || "",
      Other: profileData.other || "",
      // Onboarding uploads the photos through images.upload and passes the
      // returned uuids here. Without these two fields the uuids were dropped
      // and the profile was created with no avatar or vehicle photo.
      Image: profileData.image || "",
      Ride: profileData.ride || "",
      accountType,
      guardianOf: [],
      verified: false,
      /* A parent has nothing tying them to a school until a student claims
       * them, so they stay out of the approval queue rather than arriving in
       * it as an unattached stranger for an administrator to puzzle over.
       * profiles.claimGuardian is what puts them in. */
      requested: accountType !== "parent",
      termsAcceptedAt: new Date(),
      termsVersion: TERMS_VERSION,
      rejected: false,
      createdAt: new Date(),
    };

    // insertAsync: sync insert throws on the Meteor 3 server, so onboarding
    // could never create the profile.
    await Profiles.insertAsync(profileDoc);

    return { success: true };
  },

  /**
   * Assign school to Clerk-linked user
   */
  "clerk.assignSchool": async function(schoolId) {
    check(schoolId, String);

    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Authentication required");
    }

    // Only an active school that accepts public sign-ups may be chosen, and
    // only once: a user who already belongs to a school cannot move
    // themselves into another tenant.
    const currentUser = await Meteor.users.findOneAsync(this.userId, { fields: { schoolId: 1 } });
    if (currentUser?.schoolId) {
      throw new Meteor.Error("school-already-set", "Your account already belongs to a school");
    }
    const school = await Schools.findOneAsync(
      { _id: schoolId, isActive: true },
      { fields: { _id: 1, settings: 1 } },
    );
    if (!school) {
      throw new Meteor.Error("school-not-found", "School not found");
    }
    if (school.settings && school.settings.allowPublicRegistration === false) {
      throw new Meteor.Error("registration-closed", "This school does not accept self-service sign-ups");
    }

    /* Signing up no longer requires a school email, so picking a school can no
     * longer be a free choice: it is the one step that would let an account
     * with no connection to a community place itself inside one. The caller
     * must either verify an address on the school's own domain, or be listed
     * in settings. Everyone else reaches a school by being claimed. */
    const caller = await Meteor.users.findOneAsync(this.userId, { fields: { emails: 1 } });
    const address = caller?.emails?.[0]?.address || "";
    const { school: matched } = await schoolForEmail(address);
    const mayChoose = matched?._id === school._id || isAllowListedEmail(address);
    if (!mayChoose) {
      throw new Meteor.Error(
        "school-email-required",
        "Choose a school by signing up with its email address. "
        + "If you are a parent or guardian, ask your student to add you from their profile.",
      );
    }

    // updateAsync: the sync form throws on the Meteor 3 server, so this method
    // failed and the user's schoolId was never set - leaving every school-scoped
    // query reporting "User has no school assigned".
    await Meteor.users.updateAsync(this.userId, {
      $set: { schoolId }
    });

    return { success: true };
  },

  /**
   * Update user profile from Clerk user data
   */
  "clerk.syncUserProfile": async function(clerkData) {
    check(clerkData, Object);

    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Authentication required");
    }

    const updateData = {};

    if (clerkData.firstName) {
      updateData["profile.firstName"] = clerkData.firstName;
    }
    if (clerkData.lastName) {
      updateData["profile.lastName"] = clerkData.lastName;
    }
    if (clerkData.imageUrl) {
      updateData["profile.imageUrl"] = clerkData.imageUrl;
    }

    // Roles are never taken from the client. They are granted only by the
    // admin methods and AdminBootstrap; the previous branch here let any
    // user write publicMetadata.roles onto their own account.

    if (Object.keys(updateData).length > 0) {
      await Meteor.users.updateAsync(this.userId, {
        $set: updateData
      });
    }

    return { success: true };
  },

  /**
   * Initialize roles for existing Clerk users that don't have roles array
   * This is for migration purposes
   */
  "clerk.initializeRoles": async function() {
    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Authentication required");
    }

    const user = await Meteor.users.findOneAsync(this.userId);
    if (!user) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    // Only initialize if roles array doesn't exist
    if (!user.roles) {
      await Meteor.users.updateAsync(this.userId, {
        $set: { roles: [] }
      });
      console.log(`Initialized roles array for Clerk user: ${this.userId}`);
    }

    return { success: true, hadRoles: !!user.roles };
  },

  /**
   * Get user's current roles (for Clerk users to check their permissions)
   */
  "clerk.getUserRoles": async function() {
    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Authentication required");
    }

    const user = await Meteor.users.findOneAsync(
      this.userId,
      { fields: { roles: 1, schoolId: 1, "profile.clerkUserId": 1 } }
    );

    if (!user) {
      throw new Meteor.Error("user-not-found", "User not found");
    }

    return {
      roles: user.roles || [],
      schoolId: user.schoolId || null,
      isClerkUser: !!user.profile?.clerkUserId,
    };
  },

  /**
   * Aggregate counts for the onboarding wizard's social-proof panel.
   *
   * Totals only - no document contents - so nothing about another student is
   * exposed to an account that has not been approved yet.
   */
  async "onboarding.stats"() {
    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Authentication required");
    }

    const [schoolCount, rideCount] = await Promise.all([
      Schools.find({ isActive: true }).countAsync(),
      Rides.find({}).countAsync(),
    ]);

    return { schoolCount, rideCount };
  },
});
