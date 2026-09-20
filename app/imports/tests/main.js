/*
 * Test entry module. package.json declares meteor.mainModule, which turns
 * off eager loading; in test mode Meteor loads only meteor.testModule, so
 * every suite must be imported from here.
 */
import "./unit/adminNav.tests.js";
import "./unit/availabilityTime.tests.js";
import "./unit/docContent.tests.js";
import "./unit/marketplaceMatching.tests.js";
import "./unit/placeCoords.tests.js";
import "./unit/RideValidation.tests.js";
import "./unit/RoleUtils.tests.js";
import "./unit/routeEstimate.tests.js";
import "./unit/SchoolDomain.tests.js";
import "./unit/validation.tests.js";
import "./integration/rides.tests.js";
import "./integration/roles.tests.js";
import "./integration/legal.tests.js";
import "./integration/availability.tests.js";
import "./integration/directChat.tests.js";
import "./integration/testSchool.tests.js";
import "./integration/adminGrant.tests.js";
import "./integration/guardian.tests.js";
