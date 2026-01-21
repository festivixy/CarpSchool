import React from "react";
import { render } from "react-dom";
import { Meteor } from "meteor/meteor";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-react";
import App from "../../ui/layouts/App";
import { getClerkPublishableKey } from "../../ui/utils/clerkAuth";
// Initialize mobile push notifications for Cordova apps
import "../../ui/mobile/utils/MobilePushNotifications";

// Suppress React lifecycle warnings from third-party packages
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && args[0].includes && args[0].includes("componentWill")) {
    return; // Suppress componentWill warnings
  }
  originalConsoleWarn.apply(console, args);
};

/** Render the app component */
const renderApp = async () => {
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

  // Get Clerk publishable key from public settings
  let PUBLISHABLE_KEY;
  try {
    PUBLISHABLE_KEY = getClerkPublishableKey();
    console.log("Clerk publishable key loaded successfully");
  } catch (error) {
    console.error("Failed to get Clerk publishable key from settings:", error);

    // Show error message to user
    rootElement.innerHTML = `
      <div style="display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; font-family: Arial, sans-serif;">
        <div>
          <h2 style="color: #e74c3c;">Configuration Error</h2>
          <p>Failed to load authentication configuration.</p>
          <p style="color: #7f8c8d; font-size: 14px;">Please check server configuration and try refreshing the page.</p>
          <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Retry
          </button>
        </div>
      </div>
    `;
    return;
  }

  if (!PUBLISHABLE_KEY) {
    console.error("Missing Clerk Publishable Key from server response");
    return;
  }

  try {
    render(
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        signInUrl="/login"
        signUpUrl="/signup"
        afterSignInUrl="/my-rides"
        afterSignUpUrl="/onboarding"
      >
        <App />
      </ClerkProvider>,
      rootElement
    );
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
    const safeRenderApp = async (trigger) => {
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

      await renderApp();
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
    renderApp().catch(error => {
      console.error("Failed to render app:", error);
    });
  }
});
