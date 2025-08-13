import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import LiquidGlassBlur from "../../liquidGlass/components/LiquidGlassBlur";
import MobileNavBarCSS from "../../mobile/components/MobileNavBarCSS";
import NativeNavBar from "../../mobile/ios/components/NativeNavBar";
import { useNativeBlur } from "../../mobile/hooks/useNativeBlur";
import useNativeNavBar from "../../mobile/ios/hooks/useNativeNavBar";
import {
  DemoContainer,
  BackgroundContent,
  ContentGrid,
  ContentCard,
  CardTitle,
  CardText,
  StatusBar,
  StatusItem,
  ControlsContainer,
  ControlsContent,
  ControlGroup,
  ControlLabel,
  StyleSelector,
  StyleButton,
  IntensitySlider,
  ToolbarToggle,
  LoadingContainer,
  LoadingText,
  FlexContainer,
  BlurContainer,
  InfoText,
  DemoGrid,
  DemoPanel,
  PanelContent,
  PanelTitle,
  PanelSubtext,
  FlexContainer,
  BlurContainer,
  InfoText,
  DemoGrid,
  DemoPanel,
  PanelContent,
  PanelTitle,
  PanelSubtext,
} from "../styles/NativeBlurDemo";

/**
 * Demo component showcasing iOS 26 native blur and navbar features
 * Demonstrates automatic fallback to CSS when native features are unavailable
 */
const NativeBlurDemo = (props) => {
  const [selectedBlur, setSelectedBlur] = useState("systemMaterial");
  const [showNavBar, setShowNavBar] = useState(true);
  const [blurIntensity, setBlurIntensity] = useState(1.0);
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(true);
  const [activeNavIndex, setActiveNavIndex] = useState(0);
  const logTextAreaRef = useRef(null);

  const {
    isSupported: blurSupported,
    isLoading: blurLoading,
    getAvailableStyles,
  } = useNativeBlur();

  const {
    isSupported: nativeNavBarSupported,
    isLoading: nativeNavBarLoading,
    iosVersion,
  } = useNativeNavBar();

  const [availableStyles, setAvailableStyles] = useState([]);

  useEffect(() => {
    if (blurSupported) {
      getAvailableStyles().then(setAvailableStyles).catch(() => {
        setAvailableStyles(["systemMaterial", "light", "dark"]);
      });
    } else {
      setAvailableStyles(["light", "dark", "tinted"]);
    }
  }, [blurSupported, getAvailableStyles]);

  // Capture console logs with debouncing to prevent infinite loops
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    let pendingLogs = [];
    let updateTimeout;

    const batchUpdateLogs = () => {
      if (pendingLogs.length > 0) {
        setLogs(prev => [...prev.slice(-50), ...pendingLogs].slice(-50));
        pendingLogs = [];
      }
    };

    const addLog = (type, args) => {
      const timestamp = new Date().toLocaleTimeString();
      const message = args.map(arg => {
        if (typeof arg === "object") {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      }).join(" ");

      // Only log if it contains our keywords
      if (message.includes("LiquidGlass") || message.includes("NavBarCSS") ||
          message.includes("NativeNavBar") || message.includes("useNativeNavBar")) {
        pendingLogs.push({
          type,
          timestamp,
          message,
          id: Date.now() + Math.random(),
        });

        // Debounce updates to prevent infinite loops
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(batchUpdateLogs, 50);
      }
    };

    console.log = (...args) => {
      originalLog(...args);
      if (args.some(arg => String(arg).includes("LiquidGlass") || String(arg).includes("NavBarCSS") ||
          String(arg).includes("NativeNavBar") || String(arg).includes("useNativeNavBar"))) {
        addLog("log", args);
      }
    };

    console.error = (...args) => {
      originalError(...args);
      if (args.some(arg => String(arg).includes("LiquidGlass") || String(arg).includes("NavBarCSS") ||
          String(arg).includes("NativeNavBar") || String(arg).includes("useNativeNavBar"))) {
        addLog("error", args);
      }
    };

    console.warn = (...args) => {
      originalWarn(...args);
      if (args.some(arg => String(arg).includes("LiquidGlass") || String(arg).includes("NavBarCSS") ||
          String(arg).includes("NativeNavBar") || String(arg).includes("useNativeNavBar"))) {
        addLog("warn", args);
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      clearTimeout(updateTimeout);
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logTextAreaRef.current) {
      logTextAreaRef.current.scrollTop = logTextAreaRef.current.scrollHeight;
    }
  }, [logs]);

  const navBarItems = [
    {
      id: "home",
      label: "My Rides",
      icon: "🏠",
      action: "home",
    },
    {
      id: "join",
      label: "Join Ride",
      icon: "🔍",
      action: "join",
    },
    {
      id: "create",
      label: "Create",
      icon: "💬",
      action: "create",
    },
    {
      id: "messages",
      label: "Messages",
      icon: "💬",
      action: "messages",
    },
    {
      id: "profile",
      label: "Profile",
      icon: "👤",
      action: "profile",
    },
  ];

  const handleNavBarAction = (item, index) => {
    console.log("NavBar action:", { item, index });
    setActiveNavIndex(index);

    switch (item.action) {
      case "home":
        props.history.push("/myRides");
        break;
      case "join":
        props.history.push("/imRiding");
        break;
      case "create":
        props.history.push("/imDriving");
        break;
      case "messages":
        props.history.push("/chat");
        break;
      case "profile":
        // Profile dropdown is handled automatically by NativeNavBar
        console.log("Profile dropdown should open");
        break;
      default:
        console.warn(`Unknown navbar action: ${item.action}`);
    }
  };

  const handleBlurReady = ({ blurId, useNative }) => {
    console.log("Blur ready:", { blurId, useNative });
  };

  // Log initial environment
  useEffect(() => {
    console.log("[NativeBlurDemo] 🚀 Component mounted - Environment check:", {
      platform: window.cordova ? "Cordova" : "Web",
      isCordova: !!window.cordova,
      isMeteorCordova: !!window.Meteor?.isCordova,
      hasLiquidBlurPlugin: !!window.cordova?.plugins?.liquidBlur,
      hasNativeNavBarPlugin: !!window.cordova?.plugins?.NativeNavBar,
      userAgent: navigator.userAgent,
      iosVersion: window.device?.version || "unknown",
      nativeNavBarSupported,
      nativeNavBarLoading,
    });
  }, [nativeNavBarSupported, nativeNavBarLoading]);

  if (blurLoading || nativeNavBarLoading) {
    return (
      <LoadingContainer>
        <LoadingText>Initializing Native Features...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <DemoContainer>
      <BackgroundContent>
        <ContentGrid>
          {Array.from({ length: 20 }, (_, i) => (
            <ContentCard key={i}>
              <CardTitle>Card {i + 1}</CardTitle>
              <CardText>
                This is sample content to demonstrate the blur effect.
                Native iOS 26 blur creates a beautiful frosted glass appearance.
              </CardText>
            </ContentCard>
          ))}
        </ContentGrid>
      </BackgroundContent>

      <StatusBar>
        <StatusItem>
          iOS Version: {iosVersion || "Unknown"}
        </StatusItem>
        <StatusItem>
          Native iOS NavBar: {nativeNavBarSupported ? "✅ Available" : "❌ Not Available"}
        </StatusItem>
        <StatusItem>
          CSS NavBar: ✅ Always Available (Fallback)
        </StatusItem>
        <StatusItem>
          Blur Effects: CSS backdrop-filter only
        </StatusItem>
      </StatusBar>

      <ControlsContainer>
        <ControlsContent>
          <ControlGroup>
            <ControlLabel>Blur Style</ControlLabel>
            <StyleSelector>
              {availableStyles.map(style => (
                <StyleButton
                  key={style}
                  active={selectedBlur === style}
                  onClick={() => setSelectedBlur(style)}
                >
                  {style}
                </StyleButton>
              ))}
            </StyleSelector>
          </ControlGroup>

          <ControlGroup>
            <ControlLabel>Intensity: {blurIntensity.toFixed(1)}</ControlLabel>
            <IntensitySlider
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={blurIntensity}
              onChange={(e) => setBlurIntensity(parseFloat(e.target.value))}
            />
          </ControlGroup>

          <ControlGroup>
            <ToolbarToggle
              active={showNavBar}
              onClick={() => setShowNavBar(!showNavBar)}
            >
              {showNavBar ? "Hide NavBar" : "Show NavBar"}
            </ToolbarToggle>
          </ControlGroup>

          <ControlGroup>
            <ControlLabel>Debug Logs</ControlLabel>
            <FlexContainer>
              <StyleButton
                active={showLogs}
                onClick={() => setShowLogs(!showLogs)}
              >
                {showLogs ? "Hide Logs" : "Show Logs"}
              </StyleButton>
              <StyleButton
                onClick={() => setLogs([])}
              >
                Clear Logs
              </StyleButton>
            </div>

            {showLogs && (
              <div style={{
                width: "100%",
                height: "300px",
                border: "1px solid rgba(0,0,0,0.2)",
                borderRadius: "8px",
                overflow: "hidden",
                background: "rgba(0,0,0,0.05)",
              }}>
                <textarea
                  ref={logTextAreaRef}
                  readOnly
                  value={logs.map(log => `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`).join("\n")}
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    background: "transparent",
                    fontFamily: "Monaco, Consolas, monospace",
                    fontSize: "11px",
                    padding: "8px",
                    resize: "none",
                    color: "#333",
                  }}
                  placeholder="Debug logs will appear here..."
                />
              </div>
            )}

            <InfoText>
              Total logs: {logs.length} | NavBar: CSS Liquid Glass
            </InfoText>
          </ControlGroup>

          <ControlGroup>
            <ControlLabel>CSS Blur Demo Areas (Native Blur Disabled)</ControlLabel>
            <DemoGrid>
              <DemoPanel style={{
                background: `rgba(255, 255, 255, ${blurIntensity * 0.7})`,
                backdropFilter: `blur(${blurIntensity * 20}px)`,
              }}>
                <PanelContent>
                  <PanelTitle>CSS Blur Panel 1</PanelTitle>
                  <PanelSubtext>
                    CSS backdrop-filter blur
                  </PanelSubtext>
                </PanelContent>
              </DemoPanel>

              <DemoPanel style={{
                background: `rgba(255, 255, 255, ${blurIntensity * 0.7})`,
                backdropFilter: `blur(${blurIntensity * 20}px)`,
              }}>
                <PanelContent>
                  <PanelTitle>CSS Blur Panel 2</PanelTitle>
                  <PanelSubtext>
                    CSS backdrop-filter blur
                  </PanelSubtext>
                </PanelContent>
              </DemoPanel>
            </div>
          </ControlGroup>
        </ControlsContent>
      </ControlsContainer>

      {showNavBar && (
        <>
          {/* Native iOS NavBar - Available on all iOS versions */}
          <NativeNavBar
            items={navBarItems}
            onItemPress={handleNavBarAction}
            visible={showNavBar}
            activeIndex={activeNavIndex}
          />

          {/* CSS Fallback NavBar - Only renders when native is not supported */}
          {!nativeNavBarSupported && (
            <MobileNavBarCSS
              items={navBarItems}
              blurStyle={selectedBlur}
              onItemPress={handleNavBarAction}
              visible={showNavBar}
              animated={true}
              activeIndex={activeNavIndex}
            />
          )}
        </>
      )}
    </DemoContainer>
  );
};

NativeBlurDemo.propTypes = {
  history: PropTypes.object.isRequired,
};

export default withRouter(NativeBlurDemo);