import React from "react";
import PropTypes from "prop-types";
import "semantic-ui-css/semantic.css";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import MobileAdminRides from "../pages/AdminRides";
import MobileAdminUsers from "../pages/AdminUsers";
import MobileTestImageUpload from "../mobile/pages/TestImageUpload";
import LoadingPage from "../mobile/components/LoadingPage";
import MobileNotFound from "../mobile/pages/NotFound";
import MobileSignIn from "../pages/SignIn";
import LiquidGlassSignIn from "../liquidGlass/pages/SignIn";
import MobileSignup from "../pages/Signup";
import MobileForgotPassword from "../pages/ForgotPassword";
import MobileLanding from "../mobile/pages/Landing";
import MobileMyRides from "../mobile/pages/MyRides";
import MobileNavBar from "../desktop/components/NavBar";
import MobileChat from "../pages/Chat";
import MobileSignout from "../mobile/pages/Signout";
import MobileVerifyEmail from "../pages/VerifyEmail";
import MobileEditProfile from "../pages/EditProfile";
import MobileOnboarding from "../mobile/pages/Onboarding";
import MobileTOS from "../mobile/pages/TOS";
import MobilePrivacy from "../mobile/pages/Privacy";
import MobileCredits from "../mobile/pages/Credits";
import MobilePlaceManager from "../mobile/pages/PlaceManager";
import MobileAdminPlaceManager from "../pages/AdminPlaceManager";
import ProtectedRoutes, {
  ProtectedRoute,
  ProtectedRouteRequireNotLoggedIn,
  ProtectedRouteRequireAdmin,
  ProtectedRouteRequireNotEmailVerified,
} from "./ProtectedRoutes";
import { DesktopOnly, MobileOnly } from "./Devices";
import FooterVerbose from "../desktop/components/FooterVerbose";
import MobileNavBarAuto from "../mobile/components/MobileNavBarAuto";
import MobileNativeBlurDemo from "../test/pages/NativeBlurDemo";
import SharedComponentsDemo from "../test/pages/SharedComponentsDemo";
import MobileNavBarAutoTest from "../test/pages/MobileNavBarAutoTest";
import IOSCreateRide from "../mobile/ios/pages/CreateRide";
import IOSJoinRide from "../mobile/ios/pages/JoinRide";
import IOSProfile from "../mobile/ios/pages/Profile";
// Lazy load TestMapView to improve initial load performance
const TestMapView = React.lazy(() => import("/imports/ui/test/pages/ComponentsTest.jsx"));

/** Top-level layout component for this application. Called in imports/startup/client/startup.jsx. */
class App extends React.Component {
  render() {
    const appStyle = {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh", // Ensure app takes at least full viewport height
      // Account for safe areas on mobile devices (only sides, not top)
      paddingLeft: "env(safe-area-inset-left)",
      paddingRight: "env(safe-area-inset-right)",
      // Ensure we don't exceed viewport bounds
      boxSizing: "border-box",
    };

    const mainContentStyle = {
      flex: "1",
      display: "flex",
      flexDirection: "column",
    };

    return (
      <Router>
        <div style={appStyle}>
          <DesktopOnly>
            <MobileNavBar />
          </DesktopOnly>
          <main style={mainContentStyle}>
            <Switch>
              <ProtectedRouteRequireNotLoggedIn exact path="/" component={MobileLanding} />
              <Route exact path="/404" component={MobileNotFound} />
              <ProtectedRouteRequireNotLoggedIn
                path="/signin"
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

              {/* Main app routes with full onboarding flow */}
              <ProtectedRoutes path="/myRides" component={MobileMyRides} />
              <ProtectedRoutes
                path="/editProfile"
                component={MobileEditProfile}
              />
              <ProtectedRoutes path="/chat" component={MobileChat} />
              <ProtectedRoutes path="/places" component={MobilePlaceManager} />

              {/* iOS-specific routes */}
              <ProtectedRoutes path="/ios/create-ride" component={IOSCreateRide} />
              <ProtectedRoutes path="/ios/join-ride" component={IOSJoinRide} />
              <ProtectedRoutes path="/ios/profile" component={IOSProfile} />

              {/* Admin routes */}
              <ProtectedRouteRequireAdmin
                path="/adminRides"
                component={MobileAdminRides}
              />
              <ProtectedRouteRequireAdmin
                path="/adminUsers"
                component={MobileAdminUsers}
              />
              <ProtectedRouteRequireAdmin
                path="/adminPlaces"
                component={MobileAdminPlaceManager}
              />

              {/* Test routes */}
              <ProtectedRouteRequireAdmin
                path="/_test/image-upload"
                component={MobileTestImageUpload}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/liquidglass/login"
                component={LiquidGlassSignIn}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/native-blur"
                component={MobileNativeBlurDemo}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/shared-components"
                component={SharedComponentsDemo}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/mobile-navbar-auto"
                component={MobileNavBarAutoTest}
              />
              <ProtectedRoutes
                path="/_test"
                component={() => (
                  <React.Suspense fallback={
                    <LoadingPage
                      message="Loading Admin Components Test"
                      subMessage="Initializing LiquidGlass components and map utilities..."
                      size="large"
                    />
                  }>
                    <TestMapView />
                  </React.Suspense>
                )}
              />
              <ProtectedRoute path="/signout" component={MobileSignout} />

              {/* Public pages */}
              <Route exact path="/tos" component={MobileTOS} />
              <Route exact path="/privacy" component={MobilePrivacy} />
              <Route exact path="/credits" component={MobileCredits} />

              {/* Catch-all route for 404 */}
              <Redirect to="/404" />
            </Switch>
          </main>
          <DesktopOnly>
            <FooterVerbose />
          </DesktopOnly>
          {/* <SimpleFooter /> - Desktop footer component */}
          {this.props.currentUser && (
            <MobileOnly>
              <MobileNavBarAuto />
            </MobileOnly>
          )}
        </div>
      </Router>
    );
  }
}

App.propTypes = {
  currentUser: PropTypes.object,
};

/** withTracker connects Meteor data to React components. */
const AppContainer = withTracker(() => ({
  currentUser: Meteor.user(),
}))(App);

export default AppContainer;
