// Email configuration
import { Meteor } from "meteor/meteor";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config({ path: '../.env' });

// First run setup
import "../imports/startup/server/FirstRun";

// Publications
import "../imports/api/chat/ChatPublications";
import "../imports/api/profile/ProfilePublications";
import "../imports/api/accounts/AccountsPublications";
import "../imports/api/images/ImagePublications";
import "../imports/api/verification/VerificationPublications";
import "../imports/api/verification/SchoolEmailVerificationPublications";
import "../imports/api/profile/AdminApprovalPublications";
import "../imports/api/ride/RidePublications";
import "../imports/api/rideSession/RideSessionPublications";
import "../imports/api/captcha/CaptchaPublications";
import "../imports/api/places/PlacesPublications";
import "../imports/api/rateLimit/RateLimitPublications";
import "../imports/api/errorReport/ErrorReportPublications";
import "../imports/api/notifications/NotificationPublications";
import "../imports/api/system/SystemPublications";
import "../imports/api/schools/SchoolsPublications";

// Routes
import "../imports/startup/server/ApiRoutes";
import "../imports/startup/server/ServerRoutes";

// Methods
import "../imports/api/captcha/CaptchaMethods";
import "../imports/api/accounts/AccountsMethods";
import "../imports/api/images/ImageMethods";
import "../imports/api/verification/VerificationMethods";
import "../imports/api/verification/SchoolEmailVerificationMethods";
import "../imports/api/profile/ProfileMethods";
import "../imports/api/profile/AdminApprovalMethods";
import "../imports/api/schools/SchoolSettingsMethods";
import "../imports/api/chat/ChatMethods";
import "../imports/api/ride/RideMethods";
import "../imports/api/rideSession/RideSessionMethods";
import "../imports/api/places/PlacesMethods";
import "../imports/api/rateLimit/RateLimitMethods";
import "../imports/api/errorReport/ErrorReportMethods";
import "../imports/api/notifications/NotificationMethods";
import "../imports/api/notifications/OneSignalMethods";
import "../imports/api/system/SystemMethods";
import "../imports/api/schools/SchoolsMethods";
import "../imports/api/accounts/AdminMethods";
import "../imports/api/accounts/ClerkMethods";
import "../imports/api/accounts/RegistrationMethods";
import "../imports/api/accounts/RegistrationRateLimits";
import "../imports/api/accounts/DeleteAccountMethods";

// Accounts
import "../imports/api/accounts/AccountsHandlers"; // Login validation and logout handlers
import "../imports/api/accounts/AccountsSchoolHandlers"; // User creation with school assignment
import "../imports/api/accounts/AccountsConfig";

// Push Notifications
import "../imports/startup/server/PushNotificationService";
import "../imports/startup/server/OneSignalService";
import "../imports/startup/server/NotificationIntegration";

// Background Jobs
import "../imports/startup/server/LocationCleanup";

// Migrations
import "./migrations/addSchoolSupport";
import "./migrations/migrateToSchoolAdminRoles";
import "./migrations/initializeClerkUserRoles";

// Configure SMTP for iCloud+ custom domain and ROOT_URL
if (Meteor.isServer) {
  Meteor.startup(() => {
    // ROOT_URL configuration - ensure clean URLs for email links
    if (!process.env.ROOT_URL) {
      // Set default production URL if not specified
      process.env.ROOT_URL = 'https://carp.school';
      console.log("🔗 ROOT_URL set to default: https://carp.school");
    } else if (process.env.ROOT_URL.includes('dev.')) {
      // Override dev URLs to production URLs for clean email links
      process.env.ROOT_URL = process.env.ROOT_URL.replace(/https?:\/\/dev\./, 'https://');
      console.log(`🔗 ROOT_URL cleaned from dev to: ${process.env.ROOT_URL}`);
    }

    // Email configuration check
    if (!process.env.MAIL_URL) {
      console.warn("⚠️  MAIL_URL not set - email functionality will not work");
    }
  });
}
