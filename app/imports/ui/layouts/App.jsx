import React from "react";
import "semantic-ui-css/semantic.css";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import AdminRides from "../pages/AdminRides";
import AdminUsers from "../pages/AdminUsers";
import AddStuff from "../pages/AddStuff";
import NotFound from "../pages/NotFound";
import TestImageUpload from "../pages/TestImageUpload";
import MobileSignIn from "../mobile/pages/SignIn";
import MobileSignup from "../mobile/pages/Signup";
import MobileForgotPassword from "../mobile/pages/ForgotPassword";
import MobileLanding from "../mobile/pages/Landing";
import MobileImDriving from "../mobile/pages/ImDriving";
import MobileImRiding from "../mobile/pages/ImRiding";
import MobileNavBar from "../mobile/components/NavBar";
import MobileFooter from "../mobile/components/Footer";
import MobileChat from "../mobile/pages/Chat";
import MobileSignout from "../mobile/pages/Signout";
import MobileVerifyEmail from "../mobile/pages/VerifyEmail";
import MobileEditProfile from "../mobile/pages/EditProfile";
import MobileOnboarding from "../mobile/pages/Onboarding";
import ProtectedRoutes, {
  ProtectedRoute,
  ProtectedRouteRequireNotLoggedIn,
  ProtectedRouteRequireAdmin,
  ProtectedRouteRequireNotEmailVerified,
} from "./ProtectedRoutes";

/** Top-level layout component for this application. Called in imports/startup/client/startup.jsx. */
class App extends React.Component {
  render() {
    const appStyle = {
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
    };

    const mainContentStyle = {
      flex: "1",
    };

    return (
      <Router>
        <div style={appStyle}>
          <MobileNavBar />
          <main style={mainContentStyle}>
            <Switch>
              <Route exact path="/" component={MobileLanding} />
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
              <ProtectedRoutes path="/imDriving" component={MobileImDriving} />
              <ProtectedRoutes path="/imRiding" component={MobileImRiding} />
              <ProtectedRoutes path="/myRides" component={AddStuff} />
              <ProtectedRoutes
                path="/editProfile"
                component={MobileEditProfile}
              />
              <ProtectedRoutes path="/chat" component={MobileChat} />

              {/* Admin routes */}
              <ProtectedRouteRequireAdmin
                path="/adminRides"
                component={AdminRides}
              />
              <ProtectedRouteRequireAdmin
                path="/adminUsers"
                component={AdminUsers}
              />

              {/* Test routes */}
              <ProtectedRoute
                path="/testImageUpload"
                component={TestImageUpload}
              />
              <ProtectedRoute path="/signout" component={MobileSignout} />

              <Route component={NotFound} />
            </Switch>
          </main>
          <MobileFooter />
        </div>
      </Router>
    );
  }
}

export default App;
