import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import JoinRideModal from "../../components/JoinRideModal";
import AddRidesModal from "../../components/AddRides";
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
  RelativeContainer,
} from "../styles/MobileNavBarCSS";

/**
 * LiquidGlass Mobile Navigation Bar - Bottom tab bar with glass morphism effect
 */
class MobileNavBarCSS extends React.Component {
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
    const { currentUser, isAdmin } = this.props;
    const homeLink = currentUser ? "/myRides" : "/";

    // Calculate total notifications (placeholder for now)
    const totalNotifications = 5; // This would come from real notification system

    return (
      <RelativeContainer>
        <NavBarContainer className="liquid-glass-mobile-navbar">
          <TabBarInner>
            <TabsContainer>
              {/* Home/My Rides Tab */}
              <TabBarItem
                onClick={() => this.handleNavigation(homeLink)}
                data-navbar-item="home"
              >
                <img
                  src="/svg/home.svg"
                  alt="Home"
                  style={{
                    width: "24px",
                    height: "24px",
                    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                  }}
                />
                <TabLabel>{currentUser ? "My Rides" : "Home"}</TabLabel>
              </TabBarItem>

              {/* Search/Join Ride Tab */}
              <TabBarItem
                onClick={this.handleJoinRideClick}
                data-navbar-item="search"
              >
                <img
                  src="/svg/search.svg"
                  alt="Search"
                  style={{
                    width: "24px",
                    height: "24px",
                    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                  }}
                />
                <TabLabel>Join Ride</TabLabel>
              </TabBarItem>

              {/* Add/Create Ride Tab */}
              <TabBarItem
                onClick={this.handleAddRidesClick}
                data-navbar-item="create"
              >
                <img
                  src="/svg/plus.svg"
                  alt="Add"
                  style={{
                    width: "24px",
                    height: "24px",
                    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                  }}
                />
                <TabLabel>Create</TabLabel>
              </TabBarItem>

              {/* Messages/Chat Tab with Notification Badge */}
              <TabWithBadge
                onClick={() => this.handleNavigation("/chat")}
                data-navbar-item="messages"
              >
                <img
                  src="/svg/message.svg"
                  alt="Messages"
                  style={{
                    width: "24px",
                    height: "24px",
                    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                  }}
                />
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
                style={{ position: "relative" }}
                data-navbar-item="profile"
              >
                <img
                  src="/svg/user.svg"
                  alt="Profile"
                  style={{
                    width: "24px",
                    height: "24px",
                    filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                    borderRadius: "50%",
                  }}
                />
                <TabLabel>Profile</TabLabel>
              </TabBarItem>
            </TabsContainer>
          </TabBarInner>

          {/* User Dropdown Menu - Inside NavBarContainer for proper positioning */}
          {this.state.userMenuOpen && (
          <DropdownContainer>
            <DropdownMenu $isOpen={this.state.userMenuOpen}>
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
                      <DropdownItem onClick={() => this.handleNavigation("/admin/rides")}>
                        🚗 Manage Rides
                      </DropdownItem>
                      <DropdownItem onClick={() => this.handleNavigation("/admin/users")}>
                        👥 Manage Users
                      </DropdownItem>
                      <DropdownItem onClick={() => this.handleNavigation("/admin/places")}>
                        📍 Manage Places
                      </DropdownItem>
                      <DropdownItem onClick={() => this.handleNavigation("/admin/error-reports")}>
                        🚨 Error Reports
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
        </NavBarContainer>

        <JoinRideModal
          open={this.state.joinRideModalOpen}
          onClose={this.handleJoinRideClose}
          prefillCode=""
        />

        <AddRidesModal
          open={this.state.addRidesModalOpen}
          onClose={this.handleAddRidesClose}
        />
      </RelativeContainer>
    );
  }
}

/** Declare the types of all properties. */
MobileNavBarCSS.propTypes = {
  currentUser: PropTypes.string,
  currentId: PropTypes.string,
  isAdmin: PropTypes.bool,
  isLoggedInAndEmailVerified: PropTypes.bool,
  history: PropTypes.object.isRequired,
};

/** withTracker connects Meteor data to React components. */
const MobileNavBarCSSContainer = withTracker(() => ({
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
}))(MobileNavBarCSS);

/** Enable ReactRouter for this component. */
export default withRouter(MobileNavBarCSSContainer);
