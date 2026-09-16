import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import Icon from "../../components/Icon";
import {
  DropdownContainer,
  DropdownButton,
  DropdownArrow,
  DropdownMenu,
  DropdownItem,
  DropdownItemIcon,
  DropdownItemText,
} from "../styles/LoginDropdown";

/**
 * Animated call-to-action dropdown on the landing page.
 *
 * Signed-out visitors get sign-up / sign-in. Signed-in users used to get the
 * same two options, which offered an account they already had; they now get
 * the actions that actually move them into the app.
 */
const SIGNED_OUT_ITEMS = [
  { id: "signup", icon: "plus", text: "Create Account", path: "/signup" },
  { id: "signin", icon: "user", text: "Sign In", path: "/login" },
];

const SIGNED_IN_ITEMS = [
  { id: "find", icon: "search", text: "Find a ride", path: "/find" },
  { id: "rides", icon: "car", text: "My rides", path: "/my-rides" },
];

function LoginDropdown({ history, primary }) {
  const { isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigate = (path) => {
    setIsOpen(false);
    history.push(path);
  };

  const menuItems = isSignedIn ? SIGNED_IN_ITEMS : SIGNED_OUT_ITEMS;

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownButton $primary={primary} onClick={handleToggle}>
        {isSignedIn ? "Open CarpSchool" : "Get Started"}
        <DropdownArrow $isOpen={isOpen}>▼</DropdownArrow>
      </DropdownButton>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{
              duration: 0.15,
              ease: "easeOut",
            }}
            style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, zIndex: 1000 }}
          >
            <DropdownMenu>
              {menuItems.map((item) => (
                <DropdownItem
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                >
                  <DropdownItemIcon><Icon name={item.icon} size={16} /></DropdownItemIcon>
                  <DropdownItemText>{item.text}</DropdownItemText>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </motion.div>
        )}
      </AnimatePresence>
    </DropdownContainer>
  );
}

LoginDropdown.propTypes = {
  history: PropTypes.object.isRequired,
  primary: PropTypes.bool,
};

LoginDropdown.defaultProps = {
  primary: false,
};

export default withRouter(LoginDropdown);
