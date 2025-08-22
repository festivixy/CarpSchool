// Email configuration
import { Meteor } from "meteor/meteor";

// Configure SMTP for iCloud+ custom domain
if (Meteor.isServer) {
  Meteor.startup(() => {
    // Debug SMTP environment variables
    console.log("🔧 SMTP Config Debug:");
    console.log("Server:", process.env.SMTP_SERVER || "DEFAULT: smtp.mail.me.com");
    console.log("Username:", process.env.SMTP_USERNAME || "DEFAULT: contact@carp.school");
    console.log("Password length:", (process.env.SMTP_PASSWORD || "default-password").length);
    console.log("Password set:", !!process.env.SMTP_PASSWORD ? "✅ YES" : "❌ NO");

    // iCloud SMTP Configuration (uses direct SSL on port 465)
    process.env.MAIL_URL = process.env.MAIL_URL ||
      `smtps://${encodeURIComponent(process.env.SMTP_USERNAME || "contact@carp.school")}:${encodeURIComponent(process.env.SMTP_PASSWORD || "your-app-specific-password")}@${process.env.SMTP_SERVER || "smtp.mail.me.com"}:465`;

    console.log("📧 Final MAIL_URL configured (password hidden)");
  });
}

// First run setup
import "../imports/startup/server/FirstRun";

// Publications
import "../imports/api/chat/ChatPublications";
import "../imports/api/profile/ProfilePublications";
import "../imports/api/accounts/AccountsPublications";
import "../imports/api/images/ImagePublications";
import "../imports/api/ride/RidePublications";
import "../imports/api/rideSession/RideSessionPublications";
import "../imports/api/captcha/CaptchaPublications";
import "../imports/api/places/PlacesPublications";
import "../imports/api/rateLimit/RateLimitPublications";
import "../imports/api/errorReport/ErrorReportPublications";
import "../imports/api/notifications/NotificationPublications";
import "../imports/api/system/SystemPublications";

// Routes
import "../imports/startup/server/ServerRoutes";

// Methods
import "../imports/api/captcha/CaptchaMethods";
import "../imports/api/accounts/AccountsMethods";
import "../imports/api/images/ImageMethods";
import "../imports/api/chat/ChatMethods";
import "../imports/api/ride/RideMethods";
import "../imports/api/rideSession/RideSessionMethods";
import "../imports/api/places/PlacesMethods";
import "../imports/api/rateLimit/RateLimitMethods";
import "../imports/api/errorReport/ErrorReportMethods";
import "../imports/api/notifications/NotificationMethods";
import "../imports/api/notifications/OneSignalMethods";
import "../imports/api/system/SystemMethods";
import "../imports/api/accounts/EmailTestMethods";

// Accounts
import "../imports/api/accounts/AccountsHandlers";
import "../imports/api/accounts/AccountsConfig";

// Push Notifications
import "../imports/startup/server/PushNotificationService";
import "../imports/startup/server/OneSignalService";
import "../imports/startup/server/NotificationIntegration";
