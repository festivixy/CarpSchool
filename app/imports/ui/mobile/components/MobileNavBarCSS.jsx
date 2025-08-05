import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  NavBarContainer,
  NavBarItem,
  NavBarButton,
  NavBarIcon,
  NavBarLabel,
} from "../styles/MobileNavBarCSS";

/**
 * MobileNavBarCSS Component
 *
 * Provides iOS 26 style liquid glass navigation bar using CSS implementation
 * Uses CSS backdrop-filter for liquid glass effect on iOS 18 and below
 * Always positioned at bottom for primary navigation
 */
const MobileNavBarCSS = ({
  items = [],
  visible = true,
  animated = true,
  blurStyle = "systemMaterial",
  onItemPress = null,
  className = "",
  style = {},
  safeArea = true,
  activeIndex = 0,
  ...props
}) => {
  const [currentActiveIndex, setCurrentActiveIndex] = useState(activeIndex);

  // Update active index when prop changes
  useEffect(() => {
    setCurrentActiveIndex(activeIndex);
  }, [activeIndex]);

  // Check iOS version - only iOS 26+ supports native liquid glass
  const getIOSVersion = () => {
    if (!window.device?.version) return 0;
    return parseInt(window.device.version.split(".")[0]);
  };

  const iosVersion = getIOSVersion();
  const supportsNativeLiquidGlass = iosVersion >= 26;

  console.log("[MobileNavBarCSS] 📱 Environment check:", {
    iosVersion,
    supportsNativeLiquidGlass,
    forceCSSMode: !supportsNativeLiquidGlass,
    itemCount: items.length,
    activeIndex: currentActiveIndex,
  });

  const handleItemPress = (item, index) => {
    console.log("[MobileNavBarCSS] 🔥 Item pressed:", {
      item,
      index,
      wasActive: index === currentActiveIndex,
    });

    setCurrentActiveIndex(index);

    if (onItemPress) {
      onItemPress(item, index);
    }
  };

  if (!visible) {
    return null;
  }

  console.log("[MobileNavBarCSS] 🎨 Rendering CSS navbar:", {
    itemCount: items.length,
    activeIndex: currentActiveIndex,
    blurStyle,
  });

  return (
    <NavBarContainer
      className={className}
      style={style}
      blurStyle={blurStyle}
      safeArea={safeArea}
      animated={animated}
      {...props}
    >
      {items.map((item, index) => {
        const isActive = index === currentActiveIndex;

        return (
          <NavBarItem
            key={item.id || index}
            isActive={isActive}
            onClick={() => handleItemPress(item, index)}
          >
            <NavBarButton isActive={isActive}>
              {item.icon && (
                <NavBarIcon isActive={isActive}>
                  {typeof item.icon === "string" ? (
                    <img src={item.icon} alt={item.label || "Navigation"} />
                  ) : (
                    item.icon
                  )}
                </NavBarIcon>
              )}
              {item.label && (
                <NavBarLabel isActive={isActive}>
                  {item.label}
                </NavBarLabel>
              )}
            </NavBarButton>
          </NavBarItem>
        );
      })}
    </NavBarContainer>
  );
};

MobileNavBarCSS.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
      icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      action: PropTypes.string,
      disabled: PropTypes.bool,
    }),
  ),
  visible: PropTypes.bool,
  animated: PropTypes.bool,
  blurStyle: PropTypes.oneOf([
    "systemMaterial",
    "systemThinMaterial",
    "systemUltraThinMaterial",
    "systemThickMaterial",
    "light",
    "dark",
  ]),
  onItemPress: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  safeArea: PropTypes.bool,
  activeIndex: PropTypes.number,
};

export default MobileNavBarCSS;
