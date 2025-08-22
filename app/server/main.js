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

// Accounts
import "../imports/api/accounts/AccountsHandlers";
import "../imports/api/accounts/AccountsConfig";

// Push Notifications
import "../imports/startup/server/PushNotificationService";
import "../imports/startup/server/OneSignalService";
import "../imports/startup/server/NotificationIntegration";
