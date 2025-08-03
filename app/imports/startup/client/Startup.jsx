import React from "react";
import { render } from "react-dom";
import { Meteor } from "meteor/meteor";
import App from "../../ui/layouts/App.jsx";

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
    // Add timeout fallback in case deviceready never fires
    let deviceReadyFired = false;

    // Wait for device ready event in Cordova
    document.addEventListener("deviceready", () => {
      if (!deviceReadyFired) {
        deviceReadyFired = true;
        renderApp();
      }
    }, false);

    // Fallback timeout - if deviceready doesn't fire within 10 seconds, render anyway
    setTimeout(() => {
      if (!deviceReadyFired) {
        console.warn("deviceready event did not fire within 10 seconds, rendering app anyway");
        deviceReadyFired = true;
        renderApp();
      }
    }, 10000);
  } else {
    // Normal web startup
    renderApp();
  }
});
