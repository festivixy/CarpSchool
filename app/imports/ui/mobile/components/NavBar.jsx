import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter, NavLink } from "react-router-dom";
import JoinRideModal from "../../components/JoinRideModal";

/** The Mobile NavBar appears at the top of every page with modern mobile design. */
class MobileNavBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      joinRideModalOpen: false,
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
    const homeLink = this.props.currentUser ? "/listMyRides" : "/";

    return (
      <>
        <nav className="mobile-navbar">
          <div className="mobile-navbar-container">
            {/* Logo */}
            <NavLink
              to={homeLink}
              className="mobile-navbar-logo"
              onClick={this.closeAllMenus}
            >
              <img
                src="/images/Carpool.png"
                alt="Carpool"
                className="mobile-navbar-logo-img"
              />
            </NavLink>

            {/* Desktop Navigation */}
            <div className="mobile-navbar-desktop-nav">
              {this.props.currentUser ? (
                <>
                  {/* My Rides Dropdown */}
                  <div className="mobile-navbar-dropdown">
                    <button
                      className="mobile-navbar-dropdown-trigger"
                      onClick={this.toggleMyRidesMenu}
                    >
                      My Rides ▼
                    </button>
                    {this.state.myRidesMenuOpen && (
                      <div className="mobile-navbar-dropdown-menu">
                        <NavLink
                          to="/listMyRides"
                          className="mobile-navbar-dropdown-item"
                          onClick={this.closeAllMenus}
                        >
                          All Rides
                        </NavLink>
                        <NavLink
                          to="/imDriving"
                          className="mobile-navbar-dropdown-item"
                          onClick={this.closeAllMenus}
                        >
                          I'm Driving
                        </NavLink>
                        <NavLink
                          to="/imRiding"
                          className="mobile-navbar-dropdown-item"
                          onClick={this.closeAllMenus}
                        >
                          I'm Riding
                        </NavLink>
                      </div>
                    )}
                  </div>

                  {/* Create Ride */}
                  <NavLink
                    to="/add/"
                    className="mobile-navbar-nav-item"
                    onClick={this.closeAllMenus}
                  >
                    ➕ Create Ride
                  </NavLink>

                  {/* Join Ride */}
                  <button
                    className="mobile-navbar-nav-item mobile-navbar-button"
                    onClick={this.handleJoinRideClick}
                  >
                    📱 Join Ride
                  </button>
                </>
              ) : null}

              {/* Admin Dropdown */}
              {this.props.isAdmin && (
                <div className="mobile-navbar-dropdown">
                  <button
                    className="mobile-navbar-dropdown-trigger"
                    onClick={this.toggleAdminMenu}
                  >
                    Admin ▼
                  </button>
                  {this.state.adminMenuOpen && (
                    <div className="mobile-navbar-dropdown-menu">
                      <NavLink
                        to="/adminRides"
                        className="mobile-navbar-dropdown-item"
                        onClick={this.closeAllMenus}
                      >
                        Manage Rides
                      </NavLink>
                      <NavLink
                        to="/adminUsers"
                        className="mobile-navbar-dropdown-item"
                        onClick={this.closeAllMenus}
                      >
                        Manage Users
                      </NavLink>
                      <NavLink
                        to="/testImageUpload"
                        className="mobile-navbar-dropdown-item"
                        onClick={this.closeAllMenus}
                      >
                        Test Image Upload
                      </NavLink>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Menu / Login */}
            <div className="mobile-navbar-user-section">
              {this.props.currentUser === "" ? (
                <div className="mobile-navbar-dropdown">
                  <button
                    className="mobile-navbar-dropdown-trigger"
                    onClick={this.toggleUserMenu}
                  >
                    Login ▼
                  </button>
                  {this.state.userMenuOpen && (
                    <div className="mobile-navbar-dropdown-menu mobile-navbar-dropdown-menu-right">
                      <NavLink
                        to="/signin"
                        className="mobile-navbar-dropdown-item"
                        onClick={this.closeAllMenus}
                      >
                        👤 Sign In
                      </NavLink>
                      <NavLink
                        to="/signup"
                        className="mobile-navbar-dropdown-item"
                        onClick={this.closeAllMenus}
                      >
                        📝 Sign Up
                      </NavLink>
                    </div>
                  )}
                </div>
              ) : (
                <div className="mobile-navbar-dropdown">
                  <button
                    className="mobile-navbar-dropdown-trigger"
                    onClick={this.toggleUserMenu}
                  >
                    👤 {this.props.currentUser} ▼
                  </button>
                  {this.state.userMenuOpen && (
                    <div className="mobile-navbar-dropdown-menu mobile-navbar-dropdown-menu-right">
                      <NavLink
                        to={`/addprofile/${this.props.currentId}`}
                        className="mobile-navbar-dropdown-item"
                        onClick={this.closeAllMenus}
                      >
                        📋 Profile
                      </NavLink>
                      <NavLink
                        to="/signout"
                        className="mobile-navbar-dropdown-item"
                        onClick={this.closeAllMenus}
                      >
                        🚪 Sign Out
                      </NavLink>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-navbar-menu-toggle"
              onClick={this.toggleMobileMenu}
            >
              {this.state.mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* Mobile Menu */}
          {this.state.mobileMenuOpen && (
            <div className="mobile-navbar-mobile-menu">
              {this.props.currentUser ? (
                <>
                  <div className="mobile-navbar-mobile-section">
                    <div className="mobile-navbar-mobile-section-title">
                      My Rides
                    </div>
                    <NavLink
                      to="/listMyRides"
                      className="mobile-navbar-mobile-item"
                      onClick={this.closeAllMenus}
                    >
                      All Rides
                    </NavLink>
                    <NavLink
                      to="/imDriving"
                      className="mobile-navbar-mobile-item"
                      onClick={this.closeAllMenus}
                    >
                      I'm Driving
                    </NavLink>
                    <NavLink
                      to="/imRiding"
                      className="mobile-navbar-mobile-item"
                      onClick={this.closeAllMenus}
                    >
                      I'm Riding
                    </NavLink>
                  </div>

                  <div className="mobile-navbar-mobile-section">
                    <NavLink
                      to="/add/"
                      className="mobile-navbar-mobile-item"
                      onClick={this.closeAllMenus}
                    >
                      ➕ Create Ride
                    </NavLink>
                    <button
                      className="mobile-navbar-mobile-item mobile-navbar-mobile-button"
                      onClick={this.handleJoinRideClick}
                    >
                      📱 Join Ride
                    </button>
                  </div>

                  {this.props.isAdmin && (
                    <div className="mobile-navbar-mobile-section">
                      <div className="mobile-navbar-mobile-section-title">
                        Admin
                      </div>
                      <NavLink
                        to="/adminRides"
                        className="mobile-navbar-mobile-item"
                        onClick={this.closeAllMenus}
                      >
                        Manage Rides
                      </NavLink>
                      <NavLink
                        to="/adminUsers"
                        className="mobile-navbar-mobile-item"
                        onClick={this.closeAllMenus}
                      >
                        Manage Users
                      </NavLink>
                      <NavLink
                        to="/testImageUpload"
                        className="mobile-navbar-mobile-item"
                        onClick={this.closeAllMenus}
                      >
                        Test Image Upload
                      </NavLink>
                    </div>
                  )}

                  <div className="mobile-navbar-mobile-section">
                    <div className="mobile-navbar-mobile-section-title">
                      Account
                    </div>
                    <NavLink
                      to={`/addprofile/${this.props.currentId}`}
                      className="mobile-navbar-mobile-item"
                      onClick={this.closeAllMenus}
                    >
                      📋 Profile
                    </NavLink>
                    <NavLink
                      to="/signout"
                      className="mobile-navbar-mobile-item"
                      onClick={this.closeAllMenus}
                    >
                      🚪 Sign Out
                    </NavLink>
                  </div>
                </>
              ) : (
                <div className="mobile-navbar-mobile-section">
                  <NavLink
                    to="/signin"
                    className="mobile-navbar-mobile-item"
                    onClick={this.closeAllMenus}
                  >
                    👤 Sign In
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="mobile-navbar-mobile-item"
                    onClick={this.closeAllMenus}
                  >
                    📝 Sign Up
                  </NavLink>
                </div>
              )}
            </div>
          )}
        </nav>

        <JoinRideModal
          open={this.state.joinRideModalOpen}
          onClose={this.handleJoinRideClose}
          prefillCode=""
        />

        <style jsx>{`
          .mobile-navbar {
            background-color: rgba(0, 0, 0, 1);
            color: white;
            position: sticky;
            top: 0;
            z-index: 1000;
            font-family:
              Inter,
              -apple-system,
              Roboto,
              Helvetica,
              sans-serif;
          }

          .mobile-navbar-container {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .mobile-navbar-logo {
            text-decoration: none;
            display: flex;
            align-items: center;
          }

          .mobile-navbar-logo-img {
            height: 40px;
            width: auto;
            border-radius: 8px;
          }

          .mobile-navbar-desktop-nav {
            display: none;
            align-items: center;
            gap: 20px;
            flex: 1;
            margin-left: 40px;
          }

          .mobile-navbar-user-section {
            display: none;
          }

          .mobile-navbar-dropdown {
            position: relative;
          }

          .mobile-navbar-dropdown-trigger {
            background: none;
            border: none;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            padding: 8px 12px;
            border-radius: 6px;
            transition: all 0.2s ease;
            font-family: inherit;
          }

          .mobile-navbar-dropdown-trigger:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }

          .mobile-navbar-dropdown-menu {
            position: absolute;
            top: 100%;
            left: 0;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            min-width: 180px;
            z-index: 1001;
            margin-top: 4px;
          }

          .mobile-navbar-dropdown-menu-right {
            left: auto;
            right: 0;
          }

          .mobile-navbar-dropdown-item {
            display: block;
            padding: 12px 16px;
            color: #333;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            border-bottom: 1px solid #f0f0f0;
            transition: all 0.2s ease;
          }

          .mobile-navbar-dropdown-item:last-child {
            border-bottom: none;
          }

          .mobile-navbar-dropdown-item:hover {
            background-color: #f8f9fa;
            color: #024731;
          }

          .mobile-navbar-nav-item {
            color: white;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
            padding: 8px 12px;
            border-radius: 6px;
            transition: all 0.2s ease;
            white-space: nowrap;
          }

          .mobile-navbar-nav-item:hover {
            background-color: rgba(255, 255, 255, 0.1);
            color: white;
          }

          .mobile-navbar-button {
            background: none;
            border: none;
            cursor: pointer;
            font-family: inherit;
          }

          .mobile-navbar-menu-toggle {
            display: block;
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            padding: 8px;
            border-radius: 4px;
            transition: all 0.2s ease;
          }

          .mobile-navbar-menu-toggle:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }

          .mobile-navbar-mobile-menu {
            background-color: rgba(0, 0, 0, 1);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }

          .mobile-navbar-mobile-section {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding: 16px;
          }

          .mobile-navbar-mobile-section:last-child {
            border-bottom: none;
          }

          .mobile-navbar-mobile-section-title {
            font-size: 12px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.7);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
          }

          .mobile-navbar-mobile-item {
            display: block;
            color: white;
            text-decoration: none;
            font-size: 16px;
            font-weight: 500;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            transition: all 0.2s ease;
          }

          .mobile-navbar-mobile-item:last-child {
            border-bottom: none;
          }

          .mobile-navbar-mobile-item:hover {
            color: rgba(255, 255, 255, 0.8);
            padding-left: 8px;
          }

          .mobile-navbar-mobile-button {
            background: none;
            border: none;
            width: 100%;
            text-align: left;
            cursor: pointer;
            font-family: inherit;
          }

          /* Desktop styles */
          @media (min-width: 768px) {
            .mobile-navbar-desktop-nav {
              display: flex;
            }

            .mobile-navbar-user-section {
              display: block;
            }

            .mobile-navbar-menu-toggle {
              display: none;
            }

            .mobile-navbar-mobile-menu {
              display: none;
            }
          }

          /* Active link styles */
          .mobile-navbar-nav-item.active,
          .mobile-navbar-dropdown-item.active,
          .mobile-navbar-mobile-item.active {
            background-color: rgba(255, 255, 255, 0.15);
          }
        `}</style>
      </>
    );
  }
}

/** Declare the types of all properties. */
MobileNavBar.propTypes = {
  currentUser: PropTypes.string,
  currentId: PropTypes.string,
  isAdmin: PropTypes.bool,
};

/** withTracker connects Meteor data to React components. */
const MobileNavBarContainer = withTracker(() => ({
  currentUser: Meteor.user() ? Meteor.user().username : "",
  currentId: Meteor.user() ? Meteor.user()._id : "",
  isAdmin: Meteor.user()
    ? Meteor.user().roles && Meteor.user().roles.includes("admin")
    : false,
}))(MobileNavBar);

/** Enable ReactRouter for this component. */
export default withRouter(MobileNavBarContainer);
