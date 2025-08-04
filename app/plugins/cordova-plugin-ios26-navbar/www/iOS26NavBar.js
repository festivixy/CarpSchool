/**
 * iOS 26 NavBar Cordova Plugin
 * Provides native iOS 26 Liquid Glass navigation bars
 */

var exec;
// In Meteor, cordova is available as a global object when running in Cordova environment
if (typeof cordova !== 'undefined' && cordova.exec) {
    exec = cordova.exec;
} else {
    // Fallback for web builds or when cordova is not available
    exec = function(success, error, service, action, args) {
        console.warn('[iOS26NavBar] cordova.exec not available - running in web mode');
        if (error) {
            error(new Error('Cordova not available'));
        }
    };
}

var iOS26NavBar = {
    /**
     * Check if iOS 26 liquid glass navbar is supported
     */
    isSupported: function(success, error) {
        exec(success, error, 'iOS26NavBar', 'isSupported', []);
    },

    /**
     * Create a new native navbar
     */
    createNavBar: function(options, success, error) {
        options = options || {};
        exec(success, error, 'iOS26NavBar', 'createNavBar', [options]);
    },

    /**
     * Add items to navbar
     */
    setNavBarItems: function(navBarId, items, success, error) {
        exec(success, error, 'iOS26NavBar', 'setNavBarItems', [navBarId, items]);
    },

    /**
     * Set active item
     */
    setActiveItem: function(navBarId, itemIndex, success, error) {
        exec(success, error, 'iOS26NavBar', 'setActiveItem', [navBarId, itemIndex]);
    },

    /**
     * Show navbar
     */
    showNavBar: function(navBarId, success, error) {
        exec(success, error, 'iOS26NavBar', 'showNavBar', [navBarId]);
    },

    /**
     * Hide navbar
     */
    hideNavBar: function(navBarId, success, error) {
        exec(success, error, 'iOS26NavBar', 'hideNavBar', [navBarId]);
    },

    /**
     * Remove navbar
     */
    removeNavBar: function(navBarId, success, error) {
        exec(success, error, 'iOS26NavBar', 'removeNavBar', [navBarId]);
    },

    /**
     * Set action handler for navbar item taps
     */
    setActionHandler: function(handler, success, error) {
        // Store handler globally so native code can call it
        window.iOS26NavBarActionHandler = handler;
        exec(success, error, 'iOS26NavBar', 'setActionHandler', []);
    },

    /**
     * Get iOS version
     */
    getIOSVersion: function(success, error) {
        exec(success, error, 'iOS26NavBar', 'getIOSVersion', []);
    }
};

// Promisified version for easier use
iOS26NavBar.promise = {
    isSupported: function() {
        return new Promise(function(resolve, reject) {
            iOS26NavBar.isSupported(resolve, reject);
        });
    },

    createNavBar: function(options) {
        return new Promise(function(resolve, reject) {
            iOS26NavBar.createNavBar(options, resolve, reject);
        });
    },

    setNavBarItems: function(navBarId, items) {
        return new Promise(function(resolve, reject) {
            iOS26NavBar.setNavBarItems(navBarId, items, resolve, reject);
        });
    },

    setActiveItem: function(navBarId, itemIndex) {
        return new Promise(function(resolve, reject) {
            iOS26NavBar.setActiveItem(navBarId, itemIndex, resolve, reject);
        });
    },

    showNavBar: function(navBarId) {
        return new Promise(function(resolve, reject) {
            iOS26NavBar.showNavBar(navBarId, resolve, reject);
        });
    },

    hideNavBar: function(navBarId) {
        return new Promise(function(resolve, reject) {
            iOS26NavBar.hideNavBar(navBarId, resolve, reject);
        });
    },

    removeNavBar: function(navBarId) {
        return new Promise(function(resolve, reject) {
            iOS26NavBar.removeNavBar(navBarId, resolve, reject);
        });
    },

    setActionHandler: function(handler) {
        return new Promise(function(resolve, reject) {
            iOS26NavBar.setActionHandler(handler, resolve, reject);
        });
    },

    getIOSVersion: function() {
        return new Promise(function(resolve, reject) {
            iOS26NavBar.getIOSVersion(resolve, reject);
        });
    }
};

module.exports = iOS26NavBar;
