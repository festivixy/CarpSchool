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
import MobileTestImageUpload from "../mobile/pages/TestImageUpload";
import LoadingPage from "../components/LoadingPage";
import ErrorBoundary from "../components/ErrorBoundary";
import MobileNotFound from "../mobile/pages/NotFound";
import MobileSignIn from "../pages/SignIn";
import LiquidGlassSignIn from "../liquidGlass/pages/SignIn";
import MobileSignup from "../pages/Signup";
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
import MobileTOS from "../mobile/pages/TOS";
import MobilePrivacy from "../mobile/pages/Privacy";
import MobileCredits from "../mobile/pages/Credits";
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
                component={MobileSignup}
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

              {/* Main app routes with full onboarding flow */}
              <ProtectedRoutes path="/my-rides" component={MobileMyRides} />
              <ProtectedRoutes path="/ride/:rideId" component={MobileRideInfo} />
              <ProtectedRoutes path="/ride-history/:id" component={RideHistory} />
              <ProtectedRoutes
                path="/edit-profile"
                component={MobileEditProfile}
              />
              <ProtectedRoutes path="/chat" component={MobileChat} />
              <ProtectedRoutes path="/places" component={MobilePlaceManager} />

              {/* iOS-specific routes */}
              <ProtectedRoutes path="/ios/create-ride" component={IOSCreateRide} />
              <ProtectedRoutes path="/ios/join-ride" component={IOSJoinRide} />

              {/* Mobile-specific routes */}
              <ProtectedRoutes path="/mobile/profile" component={IOSProfile} />

              {/* Admin routes */}
              <ProtectedRouteRequireAdmin
                path="/admin/rides"
                component={MobileAdminRides}
              />
              <ProtectedRouteRequireAdmin
                path="/admin/users"
                component={MobileAdminUsers}
              />
              <ProtectedRouteRequireAdmin
                path="/admin/places"
                component={MobileAdminPlaceManager}
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

              {/* Test routes */}
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
