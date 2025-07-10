import React from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter, NavLink } from 'react-router-dom';
import { Menu, Dropdown, Image, Icon } from 'semantic-ui-react';

/** The NavBar appears at the top of every page. Rendered by the App Layout component. */
class NavBar extends React.Component {
  render() {
    const menuStyle = { marginBottom: '10px', backgroundColor: '#024731' };
    return (
      <Menu style={menuStyle} attached="top" borderless inverted>
        <Menu.Item position="left" as={NavLink} activeClassName="" exact to="/">
          <Image size="small" src="/images/Carpool.png" /></Menu.Item>
        {this.props.currentUser ? (
            [
              <Dropdown item text="My Rides" position="left" key='myRides'>

                <Dropdown.Menu>
                  <Dropdown.Item text="All Rides" as={NavLink} exact to="/listMyRides" key='myRides'/>
                  <Dropdown.Item text="Im driving" as={NavLink} exact to="/imDriving"/>
                  <Dropdown.Item text="Im riding" as={NavLink} exact to="/imRiding"/>
                </Dropdown.Menu>
              </Dropdown>,

                <Menu.Item position="left" as={NavLink} activeClassName="active" exact to="/add/" key='add'>
              <Icon name='plus square outline' size='large'/>Create Ride</Menu.Item>,
              <Menu.Item position="left" as={NavLink} activeClassName="active" exact to="/list" key='list'>
                <Icon name='car' size='large'/>Available Rides</Menu.Item>,

            ]
        ) : ''}
        {this.props.isAdmin ? (
            <Dropdown item text="Admin" key='admin'>
              <Dropdown.Menu>
                <Dropdown.Item as={NavLink} exact to="/admin" text="Admin Stuff"/>
                <Dropdown.Item as={NavLink} exact to="/adminProfiles" text="Admin Profiles"/>
                <Dropdown.Item as={NavLink} exact to="/adminRides" text="Manage Rides"/>
                <Dropdown.Item as={NavLink} exact to="/adminUsers" text="Manage Users"/>
              </Dropdown.Menu>
            </Dropdown>
        ) : ''}

        <Menu.Item position="right">
          {this.props.currentUser === '' ? (
            <Dropdown text="Login" pointing="top right" icon={'caret down'}>
              <Dropdown.Menu>
                <Dropdown.Item icon="sign-in" text="Sign In" as={NavLink} exact to="/signin"/>
                <Dropdown.Item icon="add user" text="Sign Up" as={NavLink} exact to="/signup"/>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Dropdown text={this.props.currentUser} pointing="top right" icon={'user'}>
              <Dropdown.Menu>
                <Dropdown.Item icon="address card" text="Profile" as={NavLink} exact to={`/addprofile/${this.props.currentId}`} />
                <Dropdown.Item icon="sign out" text="Sign Out" as={NavLink} exact to="/signout"/>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Menu.Item>
      </Menu>
    );
  }
}

/** Declare the types of all properties. */
NavBar.propTypes = {
  currentUser: PropTypes.string,
  currentId: PropTypes.string,
  isAdmin: PropTypes.bool,
};

/** withTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker */
const NavBarContainer = withTracker(() => {
  // The null publication should automatically publish roles
  
  return {
    currentUser: Meteor.user() ? Meteor.user().username : '',
    currentId: Meteor.user() ? Meteor.user()._id : '',
    isAdmin: Meteor.user() ? (Meteor.user().roles && Meteor.user().roles.includes('admin')) : false,
  };
})(NavBar);

/** Enable ReactRouter for this component. https://reacttraining.com/react-router/web/api/withRouter */
export default withRouter(NavBarContainer);
