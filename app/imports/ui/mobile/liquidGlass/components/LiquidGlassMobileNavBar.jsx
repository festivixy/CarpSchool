import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import MobileJoinRideModal from "../../components/JoinRideModal";
import MobileAddRidesModal from "../../components/AddRides";
import {
  NavBarContainer,
  TabBarInner,
  TabsContainer,
  TabBarItem,
  TabWithBadge,
  NotificationBadge,
  BadgeText,
  TabLabel,
  DropdownContainer,
  DropdownMenu,
  DropdownItem,
} from "../styles/LiquidGlassMobileNavBar";

/**
 * LiquidGlass Mobile Navigation Bar - Bottom tab bar with glass morphism effect
 */
class LiquidGlassMobileNavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      joinRideModalOpen: false,
      addRidesModalOpen: false,
      activeDropdown: null,
      userMenuOpen: false,
      adminMenuOpen: false,
    };
  }

  handleJoinRideClick = () => {
    this.setState({ joinRideModalOpen: true });
    this.closeAllDropdowns();
  };

  handleJoinRideClose = () => {
    this.setState({ joinRideModalOpen: false });
  };

  handleAddRidesClick = () => {
    this.setState({ addRidesModalOpen: true });
    this.closeAllDropdowns();
  };

  handleAddRidesClose = () => {
    this.setState({ addRidesModalOpen: false });
  };

  toggleUserMenu = () => {
    console.log("toggleUserMenu clicked, current state:", this.state.userMenuOpen);
    this.setState((prevState) => ({
      userMenuOpen: !prevState.userMenuOpen,
      adminMenuOpen: false,
      activeDropdown: prevState.userMenuOpen ? null : "user",
    }), () => {
      console.log("toggleUserMenu new state:", this.state.userMenuOpen);
    });
  };

  toggleAdminMenu = () => {
    this.setState((prevState) => ({
      adminMenuOpen: !prevState.adminMenuOpen,
      userMenuOpen: false,
      activeDropdown: prevState.adminMenuOpen ? null : "admin",
    }));
  };

  closeAllDropdowns = () => {
    this.setState({
      userMenuOpen: false,
      adminMenuOpen: false,
      activeDropdown: null,
    });
  };

  // Close dropdowns when clicking outside
  componentDidMount() {
    document.addEventListener("click", this.handleOutsideClick);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
  }

  handleOutsideClick = (event) => {
    if (!event.target.closest(".liquid-glass-mobile-navbar")) {
      this.closeAllDropdowns();
    }
  };

  handleNavigation = (path) => {
    this.props.history.push(path);
    this.closeAllDropdowns();
  };

  handleSignOut = () => {
    this.props.history.push("/signout");
    this.closeAllDropdowns();
  };

  render() {
    const { currentUser, isLoggedInAndEmailVerified, isAdmin } = this.props;
    const homeLink = currentUser ? "/myRides" : "/";

    // Calculate total notifications (placeholder for now)
    const totalNotifications = 5; // This would come from real notification system

    return (
      <>
        <NavBarContainer className="liquid-glass-mobile-navbar">
          <TabBarInner>
            <TabsContainer>
              {/* Home/My Rides Tab */}
              <TabBarItem onClick={() => this.handleNavigation(homeLink)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))" }}>
                  <path d="M3 12L5 10L12 3L19 10L21 12M5 12V20C5 20.5523 5.44772 21 6 21H9M19 12V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <TabLabel>{currentUser ? "My Rides" : "Home"}</TabLabel>
              </TabBarItem>

              {/* Search/Join Ride Tab */}
              <TabBarItem onClick={this.handleJoinRideClick}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))" }}>
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <TabLabel>Join Ride</TabLabel>
              </TabBarItem>

              {/* Add/Create Ride Tab */}
              <TabBarItem onClick={this.handleAddRidesClick}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))" }}>
                  <path d="M12 5V19M5 12H19" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <TabLabel>Create</TabLabel>
              </TabBarItem>

              {/* Messages/Chat Tab with Notification Badge */}
              <TabWithBadge onClick={() => this.handleNavigation("/chat")}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))" }}>
                  <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <TabLabel>Messages</TabLabel>
                {totalNotifications > 0 && (
                  <NotificationBadge>
                    <BadgeText>{totalNotifications}</BadgeText>
                  </NotificationBadge>
                )}
              </TabWithBadge>

              {/* User Profile Tab with Dropdown */}
              <TabBarItem
                onClick={(e) => {
                  e.stopPropagation();
                  this.toggleUserMenu();
                }}
                style={{ position: 'relative' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))", borderRadius: "50%" }}>
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <TabLabel>Profile</TabLabel>
              </TabBarItem>
            </TabsContainer>
          </TabBarInner>
        </NavBarContainer>

        {/* User Dropdown Menu - OUTSIDE NavBarContainer to avoid clipping */}
        {this.state.userMenuOpen && (
          <DropdownContainer style={{
            backgroundColor: 'red',
            border: '3px solid blue',
            padding: '5px'
          }}>
            <DropdownMenu
              $isOpen={this.state.userMenuOpen}
              style={{
                backgroundColor: 'white',
                border: '2px solid black',
                boxShadow: '0 0 20px rgba(0,0,0,0.5)'
              }}
            >
              {currentUser ? (
                <>
                  <DropdownItem onClick={() => this.handleNavigation("/editProfile")}>
                    📋 Edit Profile
                  </DropdownItem>
                  <DropdownItem onClick={() => this.handleNavigation("/places")}>
                    📍 My Places
                  </DropdownItem>
                  {isAdmin && (
                    <>
                      <DropdownItem onClick={() => this.handleNavigation("/adminRides")}>
                        🚗 Manage Rides
                      </DropdownItem>
                      <DropdownItem onClick={() => this.handleNavigation("/adminUsers")}>
                        👥 Manage Users
                      </DropdownItem>
                      <DropdownItem onClick={() => this.handleNavigation("/adminPlaces")}>
                        📍 Manage Places
                      </DropdownItem>
                      <DropdownItem onClick={() => this.handleNavigation("/_test")}>
                        🧪 Components Test
                      </DropdownItem>
                    </>
                  )}
                  <DropdownItem onClick={this.handleSignOut}>
                    🚪 Sign Out
                  </DropdownItem>
                </>
              ) : (
                <>
                  <DropdownItem onClick={() => this.handleNavigation("/signin")}>
                    👤 Sign In
                  </DropdownItem>
                  <DropdownItem onClick={() => this.handleNavigation("/signup")}>
                    📝 Sign Up
                  </DropdownItem>
                </>
              )}
            </DropdownMenu>
          </DropdownContainer>
        )}

        <MobileJoinRideModal
          open={this.state.joinRideModalOpen}
          onClose={this.handleJoinRideClose}
          prefillCode=""
        />

        <MobileAddRidesModal
          open={this.state.addRidesModalOpen}
          onClose={this.handleAddRidesClose}
        />
      </>
    );
  }
}

/** Declare the types of all properties. */
LiquidGlassMobileNavBar.propTypes = {
  currentUser: PropTypes.string,
  currentId: PropTypes.string,
  isAdmin: PropTypes.bool,
  isLoggedInAndEmailVerified: PropTypes.bool,
  history: PropTypes.object.isRequired,
};

/** withTracker connects Meteor data to React components. */
const LiquidGlassMobileNavBarContainer = withTracker(() => ({
  currentUser: Meteor.user() ? Meteor.user().username : "",
  currentId: Meteor.user() ? Meteor.user()._id : "",
  isAdmin: Meteor.user()
    ? Meteor.user().roles && Meteor.user().roles.includes("admin")
    : false,
  isLoggedInAndEmailVerified: Meteor.user()
    ? Meteor.user().emails &&
      Meteor.user().emails[0] &&
      Meteor.user().emails[0].verified
    : false,
}))(LiquidGlassMobileNavBar);

/** Enable ReactRouter for this component. */
export default withRouter(LiquidGlassMobileNavBarContainer);
