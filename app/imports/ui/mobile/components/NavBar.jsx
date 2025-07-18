import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import MobileJoinRideModal from "./JoinRideModal";
import MobileAddRidesModal from "./AddRides";
import {
  NavBarContainer,
  NavBarInner,
  Logo,
  LogoImg,
  DesktopNav,
  UserSection,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  NavButton,
  MenuToggle,
  MobileMenu,
  MobileSection,
  MobileSectionTitle,
  MobileItem,
  MobileButton,
} from "../styles/NavBar";

/** The Mobile NavBar appears at the top of every page with modern mobile design. */
class MobileNavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      joinRideModalOpen: false,
      addRidesModalOpen: false,
      mobileMenuOpen: false,
      userMenuOpen: false,
      myRidesMenuOpen: false,
      adminMenuOpen: false,
    };
  }

  handleJoinRideClick = () => {
    this.setState({ joinRideModalOpen: true, mobileMenuOpen: false });
  };

  handleJoinRideClose = () => {
    this.setState({ joinRideModalOpen: false });
  };

  handleAddRidesClick = () => {
    this.setState({ addRidesModalOpen: true, mobileMenuOpen: false });
  };

  handleAddRidesClose = () => {
    this.setState({ addRidesModalOpen: false });
  };

  toggleMobileMenu = () => {
    this.setState((prevState) => ({
      mobileMenuOpen: !prevState.mobileMenuOpen,
      userMenuOpen: false,
      myRidesMenuOpen: false,
      adminMenuOpen: false,
    }));
  };

  toggleUserMenu = () => {
    this.setState((prevState) => ({
      userMenuOpen: !prevState.userMenuOpen,
      myRidesMenuOpen: false,
      adminMenuOpen: false,
    }));
  };

  toggleMyRidesMenu = () => {
    this.setState((prevState) => ({
      myRidesMenuOpen: !prevState.myRidesMenuOpen,
      userMenuOpen: false,
      adminMenuOpen: false,
    }));
  };

  toggleAdminMenu = () => {
    this.setState((prevState) => ({
      adminMenuOpen: !prevState.adminMenuOpen,
      userMenuOpen: false,
      myRidesMenuOpen: false,
    }));
  };

  closeAllMenus = () => {
    this.setState({
      mobileMenuOpen: false,
      userMenuOpen: false,
      myRidesMenuOpen: false,
      adminMenuOpen: false,
    });
  };

  // Close menus when clicking outside
  componentDidMount() {
    document.addEventListener("click", this.handleOutsideClick);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
  }

  handleOutsideClick = (event) => {
    if (!event.target.closest(".mobile-navbar")) {
      this.closeAllMenus();
    }
  };

  render() {
    const homeLink = this.props.currentUser ? "/imDriving" : "/";

    return (
      <>
        <NavBarContainer className="mobile-navbar">
          <NavBarInner>
            {/* Logo */}
            <Logo to={homeLink} onClick={this.closeAllMenus}>
              <LogoImg src="/staticimages/Carpool.png" alt="Carpool" />
            </Logo>

            {/* Desktop Navigation */}
            <DesktopNav>
              {this.props.isLoggedInAndEmailVerified ? (
                <>
                  {/* My Rides Dropdown */}
                  <Dropdown>
                    <DropdownTrigger onClick={this.toggleMyRidesMenu}>
                      My Rides ▼
                    </DropdownTrigger>
                    {this.state.myRidesMenuOpen && (
                      <DropdownMenu>
                        <DropdownItem
                          to="/imDriving"
                          onClick={this.closeAllMenus}
                        >
                          I&apos;m Driving
                        </DropdownItem>
                        <DropdownItem
                          to="/imRiding"
                          onClick={this.closeAllMenus}
                        >
                          I&apos;m Riding
                        </DropdownItem>
                      </DropdownMenu>
                    )}
                  </Dropdown>

                  {/* Create Ride */}
                  <NavButton onClick={this.handleAddRidesClick}>
                    ➕ Create Ride
                  </NavButton>

                  {/* Join Ride */}
                  <NavButton onClick={this.handleJoinRideClick}>
                    📱 Join Ride
                  </NavButton>
                </>
              ) : null}

              {/* Admin Dropdown */}
              {this.props.isAdmin && (
                <Dropdown>
                  <DropdownTrigger onClick={this.toggleAdminMenu}>
                    Admin ▼
                  </DropdownTrigger>
                  {this.state.adminMenuOpen && (
                    <DropdownMenu>
                      <DropdownItem
                        to="/adminRides"
                        onClick={this.closeAllMenus}
                      >
                        Manage Rides
                      </DropdownItem>
                      <DropdownItem
                        to="/adminUsers"
                        onClick={this.closeAllMenus}
                      >
                        Manage Users
                      </DropdownItem>
                      <DropdownItem
                        to="/testImageUpload"
                        onClick={this.closeAllMenus}
                      >
                        Test Image Upload
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </Dropdown>
              )}
            </DesktopNav>

            {/* User Menu / Login */}
            <UserSection>
              {this.props.currentUser === "" ? (
                <Dropdown>
                  <DropdownTrigger onClick={this.toggleUserMenu}>
                    Login ▼
                  </DropdownTrigger>
                  {this.state.userMenuOpen && (
                    <DropdownMenu className="right">
                      <DropdownItem to="/signin" onClick={this.closeAllMenus}>
                        👤 Sign In
                      </DropdownItem>
                      <DropdownItem to="/signup" onClick={this.closeAllMenus}>
                        📝 Sign Up
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </Dropdown>
              ) : (
                <Dropdown>
                  <DropdownTrigger onClick={this.toggleUserMenu}>
                    👤 {this.props.currentUser} ▼
                  </DropdownTrigger>
                  {this.state.userMenuOpen && (
                    <DropdownMenu className="right">
                      <DropdownItem
                        to="/editProfile"
                        onClick={this.closeAllMenus}
                      >
                        📋 Edit Profile
                      </DropdownItem>
                      <DropdownItem to="/signout" onClick={this.closeAllMenus}>
                        🚪 Sign Out
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </Dropdown>
              )}
            </UserSection>

            {/* Mobile Menu Toggle */}
            <MenuToggle onClick={this.toggleMobileMenu}>
              {this.state.mobileMenuOpen ? "✕" : "☰"}
            </MenuToggle>
          </NavBarInner>

          {/* Mobile Menu */}
          {this.state.mobileMenuOpen && (
            <MobileMenu>
              {this.props.isLoggedInAndEmailVerified ? (
                <>
                  <MobileSection>
                    <MobileSectionTitle>My Rides</MobileSectionTitle>
                    <MobileItem to="/imDriving" onClick={this.closeAllMenus}>
                      I&apos;m Driving
                    </MobileItem>
                    <MobileItem to="/imRiding" onClick={this.closeAllMenus}>
                      I&apos;m Riding
                    </MobileItem>
                  </MobileSection>

                  <MobileSection>
                    <MobileButton onClick={this.handleAddRidesClick}>
                      ➕ Create Ride
                    </MobileButton>
                    <MobileButton onClick={this.handleJoinRideClick}>
                      📱 Join Ride
                    </MobileButton>
                  </MobileSection>

                  {this.props.isAdmin && (
                    <MobileSection>
                      <MobileSectionTitle>Admin</MobileSectionTitle>
                      <MobileItem to="/adminRides" onClick={this.closeAllMenus}>
                        Manage Rides
                      </MobileItem>
                      <MobileItem to="/adminUsers" onClick={this.closeAllMenus}>
                        Manage Users
                      </MobileItem>
                      <MobileItem
                        to="/testImageUpload"
                        onClick={this.closeAllMenus}
                      >
                        Test Image Upload
                      </MobileItem>
                    </MobileSection>
                  )}

                  <MobileSection>
                    <MobileSectionTitle>Account</MobileSectionTitle>
                    <MobileItem to="/editProfile" onClick={this.closeAllMenus}>
                      📋 Edit Profile
                    </MobileItem>
                    <MobileItem to="/signout" onClick={this.closeAllMenus}>
                      🚪 Sign Out
                    </MobileItem>
                  </MobileSection>
                </>
              ) : (
                <MobileSection>
                  <MobileItem to="/signin" onClick={this.closeAllMenus}>
                    👤 Sign In
                  </MobileItem>
                  <MobileItem to="/signup" onClick={this.closeAllMenus}>
                    📝 Sign Up
                  </MobileItem>
                </MobileSection>
              )}
            </MobileMenu>
          )}
        </NavBarContainer>

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
MobileNavBar.propTypes = {
  currentUser: PropTypes.string,
  currentId: PropTypes.string,
  isAdmin: PropTypes.bool,
  isLoggedInAndEmailVerified: PropTypes.bool,
};

/** withTracker connects Meteor data to React components. */
const MobileNavBarContainer = withTracker(() => ({
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
}))(MobileNavBar);

/** Enable ReactRouter for this component. */
export default withRouter(MobileNavBarContainer);
