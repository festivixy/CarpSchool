import React from "react";
import PropTypes from "prop-types";
import { withRouter, Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { withTracker } from "meteor/react-meteor-data";
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
 * Uses Clerk for authentication
 */
function MobileNavBarCSS({ currentUser, history }) {
  const { isSignedIn, signOut } = useAuth();
  const [joinRideModalOpen, setJoinRideModalOpen] = React.useState(false);
  const [addRidesModalOpen, setAddRidesModalOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState(null);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!event.target.closest(".liquid-glass-mobile-navbar")) {
        closeAllDropdowns();
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const closeAllDropdowns = () => {
    setUserMenuOpen(false);
    setAdminMenuOpen(false);
    setActiveDropdown(null);
  };

  const handleNavigation = (path) => {
    history.push(path);
    closeAllDropdowns();
  };

  const handleSignOut = async () => {
    try {
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const isAdmin = currentUser?.roles?.includes("system") ||
    currentUser?.roles?.some(r => r.startsWith("admin."));

  return (
    <NavBarContainer className="liquid-glass-mobile-navbar">
      <TabBarInner>
        <TabsContainer>
          {isSignedIn && (
            <TabBarItem as={Link} to="/my-rides" onClick={closeAllDropdowns}>
              <TabLabel>Rides</TabLabel>
            </TabBarItem>
          )}

          {isSignedIn && (
            <TabBarItem as={Link} to="/places" onClick={closeAllDropdowns}>
              <TabLabel>Places</TabLabel>
            </TabBarItem>
          )}

          {isSignedIn && (
            <TabWithBadge onClick={() => { setJoinRideModalOpen(true); closeAllDropdowns(); }}>
              <TabLabel>Join</TabLabel>
            </TabWithBadge>
          )}

          {isSignedIn && (
            <TabBarItem as={Link} to="/chat" onClick={closeAllDropdowns}>
              <TabLabel>Chat</TabLabel>
            </TabBarItem>
          )}

          <TabWithBadge onClick={() => { setActiveDropdown(activeDropdown === "more" ? null : "more"); }}>
            <TabLabel>More ▾</TabLabel>
          </TabWithBadge>
        </TabsContainer>
      </TabBarInner>

      {activeDropdown === "more" && (
        <RelativeContainer>
          <DropdownContainer>
            <DropdownMenu>
              {isSignedIn ? (
                <>
                  <DropdownItem as={Link} to="/mobile/profile" onClick={() => handleNavigation("/mobile/profile")}>
                    My Profile
                  </DropdownItem>
                  <DropdownItem as={Link} to="/edit-profile" onClick={() => handleNavigation("/edit-profile")}>
                    Edit Profile
                  </DropdownItem>
                  <DropdownItem as={Link} to="/ride-history/me" onClick={() => handleNavigation("/ride-history/me")}>
                    My Rides
                  </DropdownItem>
                  {isAdmin && (
                    <DropdownItem as={Link} to="/admin/rides" onClick={() => handleNavigation("/admin/rides")}>
                      Admin Panel
                    </DropdownItem>
                  )}
                  <DropdownItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownItem>
                </>
              ) : (
                <>
                  <DropdownItem as={Link} to="/login" onClick={() => handleNavigation("/login")}>
                    Sign In
                  </DropdownItem>
                  <DropdownItem as={Link} to="/signup" onClick={() => handleNavigation("/signup")}>
                    Sign Up
                  </DropdownItem>
                </>
              )}
            </DropdownMenu>
          </DropdownContainer>
        </RelativeContainer>
      )}

      <JoinRideModal
        isOpen={joinRideModalOpen}
        onClose={() => setJoinRideModalOpen(false)}
      />

      <AddRidesModal
        isOpen={addRidesModalOpen}
        onClose={() => setAddRidesModalOpen(false)}
      />
    </NavBarContainer>
  );
}

MobileNavBarCSS.propTypes = {
  currentUser: PropTypes.object,
  history: PropTypes.object.isRequired,
};

const MobileNavBarCSSTracked = withTracker(() => ({
  currentUser: Meteor.user(),
}))(MobileNavBarCSS);

export default withRouter(MobileNavBarCSSTracked);
