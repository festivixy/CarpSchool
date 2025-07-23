import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
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
  NavList,
  NavItem,
  NavLink,
  UserSection,
  UserAvatar,
  UserName,
  MobileMenuButton,
  MobileMenu,
  MobileNavItem,
  DropdownContainer,
  DropdownMenu,
  DropdownItem,
  Badge,
} from "../styles/Navbar";

/**
 * LiquidGlass Navbar component with glass morphism effect
 */
function LiquidGlassNavbar({
  logo = "/staticimages/Carpool.png",
  logoText = "Carpool",
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
  }, [isMobileMenuOpen, activeDropdown]);

  const toggleMobileMenu = (e) => {
    e.stopPropagation();
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleDropdown = (dropdown, e) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const handleNavClick = (item, e) => {
    if (onNavClick) {
      onNavClick(item, e);
    }
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);
  };

  const navigationItems = [
    { label: "My Rides", key: "rides", hasDropdown: true },
    { label: "Create Ride", key: "create", icon: "+" },
    { label: "Join Ride", key: "join", icon: "⚡" },
  ];

  const adminItems = [
    { label: "All Rides", key: "admin-rides" },
    { label: "Manage Users", key: "admin-users" },
    { label: "Analytics", key: "admin-analytics" },
  ];

  return (
    <NavbarContainer className={className} isScrolled={isScrolled} {...props}>
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
          <NavList>
            {user &&
              navigationItems.map((item) => (
                <NavItem key={item.key}>
                  {item.hasDropdown ? (
                    <DropdownContainer>
                      <NavLink
                        onClick={(e) => toggleDropdown("rides", e)}
                        isActive={activeDropdown === "rides"}
                      >
                        {item.icon && (
                          <span className="nav-icon">{item.icon}</span>
                        )}
                        {item.label}
                        <span className="dropdown-arrow">▾</span>
                      </NavLink>
                      <DropdownMenu isOpen={activeDropdown === "rides"}>
                        <DropdownItem
                          onClick={(e) => handleNavClick("all-rides", e)}
                        >
                          All Rides
                        </DropdownItem>
                        <DropdownItem
                          onClick={(e) => handleNavClick("my-rides", e)}
                        >
                          My Rides
                        </DropdownItem>
                      </DropdownMenu>
                    </DropdownContainer>
                  ) : (
                    <NavLink onClick={(e) => handleNavClick(item.key, e)}>
                      {item.icon && (
                        <span className="nav-icon">{item.icon}</span>
                      )}
                      {item.label}
                    </NavLink>
                  )}
                </NavItem>
              ))}

            {/* Admin Menu */}
            {isAdmin && (
              <NavItem>
                <DropdownContainer>
                  <NavLink
                    onClick={(e) => toggleDropdown("admin", e)}
                    isActive={activeDropdown === "admin"}
                  >
                    <span className="nav-icon">⚙️</span>
                    Admin
                    <span className="dropdown-arrow">▾</span>
                  </NavLink>
                  <DropdownMenu isOpen={activeDropdown === "admin"}>
                    {adminItems.map((adminItem) => (
                      <DropdownItem
                        key={adminItem.key}
                        onClick={(e) => handleNavClick(adminItem.key, e)}
                      >
                        {adminItem.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </DropdownContainer>
              </NavItem>
            )}
          </NavList>
        </NavSection>

        {/* User Section */}
        <UserSection>
          {user ? (
            <DropdownContainer>
              <div
                onClick={(e) => toggleDropdown("user", e)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                }}
              >
                <UserAvatar>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} />
                  ) : (
                    <span>{user.name?.charAt(0)?.toUpperCase() || "U"}</span>
                  )}
                  {notifications > 0 && <Badge>{notifications}</Badge>}
                </UserAvatar>
                <UserName>{user.name}</UserName>
                <span className="dropdown-arrow">▾</span>
              </div>
              <DropdownMenu isOpen={activeDropdown === "user"} align="right">
                <DropdownItem onClick={(e) => handleNavClick("profile", e)}>
                  👤 Profile
                </DropdownItem>
                <DropdownItem onClick={(e) => handleNavClick("settings", e)}>
                  ⚙️ Settings
                </DropdownItem>
                <DropdownItem
                  onClick={(e) => handleNavClick("notifications", e)}
                >
                  🔔 Notifications
                  {notifications > 0 && <Badge>{notifications}</Badge>}
                </DropdownItem>
                <hr
                  style={{
                    margin: "8px 0",
                    border: "none",
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                  }}
                />
                <DropdownItem onClick={onSignOut}>🚪 Sign Out</DropdownItem>
              </DropdownMenu>
            </DropdownContainer>
          ) : (
            <DropdownContainer>
              <NavLink onClick={(e) => toggleDropdown("auth", e)}>
                Login
                <span className="dropdown-arrow">▾</span>
              </NavLink>
              <DropdownMenu isOpen={activeDropdown === "auth"} align="right">
                <DropdownItem onClick={(e) => handleNavClick("signin", e)}>
                  🔑 Sign In
                </DropdownItem>
                <DropdownItem onClick={(e) => handleNavClick("signup", e)}>
                  ✨ Sign Up
                </DropdownItem>
              </DropdownMenu>
            </DropdownContainer>
          )}

          {/* Mobile Menu Button */}
          <MobileMenuButton
            onClick={toggleMobileMenu}
            isOpen={isMobileMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </MobileMenuButton>
        </UserSection>
      </NavbarContent>

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen}>
        {user &&
          navigationItems.map((item) => (
            <MobileNavItem
              key={item.key}
              onClick={(e) => handleNavClick(item.key, e)}
            >
              {item.icon && <span className="nav-icon">{item.icon}</span>}
              {item.label}
            </MobileNavItem>
          ))}

        {isAdmin && (
          <>
            <div
              style={{
                padding: "8px 20px",
                fontSize: "12px",
                color: "#999",
                textTransform: "uppercase",
              }}
            >
              Admin
            </div>
            {adminItems.map((adminItem) => (
              <MobileNavItem
                key={adminItem.key}
                onClick={(e) => handleNavClick(adminItem.key, e)}
              >
                {adminItem.label}
              </MobileNavItem>
            ))}
          </>
        )}

        {user && (
          <>
            <hr
              style={{
                margin: "16px 20px",
                border: "none",
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            />
            <MobileNavItem onClick={(e) => handleNavClick("profile", e)}>
              👤 Profile
            </MobileNavItem>
            <MobileNavItem onClick={(e) => handleNavClick("settings", e)}>
              ⚙️ Settings
            </MobileNavItem>
            <MobileNavItem onClick={onSignOut}>🚪 Sign Out</MobileNavItem>
          </>
        )}

        {!user && (
          <>
            <MobileNavItem onClick={(e) => handleNavClick("signin", e)}>
              🔑 Sign In
            </MobileNavItem>
            <MobileNavItem onClick={(e) => handleNavClick("signup", e)}>
              ✨ Sign Up
            </MobileNavItem>
          </>
        )}
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
