import { Meteor } from "meteor/meteor";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

// Load environment variables from .env file if it exists
const envPath = path.resolve(process.cwd(), "../.env");
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

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
import "../imports/api/reviews/ReviewPublications";

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
// eslint-disable-next-line import/first -- every import below the dotenv block trips this rule
import "../imports/api/admin/AdminDashboardMethods";
import "../imports/api/accounts/ClerkMethods";
import "../imports/api/accounts/ClerkLoginHandler";
import "../imports/startup/server/AdminBootstrap";
import "../imports/api/accounts/RegistrationMethods";
import "../imports/api/accounts/RegistrationRateLimits";
import "../imports/api/accounts/DeleteAccountMethods";
import "../imports/api/reviews/ReviewMethods";

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
    // ROOT_URL must be provided by the environment in production. It is the
    // base for email links and OAuth redirects, so a wrong value breaks
    // sign-in. Do not hardcode a domain here: fall back only to a local URL
    // for development, and warn loudly if it is missing in production.
    if (!process.env.ROOT_URL) {
      process.env.ROOT_URL = `http://localhost:${process.env.PORT || 3000}`;
      if (process.env.NODE_ENV === "production") {
        console.warn(`⚠️  ROOT_URL not set in production; using ${process.env.ROOT_URL}. Set ROOT_URL to your domain.`);
      }
    }

    // Email configuration check
    if (!process.env.MAIL_URL) {
      console.warn("⚠️  MAIL_URL not set - email functionality will not work");
    }
  });
}
