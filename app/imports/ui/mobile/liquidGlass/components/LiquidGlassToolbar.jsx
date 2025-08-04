import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useFloatingToolbar } from "../../hooks/useNativeBlur";
import LiquidGlassBlur from "./LiquidGlassBlur";
import { ToolbarContainer, ToolbarItem, ToolbarButton, ToolbarSpace } from "../styles/LiquidGlassToolbar";

/**
 * LiquidGlassToolbar Component
 *
 * Provides iOS 26 style floating toolbars with native support
 * Automatically falls back to CSS implementation on non-iOS platforms
 */
const LiquidGlassToolbar = ({
  items = [],
  position = "bottom",
  visible = true,
  floating = true,
  animated = true,
  blurStyle = "systemMaterial",
  onItemPress = null,
  className = "",
  style = {},
  safeArea = true,
  hideOnScroll = false,
  height = 60,
  ...props
}) => {
  const {
    isSupported: nativeSupported,
    isLoading,
    createToolbar,
    removeToolbar,
    setToolbarVisibility,
    addToolbarItem,
    setActionHandler,
  } = useFloatingToolbar();

  const [toolbarId, setToolbarId] = useState(null);
  const [useNative, setUseNative] = useState(false);
  const [toolbarItems, setToolbarItems] = useState(items);
  const containerRef = useRef(null);

  // Determine if we should use native toolbar
  useEffect(() => {
    if (!isLoading) {
      setUseNative(nativeSupported && window.cordova && window.Meteor?.isCordova);
    }
  }, [nativeSupported, isLoading]);

  // Set up action handler for native toolbar
  useEffect(() => {
    if (useNative && onItemPress) {
      setActionHandler((toolbarId, action, itemIndex) => {
        const item = toolbarItems[itemIndex];
        if (item && onItemPress) {
          onItemPress(item, itemIndex, action);
        }
      });
    }
  }, [useNative, onItemPress, toolbarItems, setActionHandler]);

  // Create native toolbar when component mounts
  useEffect(() => {
    if (useNative && !toolbarId) {
      createNativeToolbar();
    }

    return () => {
      if (toolbarId) {
        removeToolbar(toolbarId).catch(console.error);
      }
    };
  }, [useNative]);

  const createNativeToolbar = useCallback(async () => {
    if (!useNative) return;

    try {
      const toolbarOptions = {
        position: position,
        items: toolbarItems.map(item => ({
          type: item.type || "button",
          title: item.title,
          icon: item.icon,
          action: item.action || item.title,
        })),
        style: {
          blurStyle: blurStyle,
          cornerRadius: floating ? 20 : 0,
          margin: floating ? 16 : 0,
          height: height,
        },
      };

      const id = await createToolbar(toolbarOptions);
      setToolbarId(id);
    } catch (error) {
      console.error("[LiquidGlassToolbar] Failed to create native toolbar:", error);
      setUseNative(false);
    }
  }, [useNative, position, toolbarItems, blurStyle, floating, height, createToolbar]);

  // Handle visibility changes
  useEffect(() => {
    if (useNative && toolbarId) {
      setToolbarVisibility(toolbarId, visible, animated).catch(console.error);
    }
  }, [visible, toolbarId, useNative, animated, setToolbarVisibility]);

  // Update items when they change
  useEffect(() => {
    setToolbarItems(items);
  }, [items]);

  const handleItemPress = useCallback((item, index, event) => {
    if (onItemPress) {
      onItemPress(item, index, event);
    }
  }, [onItemPress]);

  if (isLoading) {
    return null; // Don't render anything while loading
  }

  if (useNative) {
    // Native toolbar handles rendering - return invisible placeholder for layout
    return (
      <div
        ref={containerRef}
        style={{
          height: floating ? 0 : height,
          paddingBottom: safeArea ? "env(safe-area-inset-bottom)" : 0,
        }}
      />
    );
  }

  // CSS fallback implementation
  return (
    <LiquidGlassBlur
      blurStyle={blurStyle}
      floating={floating}
      position="fixed"
      animated={animated}
      className={className}
      style={style}
    >
      <ToolbarContainer
        ref={containerRef}
        position={position}
        floating={floating}
        visible={visible}
        animated={animated}
        height={height}
        safeArea={safeArea}
        {...props}
      >
        {toolbarItems.map((item, index) => (
          <ToolbarItem key={index} type={item.type}>
            {item.type === "space" && <ToolbarSpace size={item.size} />}
            {item.type === "flexibleSpace" && <ToolbarSpace flexible />}
            {(item.type === "button" || !item.type) && (
              <ToolbarButton
                onClick={(e) => handleItemPress(item, index, e)}
                disabled={item.disabled}
                primary={item.primary}
                icon={item.icon}
                title={item.title}
              >
                {item.icon && (
                  <span className="toolbar-icon" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                {item.title && (
                  <span className="toolbar-title">
                    {item.title}
                  </span>
                )}
              </ToolbarButton>
            )}
          </ToolbarItem>
        ))}
      </ToolbarContainer>
    </LiquidGlassBlur>
  );
};

LiquidGlassToolbar.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.oneOf(["button", "space", "flexibleSpace"]),
    title: PropTypes.string,
    icon: PropTypes.string,
    action: PropTypes.string,
    disabled: PropTypes.bool,
    primary: PropTypes.bool,
    size: PropTypes.number, // for space type
  })),
  position: PropTypes.oneOf(["top", "bottom", "floating"]),
  visible: PropTypes.bool,
  floating: PropTypes.bool,
  animated: PropTypes.bool,
  blurStyle: PropTypes.oneOf([
    "systemMaterial",
    "systemThinMaterial",
    "systemThickMaterial",
    "systemChromeMaterial",
    "systemUltraThinMaterial",
    "light",
    "dark",
    "extraLight",
  ]),
  onItemPress: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  safeArea: PropTypes.bool,
  hideOnScroll: PropTypes.bool,
  height: PropTypes.number,
};

export default LiquidGlassToolbar;
