import React from "react";
import "semantic-ui-css/semantic.css";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";
import MobileAdminRides from "../mobile/pages/AdminRides";
import MobileAdminUsers from "../mobile/pages/AdminUsers";
import MobileTestImageUpload from "../mobile/pages/TestImageUpload";
import LoadingPage from "../mobile/components/LoadingPage";
import MobileNotFound from "../mobile/pages/NotFound";
import MobileSignIn from "../mobile/pages/SignIn";
import LiquidGlassSignIn from "../mobile/liquidGlass/pages/SignIn";
import MobileSignup from "../mobile/pages/Signup";
import MobileForgotPassword from "../mobile/pages/ForgotPassword";
import MobileLanding from "../mobile/pages/Landing";
import MobileMyRides from "../mobile/pages/MyRides";
import MobileNavBar from "../mobile/components/NavBar";
import MobileChat from "../mobile/pages/Chat";
import MobileSignout from "../mobile/pages/Signout";
import MobileVerifyEmail from "../mobile/pages/VerifyEmail";
import MobileEditProfile from "../mobile/pages/EditProfile";
import MobileOnboarding from "../mobile/pages/Onboarding";
import MobileTOS from "../mobile/pages/TOS";
import MobilePrivacy from "../mobile/pages/Privacy";
import MobileCredits from "../mobile/pages/Credits";
import MobilePlaceManager from "../mobile/pages/PlaceManager";
import MobileAdminPlaceManager from "../mobile/pages/AdminPlaceManager";
import ProtectedRoutes, {
  ProtectedRoute,
  ProtectedRouteRequireNotLoggedIn,
  ProtectedRouteRequireAdmin,
  ProtectedRouteRequireNotEmailVerified,
} from "./ProtectedRoutes";
import { DesktopOnly, MobileOnly } from "./Devices";
import FooterVerbose from "../mobile/components/FooterVerbose";
import LiquidGlassMobileNavBar from "../mobile/liquidGlass/components/LiquidGlassMobileNavBar";
// Lazy load TestMapView to improve initial load performance
const TestMapView = React.lazy(() => import("../mobile/pages/ComponentsTest"));

/** Top-level layout component for this application. Called in imports/startup/client/startup.jsx. */
class App extends React.Component {
  render() {
    const appStyle = {
      display: "flex",
      flexDirection: "column",
      height: "100vh", // Use full viewport height
    };

    const mainContentStyle = {
      flex: "1",
      overflow: "auto", // Allow scrolling when content exceeds available space
      display: "flex",
      flexDirection: "column",
      minHeight: 0, // Important: allows flex item to shrink below content size
    };

    return (
      <Router>
        <div style={appStyle}>
          <DesktopOnly>
            <MobileNavBar />
          </DesktopOnly>
          <main style={mainContentStyle}>
            <Switch>
              <Route exact path="/" component={MobileLanding} />
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
                path="/testImageUpload"
                component={MobileTestImageUpload}
              />
              <ProtectedRouteRequireAdmin
                path="/_test/liquidglass/login"
                component={LiquidGlassSignIn}
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
            <DesktopOnly>
              <FooterVerbose />
            </DesktopOnly>
          </main>
          {/* <MobileFooter /> */}
          <MobileOnly>
            <LiquidGlassMobileNavBar />
          </MobileOnly>
        </div>
      </Router>
    );
  }
}

export default App;
