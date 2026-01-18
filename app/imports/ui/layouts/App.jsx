import React from "react";
import PropTypes from "prop-types";
import "semantic-ui-css/semantic.css";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import MobileAdminRides from "../pages/AdminRides";
import MobileAdminUsers from "../pages/AdminUsers";
import AdminSchools from "../pages/AdminSchools";
import AdminPendingUsersPage from "../pages/AdminPendingUsers";
import SchoolManagement from "../pages/SchoolManagement";
import MobileTestImageUpload from "../mobile/pages/TestImageUpload";
import LoadingPage from "../components/LoadingPage";
import ErrorBoundary from "../components/ErrorBoundary";
import MobileNotFound from "../mobile/pages/NotFound";
import MobileSignIn from "../pages/SignIn";
import LiquidGlassSignIn from "../liquidGlass/pages/SignIn";
import StudentRegistration from "../pages/StudentRegistration";
import MobileForgotPassword from "../pages/ForgotPassword";
import MobileLanding from "../mobile/pages/Landing";
import MobileMyRides from "../mobile/pages/MyRides";
import NavBar from "../desktop/components/NavBar";
import MobileChat from "../pages/Chat";
import MobileSignout from "../mobile/pages/Signout";
import MobileVerifyEmail from "../pages/VerifyEmail";
import MobileEditProfile from "../pages/EditProfile";
import MobileOnboarding from "../mobile/pages/Onboarding";
import MobileVerify from "../pages/Verify";
import WaitingForConfirmation from "../components/WaitingForConfirmation";
import RejectionScreen from "../components/RejectionScreen";
import MobileTOS from "../mobile/pages/TOS";
import MobilePrivacy from "../mobile/pages/Privacy";
import MobileCredits from "../mobile/pages/Credits";
import MobileHelp from "../mobile/pages/Help";
import MobileContact from "../mobile/pages/Contact";
import MobileFAQ from "../mobile/pages/FAQ";
import MobileAbout from "../mobile/pages/About";
import MobileBlog from "../mobile/pages/Blog";
import MobilePlaceManager from "../mobile/pages/PlaceManager";
import MobileAdminPlaceManager from "../pages/AdminPlaceManager";
import SystemAdmin from "../pages/System";
import MobileRideInfo from "../mobile/pages/RideInfo";
import RideHistory from "../mobile/pages/RideHistory";
import ProtectedRoutes, {
  ProtectedRoute,
  ProtectedRouteRequireNotLoggedIn,
  ProtectedRouteRequireAdmin,
  ProtectedRouteRequireNotEmailVerified,
  ProtectedRouteRequireSystem,
} from "./ProtectedRoutes";
import { ProtectedRouteRequireVerification } from "./VerificationProtection";
import { DesktopOnly, MobileOnly } from "./Devices";
import { AppContainer, MainContent } from "../styles/App";
import FooterVerbose from "../desktop/components/FooterVerbose";
import MobileNavBarAuto from "../mobile/components/MobileNavBarAuto";
import EdgeSwipeBack from "../mobile/components/EdgeSwipeBack";
import SharedComponentsDemo from "../test/pages/SharedComponentsDemo";
import MobileNavBarAutoTest from "../test/pages/MobileNavBarAutoTest";
import ComponentsTest from "../test/pages/ComponentsTest";
import LiquidGlassComponentsTest from "../test/pages/LiquidGlassComponentsTest";
import FooterComponentsTest from "../test/pages/FooterComponentsTest";
import SkeletonComponentsTest from "../test/pages/SkeletonComponentsTest";
import IOSCreateRide from "../mobile/ios/pages/CreateRide";
import IOSJoinRide from "../mobile/ios/pages/JoinRide";
import IOSProfile from "../mobile/pages/Profile";
import AdminErrorReports from "../desktop/pages/AdminErrorReports";
import AdminErrorReportDetail from "../desktop/pages/AdminErrorReportDetail";
import CrashApp from "../test/pages/CrashApp";
import NotificationTest from "../test/pages/NotificationTest";
import MobilePushTest from "../test/pages/MobilePushTest";
import AutoSubscribeNotification from "../components/AutoSubscribeNotification";
import PWAInstallPrompt from "../mobile/components/PWAInstallPrompt";
// Lazy load MapComponentsTest to improve initial load performance
const MapComponentsTest = React.lazy(() => import("/imports/ui/test/pages/MapComponentsTest.jsx"));

/** Top-level layout component for this application. Called in imports/startup/client/startup.jsx. */
class App extends React.Component {
  render() {
    return (
      <Router>
        <ErrorBoundary>
          <AppContainer>
          {/* Auto-subscribe to notifications on every page visit */}
          <AutoSubscribeNotification />
          {/* PWA install prompt */}
          <PWAInstallPrompt />
          <DesktopOnly>
            <NavBar />
          </DesktopOnly>
          <MainContent>
            <Switch>
              <ProtectedRouteRequireNotLoggedIn exact path="/" component={MobileLanding} />
              <Route exact path="/404" component={MobileNotFound} />
              <ProtectedRouteRequireNotLoggedIn
                path="/login"
                component={MobileSignIn}
              />
              <ProtectedRouteRequireNotLoggedIn
                path="/signup"
                component={StudentRegistration}
              />
              <ProtectedRouteRequireNotLoggedIn
                path="/forgot"
                component={MobileForgotPassword}
              />
              <ProtectedRouteRequireNotEmailVerified
                path="/verify-email"
                component={MobileVerifyEmail}
              />

              {/* Onboarding route - simple auth check without profile requirement */}
              <ProtectedRoute path="/onboarding" component={MobileOnboarding} />

              {/* Verification route - requires authentication */}
              <ProtectedRoute path="/verify" component={MobileVerify} />

              {/* Waiting for confirmation route - requires authentication */}
              <ProtectedRoute path="/waiting-confirmation" component={WaitingForConfirmation} />

              {/* Rejection screen route - requires authentication */}
              <ProtectedRoute path="/verification-rejected" component={RejectionScreen} />

              {/* Main app routes with verification requirement */}
              <ProtectedRouteRequireVerification path="/my-rides" component={MobileMyRides} />
              <ProtectedRouteRequireVerification path="/ride/:rideId" component={MobileRideInfo} />
              <ProtectedRouteRequireVerification path="/ride-history/:id" component={RideHistory} />
              <ProtectedRouteRequireVerification
                path="/edit-profile"
                component={MobileEditProfile}
              />
              <ProtectedRouteRequireVerification path="/chat" component={MobileChat} />
              <ProtectedRouteRequireVerification path="/places" component={MobilePlaceManager} />

              {/* iOS-specific routes */}
              <ProtectedRouteRequireVerification path="/ios/create-ride" component={IOSCreateRide} />
              <ProtectedRouteRequireVerification path="/ios/join-ride" component={IOSJoinRide} />

              {/* Mobile-specific routes */}
              <ProtectedRouteRequireVerification path="/mobile/profile" component={IOSProfile} />

              {/* Admin routes - also require verification */}
              <ProtectedRouteRequireAdmin
                path="/admin/rides"
                component={MobileAdminRides}
              />
              <ProtectedRouteRequireAdmin
                path="/admin/users"
                component={MobileAdminUsers}
              />
              <ProtectedRouteRequireAdmin
                path="/admin/pending-users"
                component={AdminPendingUsersPage}
              />
              <ProtectedRouteRequireAdmin
                path="/admin/places"
                component={MobileAdminPlaceManager}
              />
              <ProtectedRouteRequireAdmin
                path="/admin/school-management"
                component={SchoolManagement}
              />
              <ProtectedRouteRequireSystem
                path="/admin/schools"
                component={AdminSchools}
              />
              <ProtectedRouteRequireAdmin
                exact
                path="/admin/error-reports"
                component={AdminErrorReports}
              />
              <ProtectedRouteRequireAdmin
                path="/admin/error-report/:id"
                component={AdminErrorReportDetail}
              />
              <ProtectedRouteRequireSystem
                exact
                path="/system"
                component={SystemAdmin}
              />

              {/* Redirect /admin to 404 */}
              <Route exact path="/admin" render={() => <Redirect to="/404" />} />

              {/* Test routes - also require verification */}
              <ProtectedRouteRequireAdmin
                path="/_test/map-components"
                component={() => (
                  <React.Suspense fallback={
                    <LoadingPage
                      message="Loading Map Components Test"
                      subMessage="Initializing map utilities and components..."
                      size="large"
                    />
                  }>
                    <MapComponentsTest />
                  </React.Suspense>
                )}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/footer-components"
                component={FooterComponentsTest}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/liquidglass-components"
                component={LiquidGlassComponentsTest}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/image-upload"
                component={MobileTestImageUpload}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/liquidglass/login"
                component={LiquidGlassSignIn}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/shared-components"
                component={SharedComponentsDemo}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/mobile-navbar-auto"
                component={MobileNavBarAutoTest}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/skeleton-components"
                component={SkeletonComponentsTest}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/crash-app"
                component={CrashApp}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/notifications"
                component={NotificationTest}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/mobile-push"
                component={MobilePushTest}
              />
              <ProtectedRouteRequireAdmin
                exact
                path="/_test"
                component={ComponentsTest}
              />
              <ProtectedRoute path="/signout" component={MobileSignout} />

              {/* Public pages */}
              <Route exact path="/terms" component={MobileTOS} />
              <Route exact path="/privacy" component={MobilePrivacy} />
              <Route exact path="/credits" component={MobileCredits} />
              <Route exact path="/help" component={MobileHelp} />
              <Route exact path="/contact" component={MobileContact} />
              <Route exact path="/faq" component={MobileFAQ} />
              <Route exact path="/about" component={MobileAbout} />
              <Route exact path="/blog" component={MobileBlog} />

              {/* Catch-all route for 404 */}
              <Redirect to="/404" />
            </Switch>
          </MainContent>
          <DesktopOnly>
            <FooterVerbose />
          </DesktopOnly>
          {/* <SimpleFooter /> - Desktop footer component */}
          {this.props.currentUser && (
            <MobileOnly>
              <MobileNavBarAuto />
            </MobileOnly>
          )}
          {/* Edge swipe back gesture - mobile only */}
          <MobileOnly>
            <EdgeSwipeBack />
          </MobileOnly>
          </AppContainer>
        </ErrorBoundary>
      </Router>
    );
  }
}

App.propTypes = {
  currentUser: PropTypes.object,
};

/** withTracker connects Meteor data to React components. */
const AppTracker = withTracker(() => ({
  currentUser: Meteor.user(),
}))(App);

export default AppTracker;
