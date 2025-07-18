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

/** Startup the application by rendering the App layout component. */
Meteor.startup(() => {
  render(<App />, document.getElementById('root'));  // eslint-disable-line
});
