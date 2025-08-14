import React from "react";
import { render } from "react-dom";
import { Meteor } from "meteor/meteor";
import App from "../../ui/layouts/App";

// Suppress React lifecycle warnings from third-party packages
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && args[0].includes && args[0].includes("componentWill")) {
    return; // Suppress componentWill warnings
  }
  originalConsoleWarn.apply(console, args);
};

/** Render the app component */
const renderApp = () => {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found! Make sure the HTML has a div with id=\"root\"");
    return;
  }

  // Add platform-specific classes to body
  if (Meteor.isCordova) {
    document.body.classList.add("cordova");

    // Detect iOS
    if (window.device && window.device.platform === "iOS") {
      document.body.classList.add("ios");
    }
  }

  try {
    render(<App />, rootElement);  // eslint-disable-line
  } catch (error) {
    console.error("Error rendering React app:", error);
    console.error("Error stack:", error.stack);
    return;
  }

  // Remove loading screen once app is rendered
  setTimeout(() => {
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.display = "none";
    }
  }, 100);
};

/** Startup the application by rendering the App layout component. */
Meteor.startup(() => {
  // Check if running in Cordova environment
  if (Meteor.isCordova) {
    // State management to prevent race conditions
    const appStartupState = {
      deviceReadyFired: false,
      timeoutFired: false,
      appRendered: false,
    };

    // Timeout reference for cleanup
    let fallbackTimeoutId = null;

    // Safe render function that prevents double-rendering
    const safeRenderApp = (trigger) => {
      if (appStartupState.appRendered) {
        console.log(`[Startup] App already rendered, ignoring ${trigger} trigger`);
        return;
      }

      console.log(`[Startup] Rendering app triggered by: ${trigger}`);
      appStartupState.appRendered = true;

      // Clear the timeout if it exists to prevent it from firing
      if (fallbackTimeoutId) {
        clearTimeout(fallbackTimeoutId);
        fallbackTimeoutId = null;
      }

      renderApp();
    };

    // Wait for device ready event in Cordova
    document.addEventListener("deviceready", () => {
      console.log("[Startup] deviceready event fired");
      appStartupState.deviceReadyFired = true;
      safeRenderApp("deviceready");
    }, false);

    // Fallback timeout - if deviceready doesn't fire within 10 seconds, render anyway
    fallbackTimeoutId = setTimeout(() => {
      console.warn("[Startup] deviceready event did not fire within 10 seconds, rendering app anyway");
      appStartupState.timeoutFired = true;
      safeRenderApp("timeout");
    }, 10000);
  } else {
    // Normal web startup
    renderApp();
  }
});
