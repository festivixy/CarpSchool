import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import JoinRideModal from "../../components/JoinRideModal";
import AddRidesModal from "../../components/AddRides";
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
  NavItem,
  NavButton,
  MenuToggle,
  MobileMenu,
  MobileSection,
  MobileSectionTitle,
  MobileItem,
  MobileButton,
} from "../styles/NavBar";

/** The Desktop NavBar appears at the top of every page with responsive design for both desktop and mobile viewports. */
class NavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      joinRideModalOpen: false,
      addRidesModalOpen: false,
      mobileMenuOpen: false,
      userMenuOpen: false,
      adminMenuOpen: false,
      systemMenuOpen: false,
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
      adminMenuOpen: false,
      systemMenuOpen: false,
    }));
  };

  toggleUserMenu = () => {
    this.setState((prevState) => ({
      userMenuOpen: !prevState.userMenuOpen,
      adminMenuOpen: false,
      systemMenuOpen: false,
    }));
  };

  toggleAdminMenu = () => {
    this.setState((prevState) => ({
      adminMenuOpen: !prevState.adminMenuOpen,
      userMenuOpen: false,
      systemMenuOpen: false,
    }));
  };

  toggleSystemMenu = () => {
    this.setState((prevState) => ({
      systemMenuOpen: !prevState.systemMenuOpen,
      userMenuOpen: false,
      adminMenuOpen: false,
    }));
  };

  closeAllMenus = () => {
    this.setState({
      mobileMenuOpen: false,
      userMenuOpen: false,
      adminMenuOpen: false,
      systemMenuOpen: false,
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
    const homeLink = this.props.currentUser ? "/my-rides" : "/";

    return (
      <>
        <NavBarContainer className="mobile-navbar">
          <NavBarInner>
            {/* Logo */}
            <Logo to={homeLink} onClick={this.closeAllMenus}>
              <LogoImg src="/staticimages/carp.school.png" alt="CarpSchool" />
            </Logo>

            {/* Desktop Navigation */}
            <DesktopNav>
              {this.props.isLoggedInAndEmailVerified ? (
                <>
                  {/* My Rides */}
                  <NavItem to="/my-rides" onClick={this.closeAllMenus}>
                    🚗 My Rides
                  </NavItem>

                  {/* Create Ride */}
                  <NavButton onClick={this.handleAddRidesClick}>
                    ➕ Create Ride
                  </NavButton>

                  {/* Join Ride */}
                  <NavButton onClick={this.handleJoinRideClick}>
                    📱 Join Ride
                  </NavButton>

                  {/* My Places */}
                  <NavItem to="/places" onClick={this.closeAllMenus}>
                    📍 My Places
                  </NavItem>
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
                        to="/admin/rides"
                        onClick={this.closeAllMenus}
                      >
                        Manage Rides
                      </DropdownItem>
                      <DropdownItem
                        to="/admin/users"
                        onClick={this.closeAllMenus}
                      >
                        Manage Users
                      </DropdownItem>
                      <DropdownItem
                        to="/admin/pending-users"
                        onClick={this.closeAllMenus}
                      >
                        ⏳ Pending Approvals
                      </DropdownItem>
                      <DropdownItem
                        to="/admin/places"
                        onClick={this.closeAllMenus}
                      >
                        Manage Places
                      </DropdownItem>
                      <DropdownItem
                        to="/admin/school-management"
                        onClick={this.closeAllMenus}
                      >
                        🏫 School Settings
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </Dropdown>
              )}

              {this.props.isSystem && (
                <Dropdown>
                  <DropdownTrigger onClick={this.toggleSystemMenu}>
                    System ▼
                  </DropdownTrigger>
                  {this.state.systemMenuOpen && (
                    <DropdownMenu>
                      <DropdownItem
                        to="/system"
                        onClick={this.closeAllMenus}
                      >
                        🛠️ System Content
                      </DropdownItem>
                      <DropdownItem
                        to="/admin/schools"
                        onClick={this.closeAllMenus}
                      >
                        🏫 Manage Schools
                      </DropdownItem>
                      <DropdownItem
                        to="/admin/error-reports"
                        onClick={this.closeAllMenus}
                      >
                        🚨 Error Reports
                      </DropdownItem>
                      <DropdownItem
                        to="/_test/image-upload"
                        onClick={this.closeAllMenus}
                      >
                        Test Image Upload
                      </DropdownItem>
                      <DropdownItem to="/_test" onClick={this.closeAllMenus}>
                        Components Test
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
                      <DropdownItem to="/login" onClick={this.closeAllMenus}>
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
                        to="/chat"
                        onClick={this.closeAllMenus}
                      >
                        💬 Messages
                      </DropdownItem>
                      <DropdownItem
                        to="/edit-profile"
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
                    <MobileItem to="/my-rides" onClick={this.closeAllMenus}>
                      🚗 My Rides
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

                  <MobileSection>
                    <MobileItem to="/places" onClick={this.closeAllMenus}>
                      📍 My Places
                    </MobileItem>
                  </MobileSection>

                  {this.props.isAdmin && (
                    <MobileSection>
                      <MobileSectionTitle>Admin</MobileSectionTitle>
                      <MobileItem to="/admin/rides" onClick={this.closeAllMenus}>
                        Manage Rides
                      </MobileItem>
                      <MobileItem to="/admin/users" onClick={this.closeAllMenus}>
                        Manage Users
                      </MobileItem>
                      <MobileItem to="/admin/pending-users" onClick={this.closeAllMenus}>
                        ⏳ Pending Approvals
                      </MobileItem>
                      <MobileItem
                        to="/admin/places"
                        onClick={this.closeAllMenus}
                      >
                        Manage Places
                      </MobileItem>
                      <MobileItem to="/admin/school-management" onClick={this.closeAllMenus}>
                        🏫 School Settings
                      </MobileItem>
                    </MobileSection>
                  )}

                  {this.props.isSystem && (
                    <MobileSection>
                      <MobileSectionTitle>System</MobileSectionTitle>
                      <MobileItem to="/system" onClick={this.closeAllMenus}>
                        🛠️ System Content
                      </MobileItem>
                      <MobileItem to="/admin/schools" onClick={this.closeAllMenus}>
                        🏫 Manage Schools
                      </MobileItem>
                      <MobileItem
                        to="/admin/error-reports"
                        onClick={this.closeAllMenus}
                      >
                        🚨 Error Reports
                      </MobileItem>
                      <MobileItem
                        to="/_test/image-upload"
                        onClick={this.closeAllMenus}
                      >
                        Test Image Upload
                      </MobileItem>
                      <MobileItem to="/_test" onClick={this.closeAllMenus}>
                        Components Test
                      </MobileItem>
                    </MobileSection>
                  )}

                  <MobileSection>
                    <MobileSectionTitle>Account</MobileSectionTitle>
                    <MobileItem to="/chat" onClick={this.closeAllMenus}>
                      💬 Messages
                    </MobileItem>
                    <MobileItem to="/edit-profile" onClick={this.closeAllMenus}>
                      📋 Edit Profile
                    </MobileItem>
                    <MobileItem to="/signout" onClick={this.closeAllMenus}>
                      🚪 Sign Out
                    </MobileItem>
                  </MobileSection>
                </>
              ) : (
                <MobileSection>
                  <MobileItem to="/login" onClick={this.closeAllMenus}>
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

        <JoinRideModal
          open={this.state.joinRideModalOpen}
          onClose={this.handleJoinRideClose}
          prefillCode=""
        />

        <AddRidesModal
          open={this.state.addRidesModalOpen}
          onClose={this.handleAddRidesClose}
        />
      </>
    );
  }
}

/** Declare the types of all properties. */
NavBar.propTypes = {
  currentUser: PropTypes.string,
  currentId: PropTypes.string,
  isAdmin: PropTypes.bool,
  isSystem: PropTypes.bool,
  isLoggedInAndEmailVerified: PropTypes.bool,
};

/** withTracker connects Meteor data to React components. */
const MobileNavBarContainer = withTracker(() => ({
  currentUser: Meteor.user() ? Meteor.user().username : "",
  currentId: Meteor.user() ? Meteor.user()._id : "",
  isAdmin: Meteor.user()
    ? (() => {
        const user = Meteor.user();
        return user?.roles?.includes("system") ||
               user?.roles?.some(role => role.startsWith("admin."));
      })()
    : false,
  isSystem: Meteor.user()
    ? Meteor.user().roles && Meteor.user().roles.includes("system")
    : false,
  isLoggedInAndEmailVerified: Meteor.user()
    ? Meteor.user().emails &&
      Meteor.user().emails[0] &&
      Meteor.user().emails[0].verified
    : false,
}))(NavBar);

/** Enable ReactRouter for this component. */
export default withRouter(MobileNavBarContainer);
