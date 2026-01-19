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
import { useAuth, SignedIn, SignedOut } from "@clerk/clerk-react";
import MobileAdminRides from "../pages/AdminRides";
import MobileAdminUsers from "../pages/AdminUsers";
import AdminSchools from "../pages/AdminSchools";
import AdminPendingUsersPage from "../pages/AdminPendingUsers";
import SchoolManagement from "../pages/SchoolManagement";
import MobileTestImageUpload from "../mobile/pages/TestImageUpload";
import LoadingPage from "../components/LoadingPage";
import ErrorBoundary from "../components/ErrorBoundary";
import MobileNotFound from "../mobile/pages/NotFound";
import ClerkSignIn from "../pages/ClerkSignIn";
import LiquidGlassSignIn from "../liquidGlass/pages/SignIn";
import ClerkSignup from "../pages/ClerkSignup";
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
const MapComponentsTest = React.lazy(() => import("/imports/ui/test/pages/MapComponentsTest.jsx"));

// Wrapper for routes that require authentication
const AuthRoute = ({ component: Component, ...rest }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingPage message="Loading..." />;
  }

  return (
    <Route
      {...rest}
      render={props =>
        isSignedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
        )
      }
    />
  );
};

// Wrapper for routes that require NOT being logged in
const GuestRoute = ({ component: Component, ...rest }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingPage message="Loading..." />;
  }

  return (
    <Route
      {...rest}
      render={props =>
        !isSignedIn ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/my-rides" }} />
        )
      }
    />
  );
};

// Wrapper for routes that require admin
const AdminRoute = ({ component: Component, ...rest }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingPage message="Loading..." />;
  }

  return (
    <Route
      {...rest}
      render={props =>
        isSignedIn && Meteor.user()?.roles?.includes("admin") ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/my-rides" }} />
        )
      }
    />
  );
};

// Wrapper for routes that require system admin
const SystemRoute = ({ component: Component, ...rest }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <LoadingPage message="Loading..." />;
  }

  return (
    <Route
      {...rest}
      render={props =>
        isSignedIn && Meteor.user()?.roles?.includes("system") ? (
          <Component {...props} />
        ) : (
          <Redirect to={{ pathname: "/my-rides" }} />
        )
      }
    />
  );
};

/** Top-level layout component */
class App extends React.Component {
  render() {
    const { currentUser } = this.props;

    return (
      <Router>
        <ErrorBoundary>
          <AppContainer>
            <AutoSubscribeNotification />
            <PWAInstallPrompt />
            <DesktopOnly>
              <NavBar />
            </DesktopOnly>
            <MainContent>
              <Switch>
                <Route exact path="/404" component={MobileNotFound} />

                {/* Public routes */}
                <Route exact path="/" component={MobileLanding} />
                <Route path="/forgot" component={MobileForgotPassword} />
                <Route exact path="/terms" component={MobileTOS} />
                <Route exact path="/privacy" component={MobilePrivacy} />
                <Route exact path="/credits" component={MobileCredits} />
                <Route exact path="/help" component={MobileHelp} />
                <Route exact path="/contact" component={MobileContact} />
                <Route exact path="/faq" component={MobileFAQ} />
                <Route exact path="/about" component={MobileAbout} />
                <Route exact path="/blog" component={MobileBlog} />

                {/* Auth routes - only for guests */}
                <GuestRoute path="/login" component={ClerkSignIn} />
                <GuestRoute path="/signup" component={ClerkSignup} />

                {/* Protected routes - require Clerk auth */}
                <AuthRoute path="/onboarding" component={MobileOnboarding} />
                <AuthRoute path="/verify" component={MobileVerify} />
                <AuthRoute path="/waiting-confirmation" component={WaitingForConfirmation} />
                <AuthRoute path="/verification-rejected" component={RejectionScreen} />
                <AuthRoute path="/my-rides" component={MobileMyRides} />
                <AuthRoute path="/ride/:rideId" component={MobileRideInfo} />
                <AuthRoute path="/ride-history/:id" component={RideHistory} />
                <AuthRoute path="/edit-profile" component={MobileEditProfile} />
                <AuthRoute path="/chat" component={MobileChat} />
                <AuthRoute path="/places" component={MobilePlaceManager} />
                <AuthRoute path="/ios/create-ride" component={IOSCreateRide} />
                <AuthRoute path="/ios/join-ride" component={IOSJoinRide} />
                <AuthRoute path="/mobile/profile" component={IOSProfile} />
                <AuthRoute path="/signout" component={MobileSignout} />

                {/* Admin routes */}
                <AdminRoute path="/admin/rides" component={MobileAdminRides} />
                <AdminRoute path="/admin/users" component={MobileAdminUsers} />
                <AdminRoute path="/admin/pending-users" component={AdminPendingUsersPage} />
                <AdminRoute path="/admin/places" component={MobileAdminPlaceManager} />
                <AdminRoute path="/admin/school-management" component={SchoolManagement} />
                <AdminRoute path="/admin/error-reports" component={AdminErrorReports} />
                <AdminRoute path="/admin/error-report/:id" component={AdminErrorReportDetail} />

                {/* System admin routes */}
                <SystemRoute path="/admin/schools" component={AdminSchools} />
                <SystemRoute path="/system" component={SystemAdmin} />

                {/* Redirect /admin to 404 */}
                <Route exact path="/admin" render={() => <Redirect to="/404" />} />

                {/* Test routes */}
                <Route path="/_test/map-components" component={() => (
                  <React.Suspense fallback={<LoadingPage message="Loading..." />}>
                    <MapComponentsTest />
                  </React.Suspense>
                )} />
                <Route path="/_test/footer-components" component={FooterComponentsTest} />
                <Route path="/_test/liquidglass-components" component={LiquidGlassComponentsTest} />
                <Route path="/_test/image-upload" component={MobileTestImageUpload} />
                <Route path="/_test/liquidglass/login" component={LiquidGlassSignIn} />
                <Route path="/_test/shared-components" component={SharedComponentsDemo} />
                <Route path="/_test/mobile-navbar-auto" component={MobileNavBarAutoTest} />
                <Route path="/_test/skeleton-components" component={SkeletonComponentsTest} />
                <Route path="/_test/crash-app" component={CrashApp} />
                <Route path="/_test/notifications" component={NotificationTest} />
                <Route path="/_test/mobile-push" component={MobilePushTest} />
                <Route exact path="/_test" component={ComponentsTest} />

                {/* Catch-all route for 404 */}
                <Redirect to="/404" />
              </Switch>
            </MainContent>
            <DesktopOnly>
              <FooterVerbose />
            </DesktopOnly>
            {currentUser && (
              <MobileOnly>
                <MobileNavBarAuto />
              </MobileOnly>
            )}
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

const AppTracker = withTracker(() => ({
  currentUser: Meteor.user(),
}))(App);

export default AppTracker;


