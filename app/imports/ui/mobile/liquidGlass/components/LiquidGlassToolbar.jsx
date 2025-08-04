import React, { useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { useFloatingToolbar } from "../../hooks/useNativeBlur";
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
    console.log("[LiquidGlassToolbar] 🔍 Checking native support:", {
      isLoading,
      nativeSupported,
      hasCordova: !!window.cordova,
      isMeteorCordova: !!window.Meteor?.isCordova,
      floatingToolbarPlugin: !!window.cordova?.plugins?.floatingToolbar,
    });

    if (!isLoading) {
      const shouldUseNative = nativeSupported && window.cordova && window.Meteor?.isCordova;
      console.log("[LiquidGlassToolbar] 🎯 Native decision:", {
        shouldUseNative,
        nativeSupported,
        cordova: !!window.cordova,
        meteorcordova: !!window.Meteor?.isCordova,
      });
      setUseNative(shouldUseNative);
    }
  }, [nativeSupported, isLoading]);

  // Set up action handler for native toolbar
  useEffect(() => {
    console.log("[LiquidGlassToolbar] 🎛️ Setting up action handler:", {
      useNative,
      hasOnItemPress: !!onItemPress,
      toolbarItemsCount: toolbarItems.length,
    });

    if (useNative && onItemPress) {
      console.log("[LiquidGlassToolbar] ✅ Registering native action handler");
      setActionHandler((toolbarId, action, itemIndex) => {
        console.log("[LiquidGlassToolbar] 🔥 Native action triggered:", {
          toolbarId,
          action,
          itemIndex,
          item: toolbarItems[itemIndex],
        });
        const item = toolbarItems[itemIndex];
        if (item && onItemPress) {
          onItemPress(item, itemIndex, action);
        }
      });
    }
  }, [useNative, onItemPress, toolbarItems, setActionHandler]);

  // Create native toolbar when component mounts
  useEffect(() => {
    console.log("[LiquidGlassToolbar] 🏗️ Toolbar creation effect:", {
      useNative,
      toolbarId,
      shouldCreate: useNative && !toolbarId,
    });

    if (useNative && !toolbarId) {
      console.log("[LiquidGlassToolbar] 🚀 Starting native toolbar creation...");
      createNativeToolbar();
    }

    return () => {
      if (toolbarId) {
        console.log("[LiquidGlassToolbar] 🧹 Cleaning up toolbar:", toolbarId);
        removeToolbar(toolbarId).catch((error) => {
          console.error("[LiquidGlassToolbar] ❌ Cleanup error:", error);
        });
      }
    };
  }, [useNative, createNativeToolbar, removeToolbar]);

  const createNativeToolbar = useCallback(async () => {
    if (!useNative) return;

    try {
      // Configure for iOS 26 Liquid Glass look
      const toolbarOptions = {
        position: position === "floating" ? "bottom" : position,
        items: toolbarItems
          .filter(item => item.type !== "flexibleSpace") // Filter out flexibleSpace for now
          .map(item => ({
            type: item.type || "button",
            title: item.title,
            icon: item.icon,
            action: item.action || item.title,
            primary: item.primary || false,
          })),
        style: {
          blurStyle: blurStyle === "systemMaterial" ? "systemMaterial" : blurStyle,
          cornerRadius: floating ? 24 : 8, // iOS 26 uses larger radius
          margin: floating ? 16 : 8,
          height: height,
          liquidGlass: true, // Enable iOS 26 liquid glass effect
        },
      };

      console.log("[LiquidGlassToolbar] Creating native toolbar with options:", toolbarOptions);
      const id = await createToolbar(toolbarOptions);
      setToolbarId(id);
      console.log("[LiquidGlassToolbar] Native toolbar created with ID:", id);
    } catch (error) {
      console.error("[LiquidGlassToolbar] Failed to create native toolbar:", error);
      setUseNative(false);
    }
  }, [useNative, position, toolbarItems, blurStyle, floating, height, createToolbar]);

  // Handle visibility changes
  useEffect(() => {
    console.log("[LiquidGlassToolbar] 👁️ Visibility change:", {
      useNative,
      toolbarId,
      visible,
      animated,
      willUpdate: useNative && toolbarId,
    });

    if (useNative && toolbarId) {
      console.log("[LiquidGlassToolbar] 🔄 Updating native toolbar visibility:", { visible, animated });
      setToolbarVisibility(toolbarId, visible, animated).catch((error) => {
        console.error("[LiquidGlassToolbar] ❌ Visibility update error:", error);
      });
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

  console.log("[LiquidGlassToolbar] 🎨 Render decision:", {
    isLoading,
    useNative,
    toolbarId,
    hasItems: toolbarItems.length > 0,
  });

  if (isLoading) {
    console.log("[LiquidGlassToolbar] ⏳ Rendering loading state");
    return null; // Don't render anything while loading
  }

  if (useNative) {
    console.log("[LiquidGlassToolbar] 🍎 Rendering native placeholder", {
      toolbarId,
      height: floating ? 0 : height,
    });
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

  console.log("[LiquidGlassToolbar] 🎨 Rendering CSS fallback toolbar", {
    itemCount: toolbarItems.length,
    position,
    floating,
    visible,
  });

  // CSS fallback implementation with iOS 26 styling
  return (
    <ToolbarContainer
      ref={containerRef}
      position={position}
      floating={floating}
      visible={visible}
      animated={animated}
      height={height}
      safeArea={safeArea}
      blurStyle={blurStyle}
      className={className}
      style={style}
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
