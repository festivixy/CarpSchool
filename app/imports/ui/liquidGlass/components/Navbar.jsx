import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import LiquidGlassButton from "./Button";
import LiquidGlassDropdown from "./Dropdown";
import {
  NavbarContainer,
  NavbarContent,
  NavbarBackground,
  BlurLayer,
  GlassLayer,
  LogoSection,
  LogoImage,
  LogoText,
  NavSection,
  UserSection,
  UserAvatar,
  UserName,
  MobileMenuButton,
  MobileMenu,
  ActionGroup,
} from "../styles/Navbar";

/**
 * LiquidGlass Navbar component with glass morphism effect
 */
function LiquidGlassNavbar({
  logo = "/staticimages/carp.school.png",
  logoText = "CarpSchool",
  user = null,
  isAdmin = false,
  notifications = 0,
  onLogoClick,
  onNavClick,
  onUserClick,
  onSignOut,
  className,
  ...props
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsMobileMenuOpen(false);
      setActiveDropdown(null);
    };

    if (isMobileMenuOpen || activeDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }

    return undefined; // No cleanup needed when menu is closed
  }, [isMobileMenuOpen, activeDropdown]);

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // toggleDropdown removed as unused

  const handleNavClick = (item, e) => {
    if (onNavClick) {
      onNavClick(item, e);
    }
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  // navigationItems removed as unused

  const adminItems = [
    { label: "All Rides", key: "admin-rides" },
    { label: "Manage Users", key: "admin-users" },
    { label: "Analytics", key: "admin-analytics" },
  ];

  return (
    <NavbarContainer className={className} $isScrolled={isScrolled} {...props}>
      <NavbarBackground>
        <BlurLayer />
        <GlassLayer />
      </NavbarBackground>

      <NavbarContent>
        {/* Logo Section */}
        <LogoSection onClick={onLogoClick}>
          {logo && <LogoImage src={logo} alt={logoText} />}
          <LogoText>{logoText}</LogoText>
        </LogoSection>

        {/* Desktop Navigation */}
        <NavSection>
          <ActionGroup>
            {user && (
              <>
                <LiquidGlassButton
                  label="My Rides"
                  onClick={() => handleNavClick("my-rides")}
                />

                <LiquidGlassButton
                  label="Create Ride"
                  onClick={() => handleNavClick("create")}
                />

                <LiquidGlassButton
                  label="Join Ride"
                  onClick={() => handleNavClick("join")}
                />
              </>
            )}

            {/* Admin Menu */}
            {isAdmin && (
              <LiquidGlassDropdown
                options={adminItems.map((item) => ({
                  value: item.key,
                  label: item.label,
                  icon: "⚙️",
                }))}
                placeholder="Admin"
                onChange={(value) => handleNavClick(value)}
                width="140px"
              />
            )}
          </ActionGroup>
        </NavSection>

        {/* User Section */}
        <UserSection>
          {/* Desktop User Menu - Hidden on Mobile */}
          <div className="desktop-user-menu">
            {user ? (
              <>
                <UserAvatar>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
                  )}
                </UserAvatar>
                <UserName>{user.name}</UserName>

                <LiquidGlassDropdown
                  options={[
                    { value: "profile", label: "Profile", icon: "👤" },
                    { value: "settings", label: "Settings", icon: "⚙️" },
                    {
                      value: "notifications",
                      label: `Notifications ${notifications > 0 ? `(${notifications})` : ""}`,
                      icon: "🔔",
                    },
                    { value: "signout", label: "Sign Out", icon: "🚪" },
                  ]}
                  placeholder="Menu"
                  onChange={(value) => {
                    if (value === "signout") {
                      onSignOut?.(); // eslint-disable-line no-unused-expressions
                    } else {
                      handleNavClick(value);
                    }
                  }}
                  width="100px"
                />
              </>
            ) : (
              <LiquidGlassDropdown
                options={[
                  { value: "signin", label: "Sign In", icon: "🔑" },
                  { value: "signup", label: "Sign Up", icon: "✨" },
                ]}
                placeholder="Login"
                onChange={(value) => handleNavClick(value)}
                width="100px"
              />
            )}
          </div>

          {/* Mobile Menu Button */}
          <MobileMenuButton
            onClick={toggleMobileMenu}
            $isOpen={isMobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </MobileMenuButton>
        </UserSection>
      </NavbarContent>

      {/* Mobile Menu */}
      <MobileMenu $isOpen={isMobileMenuOpen}>
        <div
          style={{
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {user && (
            <>
              <LiquidGlassButton
                label="📱 All Rides"
                onClick={() => handleNavClick("all-rides")}
                style={{ width: "100%" }}
              />
              <LiquidGlassButton
                label="👤 My Rides"
                onClick={() => handleNavClick("my-rides")}
                style={{ width: "100%" }}
              />
              <LiquidGlassButton
                label="➕ Create Ride"
                onClick={() => handleNavClick("create")}
                style={{ width: "100%" }}
              />
              <LiquidGlassButton
                label="⚡ Join Ride"
                onClick={() => handleNavClick("join")}
                style={{ width: "100%" }}
              />
            </>
          )}

          {isAdmin && (
            <>
              <div
                style={{
                  padding: "8px 0",
                  fontSize: "12px",
                  color: "#999",
                  textTransform: "uppercase",
                }}
              >
                Admin
              </div>
              {adminItems.map((adminItem) => (
                <LiquidGlassButton
                  key={adminItem.key}
                  label={`⚙️ ${adminItem.label}`}
                  onClick={() => handleNavClick(adminItem.key)}
                  style={{ width: "100%" }}
                />
              ))}
            </>
          )}

          {user && (
            <>
              <hr
                style={{
                  margin: "16px 0",
                  border: "none",
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                }}
              />
              <LiquidGlassButton
                label="👤 Profile"
                onClick={() => handleNavClick("profile")}
                style={{ width: "100%" }}
              />
              <LiquidGlassButton
                label="⚙️ Settings"
                onClick={() => handleNavClick("settings")}
                style={{ width: "100%" }}
              />
              <LiquidGlassButton
                label="🚪 Sign Out"
                onClick={onSignOut}
                style={{ width: "100%" }}
              />
            </>
          )}

          {!user && (
            <>
              <LiquidGlassButton
                label="🔑 Sign In"
                onClick={() => handleNavClick("signin")}
                style={{ width: "100%" }}
              />
              <LiquidGlassButton
                label="✨ Sign Up"
                onClick={() => handleNavClick("signup")}
                style={{ width: "100%" }}
              />
            </>
          )}
        </div>
      </MobileMenu>
    </NavbarContainer>
  );
}

LiquidGlassNavbar.propTypes = {
  logo: PropTypes.string,
  logoText: PropTypes.string,
  user: PropTypes.shape({
    name: PropTypes.string,
    avatar: PropTypes.string,
  }),
  isAdmin: PropTypes.bool,
  notifications: PropTypes.number,
  onLogoClick: PropTypes.func,
  onNavClick: PropTypes.func,
  onUserClick: PropTypes.func,
  onSignOut: PropTypes.func,
  className: PropTypes.string,
};

export default LiquidGlassNavbar;
