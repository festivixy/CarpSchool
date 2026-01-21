import React from "react";
import PropTypes from "prop-types";
import { withRouter, Link } from "react-router-dom";
import { useAuth, useUserButton } from "@clerk/clerk-react";
import { withTracker } from "meteor/react-meteor-data";
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
  DropdownButton,
  NavItem,
  NavButton,
  MenuToggle,
  MobileMenu,
  MobileSection,
  MobileSectionTitle,
  MobileItem,
  MobileButton,
} from "../styles/NavBar";

/**
 * Desktop NavBar using Clerk for authentication
 */
function NavBar({ currentUser }) {
  const { isSignedIn, signOut, userId } = useAuth();
  const [joinRideModalOpen, setJoinRideModalOpen] = React.useState(false);
  const [addRidesModalOpen, setAddRidesModalOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);
  const [systemMenuOpen, setSystemMenuOpen] = React.useState(false);

  const handleJoinRideClick = () => {
    setJoinRideModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleJoinRideClose = () => {
    setJoinRideModalOpen(false);
  };

  const handleAddRidesClick = () => {
    setAddRidesModalOpen(true);
    setMobileMenuOpen(false);
  };

  const handleAddRidesClose = () => {
    setAddRidesModalOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    setUserMenuOpen(false);
    setAdminMenuOpen(false);
    setSystemMenuOpen(false);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
    setAdminMenuOpen(false);
    setSystemMenuOpen(false);
  };

  const toggleAdminMenu = () => {
    setAdminMenuOpen(!adminMenuOpen);
    setUserMenuOpen(false);
    setSystemMenuOpen(false);
  };

  const toggleSystemMenu = () => {
    setSystemMenuOpen(!systemMenuOpen);
    setUserMenuOpen(false);
    setAdminMenuOpen(false);
  };

  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
    setAdminMenuOpen(false);
    setSystemMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const isAdmin = currentUser?.roles?.includes("admin") ||
    currentUser?.roles?.some(r => r.startsWith("admin."));
  const isSystem = currentUser?.roles?.includes("system");

  return (
    <NavBarContainer>
      <NavBarInner>
        <Logo to="/">
          <LogoImg src="/images/logo.png" alt="CarpSchool" />
        </Logo>

        <DesktopNav>
          {isSignedIn && (
            <>
              <NavItem>
                <NavButton as={Link} to="/my-rides" onClick={closeAllMenus}>
                  Find Rides
                </NavButton>
              </NavItem>
              <NavItem>
                <NavButton as={Link} to="/places" onClick={closeAllMenus}>
                  Places
                </NavButton>
              </NavItem>
            </>
          )}

          {isAdmin && (
            <Dropdown open={adminMenuOpen} onToggle={toggleAdminMenu}>
              <DropdownTrigger as={NavButton}>
                Admin ▾
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem as={Link} to="/admin/rides" onClick={closeAllMenus}>
                  Manage Rides
                </DropdownItem>
                <DropdownItem as={Link} to="/admin/users" onClick={closeAllMenus}>
                  Manage Users
                </DropdownItem>
                <DropdownItem as={Link} to="/admin/pending-users" onClick={closeAllMenus}>
                  Pending Users
                </DropdownItem>
                <DropdownItem as={Link} to="/admin/places" onClick={closeAllMenus}>
                  Manage Places
                </DropdownItem>
                <DropdownItem as={Link} to="/admin/school-management" onClick={closeAllMenus}>
                  School Management
                </DropdownItem>
                <DropdownItem as={Link} to="/admin/error-reports" onClick={closeAllMenus}>
                  Error Reports
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}

          {isSystem && (
            <Dropdown open={systemMenuOpen} onToggle={toggleSystemMenu}>
              <DropdownTrigger as={NavButton}>
                System ▾
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem as={Link} to="/admin/schools" onClick={closeAllMenus}>
                  Manage Schools
                </DropdownItem>
                <DropdownItem as={Link} to="/system" onClick={closeAllMenus}>
                  System Admin
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          )}
        </DesktopNav>

        <UserSection>
          {isSignedIn ? (
            <Dropdown open={userMenuOpen} onToggle={toggleUserMenu}>
              <DropdownTrigger as={NavButton}>
                {currentUser?.username || "User"} ▾
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem as={Link} to="/mobile/profile" onClick={closeAllMenus}>
                  My Profile
                </DropdownItem>
                <DropdownItem as={Link} to="/edit-profile" onClick={closeAllMenus}>
                  Edit Profile
                </DropdownItem>
                <DropdownItem as={Link} to="/ride-history/me" onClick={closeAllMenus}>
                  My Ride History
                </DropdownItem>
                <DropdownButton onClick={() => { handleSignOut(); closeAllMenus(); }}>
                  Sign Out
                </DropdownButton>
              </DropdownMenu>
            </Dropdown>
          ) : (
            <>
              <NavButton as={Link} to="/login">Sign In</NavButton>
              <NavButton primary as={Link} to="/signup">Sign Up</NavButton>
            </>
          )}
        </UserSection>

        <MenuToggle onClick={toggleMobileMenu}>
          ☰
        </MenuToggle>
      </NavBarInner>

      {mobileMenuOpen && (
        <MobileMenu>
          {isSignedIn ? (
            <>
              <MobileSection>
                <MobileSectionTitle>Rides</MobileSectionTitle>
                <MobileItem as={Link} to="/my-rides" onClick={toggleMobileMenu}>
                  Find Rides
                </MobileItem>
                <MobileItem as={Link} to="/places" onClick={toggleMobileMenu}>
                  Places
                </MobileItem>
                <MobileButton onClick={() => { handleJoinRideClick(); toggleMobileMenu(); }}>
                  Join a Ride
                </MobileButton>
                <MobileButton onClick={() => { handleAddRidesClick(); toggleMobileMenu(); }}>
                  Offer a Ride
                </MobileButton>
              </MobileSection>

              <MobileSection>
                <MobileSectionTitle>Profile</MobileSectionTitle>
                <MobileItem as={Link} to="/mobile/profile" onClick={toggleMobileMenu}>
                  My Profile
                </MobileItem>
                <MobileItem as={Link} to="/edit-profile" onClick={toggleMobileMenu}>
                  Edit Profile
                </MobileItem>
                <MobileItem as={Link} to="/ride-history/me" onClick={toggleMobileMenu}>
                  My Ride History
                </MobileItem>
                <MobileItem as={Link} to="/chat" onClick={toggleMobileMenu}>
                  Messages
                </MobileItem>
              </MobileSection>

              {isAdmin && (
                <MobileSection>
                  <MobileSectionTitle>Admin</MobileSectionTitle>
                  <MobileItem as={Link} to="/admin/rides" onClick={toggleMobileMenu}>
                    Manage Rides
                  </MobileItem>
                  <MobileItem as={Link} to="/admin/users" onClick={toggleMobileMenu}>
                    Manage Users
                  </MobileItem>
                  <MobileItem as={Link} to="/admin/places" onClick={toggleMobileMenu}>
                    Manage Places
                  </MobileItem>
                </MobileSection>
              )}

              <MobileSection>
                <MobileButton onClick={() => { handleSignOut(); toggleMobileMenu(); }}>
                  Sign Out
                </MobileButton>
              </MobileSection>
            </>
          ) : (
            <MobileSection>
              <MobileButton as={Link} to="/login" onClick={toggleMobileMenu}>
                Sign In
              </MobileButton>
              <MobileButton as={Link} to="/signup" onClick={toggleMobileMenu} primary>
                Sign Up
              </MobileButton>
            </MobileSection>
          )}
        </MobileMenu>
      )}

      <JoinRideModal
        open={joinRideModalOpen}
        onClose={handleJoinRideClose}
      />

      <AddRidesModal
        open={addRidesModalOpen}
        onClose={handleAddRidesClose}
      />
    </NavBarContainer>
  );
}

NavBar.propTypes = {
  currentUser: PropTypes.object,
};

const NavBarTracked = withTracker(() => ({
  currentUser: Meteor.user(),
}))(NavBar);

export default withRouter(NavBarTracked);
