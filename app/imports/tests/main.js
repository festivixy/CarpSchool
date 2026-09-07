/*
 * Test entry module. package.json declares meteor.mainModule, which turns
 * off eager loading; in test mode Meteor loads only meteor.testModule, so
 * every suite must be imported from here.
 */
import "./unit/adminNav.tests";
import "./unit/docContent.tests";
import "./unit/marketplaceMatching.tests";
import "./unit/placeCoords.tests";
import "./unit/RideValidation.tests";
import "./unit/RoleUtils.tests";
import "./unit/routeEstimate.tests";
import "./unit/SchoolDomain.tests";
import "./unit/validation.tests";
import "./integration/rides.tests";
import "./integration/roles.tests";
