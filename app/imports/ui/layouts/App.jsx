import React, { Suspense } from "react";
import PropTypes from "prop-types";
import "semantic-ui-css/semantic.css";
import {
  BrowserRouter as Router,
  Route,
  Switch,
  Redirect,
  Link,
} from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { useClerk } from "@clerk/clerk-react";
import MobileAdminRides from "../pages/AdminRides";
import AdminOverview from "../pages/AdminOverview";
import MobileAdminUsers from "../pages/AdminUsers";
import AdminSchools from "../pages/AdminSchools";
import AdminPendingUsersPage from "../pages/AdminPendingUsers";
import AdminNotifications from "../pages/AdminNotifications";
import SchoolManagement from "../pages/SchoolManagement";
import LoadingPage from "../components/LoadingPage";
import ErrorBoundary from "../components/ErrorBoundary";
import ConnectionBanner from "../components/ConnectionBanner";
import MobileNotFound from "../mobile/pages/NotFound";
import ClerkSignIn from "../pages/ClerkSignIn";
import ClerkSignup from "../pages/ClerkSignup";
import MobileForgotPassword from "../pages/ForgotPassword";
import MobileLanding from "../mobile/pages/Landing";
import MobileMyRides from "../mobile/pages/MyRides";
import MobileMarketplace from "../mobile/pages/Marketplace";
import MobileCreateRide from "../mobile/pages/CreateRide";
import TopNavAuto from "../components/TopNavAuto";
import AdminShell from "../components/AdminShell";
import MobileChat from "../pages/Chat";
import MobileSignout from "../mobile/pages/Signout";
import MobileEditProfile from "../pages/EditProfile";
import MobileOnboarding from "../mobile/pages/Onboarding";
import WaitingForConfirmation from "../components/WaitingForConfirmation";
import RejectionScreen from "../components/RejectionScreen";
import MobileTOS from "../mobile/pages/TOS";
import MobilePrivacy from "../mobile/pages/Privacy";
import MobileCredits from "../mobile/pages/Credits";
import MobileHelp from "../mobile/pages/Help";
import MobileGuide from "../mobile/pages/Guide";
import VideoPlan from "../mobile/pages/VideoPlan";
import MobileContact from "../mobile/pages/Contact";
import MobileFAQ from "../mobile/pages/FAQ";
import MobileAbout from "../mobile/pages/About";
import MobileBlog from "../mobile/pages/Blog";
import MobilePlaceManager from "../mobile/pages/PlaceManager";
import MobileAvailability from "../mobile/pages/Availability";
import MobileDrivers from "../mobile/pages/Drivers";
import MobileAdminPlaceManager from "../pages/AdminPlaceManager";
import SystemAdmin from "../pages/System";
import MobileRideInfo from "../mobile/pages/RideInfo";
import RideHistory from "../mobile/pages/RideHistory";
import { Profiles } from "../../api/profile/Profile";
import { isAdminRole, isSystemRole } from "../desktop/components/NavBarRoleUtils";
import { DesktopOnly, MobileOnly } from "./Devices";
import RouteBoundary from "./RouteBoundary";
import { AppContainer, MainContent } from "../styles/App";
import FooterVerbose from "../desktop/components/FooterVerbose";
import MobileNavBarAuto from "../mobile/components/MobileNavBarAuto";
import EdgeSwipeBack from "../mobile/components/EdgeSwipeBack";
import IOSProfile from "../mobile/pages/Profile";
import AdminErrorReports from "../desktop/pages/AdminErrorReports";
import AdminErrorReportDetail from "../desktop/pages/AdminErrorReportDetail";
import AutoSubscribeNotification from "../components/AutoSubscribeNotification";
import PWAInstallPrompt from "../mobile/components/PWAInstallPrompt";
import ScrollToTop from "../components/ScrollToTop";
import { useClerkUser, useClerkMeteorSessionSync } from "../utils/clerkAuth";
import { fullSignOut } from "../utils/signOut";

// /_test/* routes are development-only, so their components are lazy-loaded
const MapComponentsTest = React.lazy(() => import("/imports/ui/test/pages/MapComponentsTest.jsx"));
const FooterComponentsTest = React.lazy(() => import("../test/pages/FooterComponentsTest"));
const LiquidGlassComponentsTest = React.lazy(() => import("../test/pages/LiquidGlassComponentsTest"));
const MobileTestImageUpload = React.lazy(() => import("../mobile/pages/TestImageUpload"));
const LiquidGlassSignIn = React.lazy(() => import("../liquidGlass/pages/SignIn"));
const SharedComponentsDemo = React.lazy(() => import("../test/pages/SharedComponentsDemo"));
const MobileNavBarAutoTest = React.lazy(() => import("../test/pages/MobileNavBarAutoTest"));
const SkeletonComponentsTest = React.lazy(() => import("../test/pages/SkeletonComponentsTest"));
const CrashApp = React.lazy(() => import("../test/pages/CrashApp"));
const NotificationTest = React.lazy(() => import("../test/pages/NotificationTest"));
const MobilePushTest = React.lazy(() => import("../test/pages/MobilePushTest"));
const ComponentsTest = React.lazy(() => import("../test/pages/ComponentsTest"));

// Loading spinner for auth states
const AuthLoading = () => (
  <LoadingPage message="Loading..." />
);

const TestRouteLoading = () => (
  <LoadingPage message="Loading..." />
);

// Shown when Clerk never finishes loading within the timeout window
const ClerkTimeoutScreen = () => (
  <div style={{ padding: "48px 24px", textAlign: "center" }}>
    <p style={{ color: "var(--ink-1)" }}>
      Taking longer than expected to connect. Please check your connection and try again.
    </p>
    <button type="button" onClick={() => window.location.reload()}>
      Retry
    </button>
  </div>
);

// Shown when the login handler rejects a non-school email domain
const SchoolEmailRequiredScreen = ({ error, onSignOut }) => (
  <div style={{ padding: "48px 24px", textAlign: "center" }}>
    <p style={{ color: "var(--ink-1)" }}>
      Your email domain isn&apos;t registered with a school
    </p>
    {error?.message && (
      <p style={{ color: "var(--ink-3)" }}>{error.message}</p>
    )}
    <button type="button" onClick={onSignOut}>
      Sign Out
    </button>
  </div>
);

SchoolEmailRequiredScreen.propTypes = {
  error: PropTypes.shape({ message: PropTypes.string }),
  onSignOut: PropTypes.func.isRequired,
};

// Shown to signed-in users who lack the role required for a route
const AccessDenied = () => (
  <div style={{ padding: "48px 24px", textAlign: "center" }}>
    <p style={{ color: "var(--ink-1)" }}>Access denied. You don&apos;t have permission to view this page.</p>
    <Link to="/my-rides">Return to My Rides</Link>
  </div>
);

/**
 * Resolves Clerk auth state for a route wrapper, handling the shared
 * loading / timeout / school-email-error screens so each route wrapper
 * doesn't have to duplicate that logic.
 */
const AuthGate = ({ children }) => {
  const clerkAuth = useClerkUser();
  const { signOut: clerkSignOut } = useClerk();

  if (clerkAuth.timedOut) {
    return <ClerkTimeoutScreen />;
  }

  if (clerkAuth.error?.error === "school-email-required") {
    return (
      <SchoolEmailRequiredScreen
        error={clerkAuth.error}
        onSignOut={() => fullSignOut(clerkSignOut)}
      />
    );
  }

  if (!clerkAuth.isLoaded) {
    return <AuthLoading />;
  }

  return children(clerkAuth);
};

AuthGate.propTypes = {
  children: PropTypes.func.isRequired,
};

// Route wrapper for authenticated routes
const AuthRoute = ({ component: Component, ...rest }) => (
  <AuthGate>
    {({ isSignedIn, meteorUser }) => (
      <Route
        {...rest}
        render={props =>
          (isSignedIn ? (
            <RouteBoundary><Component {...props} user={meteorUser} /></RouteBoundary>
          ) : (
            <Redirect to={{ pathname: "/login", state: { from: props.location } }} />
          ))
        }
      />
    )}
  </AuthGate>
);

// Route wrapper for guest-only routes (login, signup)
const GuestRoute = ({ component: Component, ...rest }) => (
  <AuthGate>
    {({ isSignedIn }) => (
      <Route
        {...rest}
        render={props =>
          (!isSignedIn ? (
            <RouteBoundary><Component {...props} /></RouteBoundary>
          ) : (
            <Redirect to={{ pathname: "/my-rides" }} />
          ))
        }
      />
    )}
  </AuthGate>
);

/* The admin frame is applied here rather than by each screen: left to the
 * screens, exactly one of the nine ever rendered a sidebar and clicking a nav
 * entry made the navigation vanish. `shell={false}` is for a screen that
 * renders AdminShell itself because it has counts to pass down. */
const AdminRoute = ({ component: Component, shell = true, ...rest }) => (
  <AuthGate>
    {({ isSignedIn, meteorUser }) => (
      <Route
        {...rest}
        render={(props) => {
          if (!isSignedIn) {
            return <Redirect to={{ pathname: "/login", state: { from: props.location } }} />;
          }
          if (!isAdminRole(meteorUser)) {
            return <AccessDenied />;
          }
          const screen = <Component {...props} user={meteorUser} />;
          return (
            <RouteBoundary>
              {shell ? <AdminShell>{screen}</AdminShell> : screen}
            </RouteBoundary>
          );
        }}
      />
    )}
  </AuthGate>
);

AdminRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  /** False for a screen that renders AdminShell itself, to pass counts down. */
  shell: PropTypes.bool,
};

// Route wrapper for system admin routes
const SystemRoute = ({ component: Component, shell = true, ...rest }) => (
  <AuthGate>
    {({ isSignedIn, meteorUser }) => (
      <Route
        {...rest}
        render={(props) => {
          if (!isSignedIn) {
            return <Redirect to={{ pathname: "/login", state: { from: props.location } }} />;
          }
          if (!isSystemRole(meteorUser)) {
            return <AccessDenied />;
          }
          const screen = <Component {...props} user={meteorUser} />;
          return (
            <RouteBoundary>
              {shell ? <AdminShell>{screen}</AdminShell> : screen}
            </RouteBoundary>
          );
        }}
      />
    )}
  </AuthGate>
);

SystemRoute.propTypes = {
  component: PropTypes.elementType.isRequired,
  shell: PropTypes.bool,
};

/**
 * Reactive verification status for the signed-in Meteor user, backed by the
 * profiles.mineWithApprovalStatus publication.
 */
const useVerificationStatus = () => useTracker(() => {
  const userId = Meteor.userId();
  if (!userId) {
    // No Meteor session yet. Clerk reports isSignedIn before the Meteor
    // login handler completes, so this state must read as "still loading",
    // not as "no profile" -- otherwise every approved user is bounced to
    // /onboarding on each page load.
    return { ready: false, profile: null };
  }
  const subscription = Meteor.subscribe("profiles.mineWithApprovalStatus");
  return {
    ready: subscription.ready(),
    profile: Profiles.findOne({ Owner: userId }),
  };
}, []);

// Route wrapper for member routes that require a verified, approved profile
const VerificationGate = ({ component: Component, requireDriver, ...rest }) => {
  const { ready, profile } = useVerificationStatus();

  return (
    <AuthGate>
      {({ isSignedIn, meteorUser }) => (
        <Route
          {...rest}
          render={(props) => {
            if (!isSignedIn) {
              return <Redirect to={{ pathname: "/login", state: { from: props.location } }} />;
            }
            if (!ready) {
              return <AuthLoading />;
            }
            if (!profile) {
              return <Redirect to="/onboarding" />;
            }
            if (profile.rejected) {
              return <Redirect to="/verification-rejected" />;
            }
            if (!profile.verified && profile.requested) {
              return <Redirect to="/waiting-confirmation" />;
            }
            if (!profile.verified && !profile.requested) {
              return <Redirect to="/waiting-confirmation" />;
            }
            /* Offering a ride is for drivers. The server refuses a rider's
             * rides.create, but without this the rider still reached the whole
             * form and only found out when they pressed publish. */
            if (requireDriver && profile.UserType === "Rider") {
              return <Redirect to="/my-rides" />;
            }
            return <RouteBoundary><Component {...props} user={meteorUser} /></RouteBoundary>;
          }}
        />
      )}
    </AuthGate>
  );
};

VerificationGate.propTypes = {
  component: PropTypes.elementType.isRequired,
  requireDriver: PropTypes.bool,
};

VerificationGate.defaultProps = {
  requireDriver: false,
};

// Route wrapper for /waiting-confirmation: redirects to /my-rides once the
// profile becomes verified, reacting to the same subscription.
const WaitingConfirmationRoute = ({ component: Component, ...rest }) => {
  const { ready, profile } = useVerificationStatus();

  return (
    <AuthGate>
      {({ isSignedIn }) => (
        <Route
          {...rest}
          render={(props) => {
            if (!isSignedIn) {
              return <Redirect to={{ pathname: "/login", state: { from: props.location } }} />;
            }
            if (ready && profile?.verified) {
              return <Redirect to="/my-rides" />;
            }
            return <RouteBoundary><Component {...props} /></RouteBoundary>;
          }}
        />
      )}
    </AuthGate>
  );
};

const DevOnlyRoute = ({ children, ...rest }) => {
  if (!Meteor.isDevelopment) {
    return null;
  }
  return (
    <Route
      {...rest}
      render={() => (
        <Suspense fallback={<TestRouteLoading />}>
          <RouteBoundary>{children}</RouteBoundary>
        </Suspense>
      )}
    />
  );
};

DevOnlyRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

// Closes an open dialog, if any, else navigates back, else exits the app.
// Cordova Android fires the native "backbutton" event instead of relying on
// browser history alone.
function handleCordovaBackButton(event) {
  event.preventDefault();

  const openDialog = document.querySelector("[role=\"dialog\"], .swal-overlay");
  if (openDialog) {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", code: "Escape" }));
    return;
  }

  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  if (window.navigator?.app?.exitApp) {
    window.navigator.app.exitApp();
  }
}

// Main layout component
/*
 * Renders nothing; exists so the Clerk/Meteor session reconciliation runs on
 * every route. The hook used to live only inside useClerkUser, which mounts
 * behind the auth gate, so a stale Meteor session was never cleaned up on
 * public pages like the landing page.
 */
const SessionSync = () => {
  useClerkMeteorSessionSync();
  return null;
};

class AppLayout extends React.Component {
  componentDidMount() {
    if (window.cordova) {
      document.addEventListener("backbutton", handleCordovaBackButton, false);
    }
  }

  componentWillUnmount() {
    if (window.cordova) {
      document.removeEventListener("backbutton", handleCordovaBackButton, false);
    }
  }

  render() {
    return (
      <Router>
        <ErrorBoundary>
          <AppContainer>
            <SessionSync />
            <ConnectionBanner />
            <ScrollToTop />
            <AutoSubscribeNotification />
            <PWAInstallPrompt />
            <DesktopOnly>
              <TopNavAuto />
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
                <Route exact path="/guide" component={MobileGuide} />
                {/* Unlisted: nothing links here and the page sets noindex.
                  * Obscurity, not access control -- see VideoPlan.jsx. */}
                <Route exact path="/video" component={VideoPlan} />
                <Route exact path="/contact" component={MobileContact} />
                <Route exact path="/faq" component={MobileFAQ} />
                <Route exact path="/about" component={MobileAbout} />
                <Route exact path="/blog" component={MobileBlog} />

                {/* Auth routes - only for guests */}
                <GuestRoute path="/login" component={ClerkSignIn} />
                <GuestRoute path="/signup" component={ClerkSignup} />

                {/* Protected routes - require Clerk auth */}
                <AuthRoute path="/onboarding" component={MobileOnboarding} />
                <WaitingConfirmationRoute path="/waiting-confirmation" component={WaitingForConfirmation} />
                <AuthRoute path="/verification-rejected" component={RejectionScreen} />
                <VerificationGate path="/my-rides" component={MobileMyRides} />
                <VerificationGate path="/find" component={MobileMarketplace} />
                <VerificationGate path="/create" component={MobileCreateRide} requireDriver />
                <VerificationGate path="/ride/:rideId" component={MobileRideInfo} />
                <AuthRoute path="/ride-history/:id" component={RideHistory} />
                <VerificationGate path="/edit-profile" component={MobileEditProfile} />
                <VerificationGate path="/chat" component={MobileChat} />
                <VerificationGate path="/places" component={MobilePlaceManager} />
                <VerificationGate path="/availability" component={MobileAvailability} requireDriver />
                <VerificationGate path="/drivers" component={MobileDrivers} />
                <VerificationGate path="/mobile/profile" component={IOSProfile} />
                <AuthRoute path="/signout" component={MobileSignout} />

                {/* Admin routes */}
                <AdminRoute path="/admin/overview" component={AdminOverview} shell={false} />
                <AdminRoute path="/admin/rides" component={MobileAdminRides} />
                <AdminRoute path="/admin/users" component={MobileAdminUsers} />
                <AdminRoute path="/admin/pending-users" component={AdminPendingUsersPage} />
                <AdminRoute path="/admin/places" component={MobileAdminPlaceManager} />
                <AdminRoute path="/admin/school-management" component={SchoolManagement} />
                <AdminRoute path="/admin/error-reports" component={AdminErrorReports} />
                <AdminRoute path="/admin/error-report/:id" component={AdminErrorReportDetail} />
                <AdminRoute path="/admin/notifications" component={AdminNotifications} />

                {/* System admin routes */}
                <SystemRoute path="/admin/schools" component={AdminSchools} />
                <SystemRoute path="/system" component={SystemAdmin} />

                {/* Redirect /admin to the overview dashboard */}
                <Route exact path="/admin" render={() => <Redirect to="/admin/overview" />} />

                {/* Test routes - development only */}
                <DevOnlyRoute path="/_test/map-components"><MapComponentsTest /></DevOnlyRoute>
                <DevOnlyRoute path="/_test/footer-components"><FooterComponentsTest /></DevOnlyRoute>
                <DevOnlyRoute path="/_test/liquidglass-components"><LiquidGlassComponentsTest /></DevOnlyRoute>
                <DevOnlyRoute path="/_test/image-upload"><MobileTestImageUpload /></DevOnlyRoute>
                <DevOnlyRoute path="/_test/liquidglass/login"><LiquidGlassSignIn /></DevOnlyRoute>
                <DevOnlyRoute path="/_test/shared-components"><SharedComponentsDemo /></DevOnlyRoute>
                <DevOnlyRoute path="/_test/mobile-navbar-auto"><MobileNavBarAutoTest /></DevOnlyRoute>
                <DevOnlyRoute path="/_test/skeleton-components"><SkeletonComponentsTest /></DevOnlyRoute>
                <DevOnlyRoute path="/_test/crash-app"><CrashApp /></DevOnlyRoute>
                <DevOnlyRoute path="/_test/notifications"><NotificationTest /></DevOnlyRoute>
                <DevOnlyRoute path="/_test/mobile-push"><MobilePushTest /></DevOnlyRoute>
                <DevOnlyRoute exact path="/_test"><ComponentsTest /></DevOnlyRoute>

                {/* Catch-all route for 404 */}
                <Redirect to="/404" />
              </Switch>
            </MainContent>
            <DesktopOnly>
              <FooterVerbose />
            </DesktopOnly>
            <MobileOnly>
              <MobileNavBarAuto />
            </MobileOnly>
            <MobileOnly>
              <EdgeSwipeBack />
            </MobileOnly>
          </AppContainer>
        </ErrorBoundary>
      </Router>
    );
  }
}

export default AppLayout;
