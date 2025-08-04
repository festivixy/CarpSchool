/**
 * Cordova Floating Toolbar Plugin
 * Provides native iOS 26 Liquid Glass floating toolbars
 */

var exec;
// In Meteor, cordova is available as a global object when running in Cordova environment
if (typeof cordova !== 'undefined' && cordova.exec) {
    exec = cordova.exec;
} else {
    // Fallback for web builds or when cordova is not available
    exec = function() {
        console.warn('[FloatingToolbar] cordova.exec not available');
    };
}

/**
 * FloatingToolbar plugin interface
 */
var FloatingToolbar = {

    /**
     * Check if native floating toolbars are supported
     * @param {Function} success Success callback with boolean result
     * @param {Function} error Error callback
     */
    isSupported: function(success, error) {
        exec(success, error, 'FloatingToolbar', 'isSupported', []);
    },

    /**
     * Create a floating toolbar
     * @param {Object} options Toolbar configuration
     * @param {string} options.position Position ('top', 'bottom', 'floating')
     * @param {Array} options.items Array of toolbar items
     * @param {Object} options.style Style configuration
     * @param {Function} success Success callback with toolbar ID
     * @param {Function} error Error callback
     */
    createToolbar: function(options, success, error) {
        var defaultOptions = {
            position: 'bottom',
            items: [],
            style: {
                blurStyle: 'systemMaterial',
                cornerRadius: 16,
                margin: 16,
                height: 50
            }
        };

        var config = Object.assign(defaultOptions, options || {});
        exec(success, error, 'FloatingToolbar', 'createToolbar', [config]);
    },

    /**
     * Update toolbar configuration
     * @param {string} toolbarId Toolbar identifier
     * @param {Object} options Updated configuration
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    updateToolbar: function(toolbarId, options, success, error) {
        exec(success, error, 'FloatingToolbar', 'updateToolbar', [toolbarId, options]);
    },

    /**
     * Add item to toolbar
     * @param {string} toolbarId Toolbar identifier
     * @param {Object} item Toolbar item configuration
     * @param {string} item.type Item type ('button', 'space', 'flexibleSpace')
     * @param {string} item.title Button title (for button type)
     * @param {string} item.icon SF Symbol name (for button type)
     * @param {string} item.action Action identifier
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    addToolbarItem: function(toolbarId, item, success, error) {
        exec(success, error, 'FloatingToolbar', 'addToolbarItem', [toolbarId, item]);
    },

    /**
     * Remove item from toolbar
     * @param {string} toolbarId Toolbar identifier
     * @param {number} itemIndex Item index to remove
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    removeToolbarItem: function(toolbarId, itemIndex, success, error) {
        exec(success, error, 'FloatingToolbar', 'removeToolbarItem', [toolbarId, itemIndex]);
    },

    /**
     * Set toolbar visibility
     * @param {string} toolbarId Toolbar identifier
     * @param {boolean} visible Visibility state
     * @param {boolean} animated Whether to animate the change
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    setToolbarVisibility: function(toolbarId, visible, animated, success, error) {
        animated = animated !== false; // Default to true
        exec(success, error, 'FloatingToolbar', 'setToolbarVisibility', [toolbarId, visible, animated]);
    },

    /**
     * Remove toolbar
     * @param {string} toolbarId Toolbar identifier
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    removeToolbar: function(toolbarId, success, error) {
        exec(success, error, 'FloatingToolbar', 'removeToolbar', [toolbarId]);
    },

    /**
     * Remove all toolbars
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    removeAllToolbars: function(success, error) {
        exec(success, error, 'FloatingToolbar', 'removeAllToolbars', []);
    },

    /**
     * Set toolbar item action handler
     * @param {Function} handler Function to handle toolbar item actions
     */
    setActionHandler: function(handler) {
        this._actionHandler = handler;
    },

    /**
     * Internal method to handle toolbar actions
     * @private
     */
    _handleAction: function(toolbarId, action, itemIndex) {
        if (this._actionHandler && typeof this._actionHandler === 'function') {
            this._actionHandler(toolbarId, action, itemIndex);
        }
    },

    /**
     * Animate toolbar to new position
     * @param {string} toolbarId Toolbar identifier
     * @param {Object} properties Animation properties
     * @param {number} duration Animation duration in milliseconds
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    animateToolbar: function(toolbarId, properties, duration, success, error) {
        duration = duration || 300;
        exec(success, error, 'FloatingToolbar', 'animateToolbar', [toolbarId, properties, duration]);
    },

    /**
     * Configure safe area handling
     * @param {string} toolbarId Toolbar identifier
     * @param {boolean} respectSafeArea Whether to respect safe areas
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    configureSafeArea: function(toolbarId, respectSafeArea, success, error) {
        exec(success, error, 'FloatingToolbar', 'configureSafeArea', [toolbarId, respectSafeArea]);
    },

    /**
     * Set scroll edge behavior
     * @param {string} toolbarId Toolbar identifier
     * @param {boolean} hideOnScroll Whether to hide toolbar when scrolling
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    setScrollBehavior: function(toolbarId, hideOnScroll, success, error) {
        exec(success, error, 'FloatingToolbar', 'setScrollBehavior', [toolbarId, hideOnScroll]);
    }
};

// Promise-based wrapper
FloatingToolbar.promise = {
    isSupported: function() {
        return new Promise(function(resolve, reject) {
            FloatingToolbar.isSupported(resolve, reject);
        });
    },

    createToolbar: function(options) {
        return new Promise(function(resolve, reject) {
            FloatingToolbar.createToolbar(options, resolve, reject);
        });
    },

    updateToolbar: function(toolbarId, options) {
        return new Promise(function(resolve, reject) {
            FloatingToolbar.updateToolbar(toolbarId, options, resolve, reject);
        });
    },

    addToolbarItem: function(toolbarId, item) {
        return new Promise(function(resolve, reject) {
            FloatingToolbar.addToolbarItem(toolbarId, item, resolve, reject);
        });
    },

    removeToolbarItem: function(toolbarId, itemIndex) {
        return new Promise(function(resolve, reject) {
            FloatingToolbar.removeToolbarItem(toolbarId, itemIndex, resolve, reject);
        });
    },

    setToolbarVisibility: function(toolbarId, visible, animated) {
        return new Promise(function(resolve, reject) {
            FloatingToolbar.setToolbarVisibility(toolbarId, visible, animated, resolve, reject);
        });
    },

    removeToolbar: function(toolbarId) {
        return new Promise(function(resolve, reject) {
            FloatingToolbar.removeToolbar(toolbarId, resolve, reject);
        });
    },

    removeAllToolbars: function() {
        return new Promise(function(resolve, reject) {
            FloatingToolbar.removeAllToolbars(resolve, reject);
        });
    },

    animateToolbar: function(toolbarId, properties, duration) {
        return new Promise(function(resolve, reject) {
            FloatingToolbar.animateToolbar(toolbarId, properties, duration, resolve, reject);
        });
    },

    configureSafeArea: function(toolbarId, respectSafeArea) {
        return new Promise(function(resolve, reject) {
            FloatingToolbar.configureSafeArea(toolbarId, respectSafeArea, resolve, reject);
        });
    },

    setScrollBehavior: function(toolbarId, hideOnScroll) {
        return new Promise(function(resolve, reject) {
            FloatingToolbar.setScrollBehavior(toolbarId, hideOnScroll, resolve, reject);
        });
    }
};

module.exports = FloatingToolbar;
