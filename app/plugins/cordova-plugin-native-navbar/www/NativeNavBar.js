/**
 * Native NavBar Cordova Plugin
 * Provides native iOS navigation bars
 */

let exec;
// In Meteor, cordova is available as a global object when running in Cordova environment
if (typeof cordova !== "undefined" && cordova.exec) {
    exec = cordova.exec;
} else {
    // Fallback for web builds or when cordova is not available
    exec = function (success, error, service, action, args) {
        console.warn("[NativeNavBar] cordova.exec not available - running in web mode");
        if (error) {
            error(new Error("Cordova not available"));
        }
    };
}

const NativeNavBar = {
    /**
     * Check if native navbar is supported
     */
    isSupported: function (success, error) {
        exec(success, error, "NativeNavBar", "isSupported", []);
    },

    /**
     * Create a new native navbar
     */
    createNavBar: function (options, success, error) {
        options = options || {};
        exec(success, error, "NativeNavBar", "createNavBar", [options]);
    },

    /**
     * Add items to navbar
     */
    setNavBarItems: function (navBarId, items, success, error) {
        exec(success, error, "NativeNavBar", "setNavBarItems", [navBarId, items]);
    },

    /**
     * Set active item
     */
    setActiveItem: function (navBarId, itemIndex, success, error) {
        exec(success, error, "NativeNavBar", "setActiveItem", [navBarId, itemIndex]);
    },

    /**
     * Show navbar
     */
    showNavBar: function (navBarId, success, error) {
        exec(success, error, "NativeNavBar", "showNavBar", [navBarId]);
    },

    /**
     * Hide navbar
     */
    hideNavBar: function (navBarId, success, error) {
        exec(success, error, "NativeNavBar", "hideNavBar", [navBarId]);
    },

    /**
     * Remove navbar
     */
    removeNavBar: function (navBarId, success, error) {
        exec(success, error, "NativeNavBar", "removeNavBar", [navBarId]);
    },

    /**
     * Set action handler for navbar item taps
     */
    setActionHandler: function (handler, success, error) {
        // Store handler globally so native code can call it
        window.NativeNavBarActionHandler = handler;
        exec(success, error, "NativeNavBar", "setActionHandler", []);
    },

    /**
     * Get iOS version
     */
    getIOSVersion: function (success, error) {
        exec(success, error, "NativeNavBar", "getIOSVersion", []);
    },
};

// Promisified version for easier use
NativeNavBar.promise = {
    isSupported: function () {
        return new Promise(function (resolve, reject) {
            NativeNavBar.isSupported(resolve, reject);
        });
    },

    createNavBar: function (options) {
        return new Promise(function (resolve, reject) {
            NativeNavBar.createNavBar(options, resolve, reject);
        });
    },

    setNavBarItems: function (navBarId, items) {
        return new Promise(function (resolve, reject) {
            NativeNavBar.setNavBarItems(navBarId, items, resolve, reject);
        });
    },

    setActiveItem: function (navBarId, itemIndex) {
        return new Promise(function (resolve, reject) {
            NativeNavBar.setActiveItem(navBarId, itemIndex, resolve, reject);
        });
    },

    showNavBar: function (navBarId) {
        return new Promise(function (resolve, reject) {
            NativeNavBar.showNavBar(navBarId, resolve, reject);
        });
    },

    hideNavBar: function (navBarId) {
        return new Promise(function (resolve, reject) {
            NativeNavBar.hideNavBar(navBarId, resolve, reject);
        });
    },

    removeNavBar: function (navBarId) {
        return new Promise(function (resolve, reject) {
            NativeNavBar.removeNavBar(navBarId, resolve, reject);
        });
    },

    setActionHandler: function (handler) {
        return new Promise(function (resolve, reject) {
            NativeNavBar.setActionHandler(handler, resolve, reject);
        });
    },

    getIOSVersion: function () {
        return new Promise(function (resolve, reject) {
            NativeNavBar.getIOSVersion(resolve, reject);
        });
    },
};

module.exports = NativeNavBar;
