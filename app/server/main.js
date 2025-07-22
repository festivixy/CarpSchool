// First run setup
import "/imports/startup/server/FirstRun";

// Publications
import "/imports/api/chat/ChatPublications";
import "/imports/api/profile/ProfilePublications";
import "/imports/api/accounts/AccountsPublications";
import "/imports/api/images/ImagePublications";
import "/imports/api/ride/RidePublications";
import "/imports/api/captcha/CaptchaPublications";
import "/imports/api/places/PlacesPublications";

// Routes
import "/imports/startup/server/ServerRoutes";

// Methods
import "/imports/api/captcha/CaptchaMethods";
import "/imports/api/accounts/AccountsMethods";
import "/imports/api/images/ImageMethods";
import "/imports/api/chat/ChatMethods";
import "/imports/api/ride/RideMethods";
import "/imports/api/places/PlacesMethods";

// Accounts
import "/imports/api/accounts/AccountsHandlers";
import "/imports/api/accounts/AccountsConfig";
