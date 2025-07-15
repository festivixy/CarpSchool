import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import 'semantic-ui-css/semantic.css';
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import AdminRides from '../pages/AdminRides';
import AdminUsers from '../pages/AdminUsers';
import AddStuff from '../pages/AddStuff';
import AddProfile from '../pages/AddProfile';
import EditProfile from '../pages/EditProfile';
import NotFound from '../pages/NotFound';
import AddRides from '../pages/AddRides';
import TestImageUpload from '../pages/TestImageUpload';
import MobileSignIn from '../mobile/pages/SignIn';
import MobileSignup from '../mobile/pages/Signup';
import MobileForgotPassword from '../mobile/pages/ForgotPassword';
import MobileLanding from '../mobile/pages/Landing';
import MobileImDriving from '../mobile/pages/ImDriving';
import MobileImRiding from '../mobile/pages/ImRiding';
import MobileNavBar from '../mobile/components/NavBar';
import MobileFooter from '../mobile/components/Footer';
import MobileChat from '../mobile/pages/Chat';
import MobileSignout from '../mobile/pages/Signout';

/**
 * HomeRoute component that redirects logged-in users to /listMyRides
 * and shows Landing page for non-logged-in users
 */
const HomeRoute = () => {
  const isLogged = Meteor.userId() !== null;
  return isLogged ? <Redirect to="/listMyRides" /> : <MobileLanding />;
};

/**
 * SigninRoute component that redirects logged-in users to /listMyRides
 * and shows Signin page for non-logged-in users
 */
const SigninRoute = (props) => {
  const isLogged = Meteor.userId() !== null;
  return isLogged ? <Redirect to="/listMyRides" /> : <MobileSignIn {...props} />;
};


/** Top-level layout component for this application. Called in imports/startup/client/startup.jsx. */
class App extends React.Component {
  render() {
    const appStyle = {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    };

    const mainContentStyle = {
      flex: '1',
    };

    return (
        <Router>
          <div style={appStyle}>
            <MobileNavBar/>
            <main style={mainContentStyle}>
              <Switch>
                <Route exact path="/" component={MobileLanding}/>
                <Route path="/signin" component={MobileSignIn}/>
                <Route path="/signup" component={MobileSignup}/>
                <Route path="/forgot" component={MobileForgotPassword}/>
                {/* <Route exact path="/" component={HomeRoute}/>
                <Route path="/signin" component={SigninRoute}/>
                <Route path="/signup" component={Signup}/>
                <Route path="/forgot" component={ForgotPassword}/> */}
                {/* <ProtectedRoute path="/listMyRides" component={MobileListMyRides}/> */}
                <ProtectedRoute path="/imDriving" component={MobileImDriving}/>
                <ProtectedRoute path="/imRiding" component={MobileImRiding}/>
                {/* <ProtectedRoute path="/listMyRides" component={ActiveRides}/>
                <ProtectedRoute path="/imDriving" component={UserDrive}/>
                <ProtectedRoute path="/imRiding" component={UserRide}/> */}
                {/* <AdminProtectedRoute path="/list" component={ListRides}/> */}
                <ProtectedRoute path="/add" component={AddRides}/>
                <ProtectedRoute path="/addProfile/:_id" component={AddProfile}/>
                <ProtectedRoute path="/myRides" component={AddStuff}/>
                <ProtectedRoute path="/editProfile/:_id" component={EditProfile}/>
                <ProtectedRoute path="/testImageUpload" component={TestImageUpload}/>
                <AdminProtectedRoute path="/adminRides" component={AdminRides}/>
                <AdminProtectedRoute path="/adminUsers" component={AdminUsers}/>
                <ProtectedRoute path="/signout" component={MobileSignout}/>
                <ProtectedRoute path="/chat" component={MobileChat}/>
                <Route component={NotFound}/>
              </Switch>
            </main>
            <MobileFooter/>
          </div>
        </Router>
    );
  }
}

/**
 * ProtectedRoute (see React Router v4 sample)
 * Checks for Meteor login before routing to the requested page, otherwise goes to signin page.
 * @param {any} { component: Component, ...rest }
 */
const ProtectedRoute = ({ component: Component, ...rest }) => (
  <Route
    {...rest}
    render={(props) => {
      const isLogged = Meteor.userId() !== null;
      return isLogged ?
          (<Component {...props} />) :
          (<Redirect to={{ pathname: '/signin', state: { from: props.location } }}/>
      );
    }}
  />
);

/**
 * AdminProtectedRoute (see React Router v4 sample)
 * Checks for Meteor login and admin role before routing to the requested page, otherwise goes to signin page.
 * @param {any} { component: Component, ...rest }
 */
const AdminProtectedRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={(props) => {
          const isLogged = Meteor.userId() !== null;
          const user = Meteor.user();
          const isAdmin = user && user.roles && user.roles.includes('admin');
          return (isLogged && isAdmin) ?
              (<Component {...props} />) :
              (<Redirect to={{ pathname: '/signin', state: { from: props.location } }}/>
              );
        }}
    />
);

/** Require a component and location to be passed to each ProtectedRoute. */
ProtectedRoute.propTypes = {
  component: PropTypes.func.isRequired,
  location: PropTypes.object,
};

/** Require a component and location to be passed to each AdminProtectedRoute. */
AdminProtectedRoute.propTypes = {
  component: PropTypes.func.isRequired,
  location: PropTypes.object,
};

export default App;
