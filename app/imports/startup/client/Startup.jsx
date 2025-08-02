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
  console.log("renderApp() called");

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    console.error("Root element not found! Make sure the HTML has a div with id=\"root\"");
    return;
  }
  console.log("Root element found:", rootElement);

  // Add platform-specific classes to body
  if (Meteor.isCordova) {
    console.log("Adding cordova class to body");
    document.body.classList.add("cordova");

    // Detect iOS
    if (window.device && window.device.platform === "iOS") {
      console.log("Detected iOS platform, adding ios class");
      document.body.classList.add("ios");
    }
  }

  try {
    console.log("Attempting to render React app...");
    render(<App />, rootElement);  // eslint-disable-line
    console.log("React app rendered successfully");
  } catch (error) {
    console.error("Error rendering React app:", error);
    console.error("Error stack:", error.stack);
    return;
  }

  // Remove loading screen once app is rendered
  setTimeout(() => {
    console.log("Attempting to remove loading screen...");
    const loadingScreen = document.getElementById("loading-screen");
    if (loadingScreen) {
      loadingScreen.style.display = "none";
      console.log("Loading screen removed successfully");
    } else {
      console.warn("Loading screen element not found");
    }
  }, 100);
};

/** Startup the application by rendering the App layout component. */
Meteor.startup(() => {
  console.log("Meteor.startup called");
  console.log("Meteor.isCordova:", Meteor.isCordova);
  console.log("document.readyState:", document.readyState);

  // Check if running in Cordova environment
  if (Meteor.isCordova) {
    console.log("Running in Cordova environment");
    console.log("window.device exists:", !!window.device);
    console.log("window.cordova exists:", !!window.cordova);

    // Add timeout fallback in case deviceready never fires
    let deviceReadyFired = false;

    // Wait for device ready event in Cordova
    document.addEventListener("deviceready", () => {
      console.log("Cordova device ready event fired!");
      if (!deviceReadyFired) {
        deviceReadyFired = true;
        console.log("Starting app after deviceready...");
        renderApp();
      }
    }, false);

    // Fallback timeout - if deviceready doesn't fire within 10 seconds, render anyway
    setTimeout(() => {
      if (!deviceReadyFired) {
        console.warn("deviceready event did not fire within 10 seconds, rendering app anyway");
        console.log("window.cordova at timeout:", !!window.cordova);
        console.log("window.device at timeout:", !!window.device);
        deviceReadyFired = true;
        renderApp();
      }
    }, 10000);

    console.log("Waiting for deviceready event...");
  } else {
    console.log("Running in web browser environment");
    // Normal web startup
    renderApp();
  }
});
