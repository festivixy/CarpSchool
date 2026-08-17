import React from "react";
import PropTypes from "prop-types";
import { withRouter, Link } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { withTracker } from "meteor/react-meteor-data";
import JoinRideModal from "../../components/JoinRideModal";
import AddRidesModal from "../../components/AddRides";
import Icon from "../../components/Icon";
import {
  NavBarContainer,
  TabBarInner,
  TabsContainer,
  TabBarItem,
  TabWithBadge,
  TabPrimary,
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
function MobileNavBarCSS({ currentUser, history, location }) {
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

  const isActive = (path) => location?.pathname?.startsWith(path);

  return (
    <NavBarContainer className="liquid-glass-mobile-navbar">
      <TabBarInner>
        <TabsContainer>
          {isSignedIn && (
            <TabBarItem
              as={Link}
              to="/my-rides"
              onClick={closeAllDropdowns}
              $active={isActive("/my-rides")}
            >
              <Icon name="car" size={20} />
              <TabLabel>Rides</TabLabel>
            </TabBarItem>
          )}

          {isSignedIn && (
            <TabBarItem
              as={Link}
              to="/places"
              onClick={closeAllDropdowns}
              $active={isActive("/places")}
            >
              <Icon name="pin" size={20} />
              <TabLabel>Places</TabLabel>
            </TabBarItem>
          )}

          {isSignedIn && (
            <TabPrimary onClick={() => { setJoinRideModalOpen(true); closeAllDropdowns(); }}>
              <Icon name="plus" size={20} />
              <TabLabel>Join</TabLabel>
            </TabPrimary>
          )}

          {isSignedIn && (
            <TabBarItem
              as={Link}
              to="/chat"
              onClick={closeAllDropdowns}
              $active={isActive("/chat")}
            >
              <Icon name="chat" size={20} />
              <TabLabel>Chat</TabLabel>
            </TabBarItem>
          )}

          <TabWithBadge
            onClick={() => { setActiveDropdown(activeDropdown === "more" ? null : "more"); }}
            $active={activeDropdown === "more"}
          >
            <Icon name="grid" size={20} />
            <TabLabel>More</TabLabel>
          </TabWithBadge>
        </TabsContainer>
      </TabBarInner>

      {activeDropdown === "more" && (
        <RelativeContainer>
          <DropdownContainer>
            <DropdownMenu $isOpen>
              {isSignedIn ? (
                <>
                  <DropdownItem as={Link} to="/mobile/profile" onClick={() => handleNavigation("/mobile/profile")}>
                    <Icon name="user" size={16} />
                    My Profile
                  </DropdownItem>
                  <DropdownItem as={Link} to="/edit-profile" onClick={() => handleNavigation("/edit-profile")}>
                    <Icon name="edit" size={16} />
                    Edit Profile
                  </DropdownItem>
                  <DropdownItem as={Link} to="/ride-history/me" onClick={() => handleNavigation("/ride-history/me")}>
                    <Icon name="clock" size={16} />
                    My Rides
                  </DropdownItem>
                  {isAdmin && (
                    <DropdownItem as={Link} to="/admin/rides" onClick={() => handleNavigation("/admin/rides")}>
                      <Icon name="settings" size={16} />
                      Admin Panel
                    </DropdownItem>
                  )}
                  <DropdownItem onClick={handleSignOut}>
                    <Icon name="arrow" size={16} />
                    Sign Out
                  </DropdownItem>
                </>
              ) : (
                <>
                  <DropdownItem as={Link} to="/login" onClick={() => handleNavigation("/login")}>
                    <Icon name="user" size={16} />
                    Sign In
                  </DropdownItem>
                  <DropdownItem as={Link} to="/signup" onClick={() => handleNavigation("/signup")}>
                    <Icon name="plus" size={16} />
                    Sign Up
                  </DropdownItem>
                </>
              )}
            </DropdownMenu>
          </DropdownContainer>
        </RelativeContainer>
      )}

      <JoinRideModal
        open={joinRideModalOpen}
        onClose={() => setJoinRideModalOpen(false)}
      />

      <AddRidesModal
        open={addRidesModalOpen}
        onClose={() => setAddRidesModalOpen(false)}
      />
    </NavBarContainer>
  );
}

MobileNavBarCSS.propTypes = {
  currentUser: PropTypes.object,
  history: PropTypes.object.isRequired,
  location: PropTypes.object,
};

const MobileNavBarCSSTracked = withTracker(() => ({
  currentUser: Meteor.user(),
}))(MobileNavBarCSS);

export default withRouter(MobileNavBarCSSTracked);
