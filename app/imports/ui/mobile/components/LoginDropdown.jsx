import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
 * Animated dropdown component for login/signup actions
 * Uses framer-motion for smooth animations
 */
function LoginDropdown({ history }) {
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

  const menuItems = [
    {
      id: 1,
      icon: "🚀",
      text: "Create Account",
      path: "/signup",
      description: "Get started with CarpSchool",
    },
    {
      id: 2,
      icon: "🔐",
      text: "Sign In",
      path: "/login",
      description: "Access your account",
    },
  ];

  return (
    <DropdownContainer ref={dropdownRef}>
      <DropdownButton onClick={handleToggle}>
        Get Started
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
                  <DropdownItemIcon>{item.icon}</DropdownItemIcon>
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
};

export default withRouter(LoginDropdown);
