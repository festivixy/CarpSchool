/**
 * Cordova Liquid Blur Plugin
 * Provides native iOS 26 Liquid Glass blur effects
 */

var exec;
try {
    exec = require('cordova/exec');
} catch (e) {
    // cordova/exec not available in web builds
    exec = function() {
        console.warn('[LiquidBlur] cordova/exec not available');
    };
}

/**
 * LiquidBlur plugin interface
 */
var LiquidBlur = {

    /**
     * Check if native blur is supported on current platform
     * @param {Function} success Success callback with boolean result
     * @param {Function} error Error callback
     */
    isSupported: function(success, error) {
        exec(success, error, 'LiquidBlur', 'isSupported', []);
    },

    /**
     * Create a blur view with specified configuration
     * @param {Object} options Blur configuration options
     * @param {string} options.style Blur style ('systemMaterial', 'systemThinMaterial', 'systemThickMaterial', 'systemChromeMaterial', 'systemUltraThinMaterial')
     * @param {Object} options.frame Frame configuration {x, y, width, height}
     * @param {boolean} options.floating Whether the blur should float above content
     * @param {number} options.alpha Alpha value (0.0 - 1.0)
     * @param {Function} success Success callback with blur view ID
     * @param {Function} error Error callback
     */
    createBlurView: function(options, success, error) {
        var defaultOptions = {
            style: 'systemMaterial',
            frame: { x: 0, y: 0, width: '100%', height: '100%' },
            floating: true,
            alpha: 1.0
        };

        var config = Object.assign(defaultOptions, options || {});
        exec(success, error, 'LiquidBlur', 'createBlurView', [config]);
    },

    /**
     * Update blur view configuration
     * @param {string} blurId Blur view identifier
     * @param {Object} options Updated configuration options
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    updateBlurView: function(blurId, options, success, error) {
        exec(success, error, 'LiquidBlur', 'updateBlurView', [blurId, options]);
    },

    /**
     * Remove a blur view
     * @param {string} blurId Blur view identifier
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    removeBlurView: function(blurId, success, error) {
        exec(success, error, 'LiquidBlur', 'removeBlurView', [blurId]);
    },

    /**
     * Remove all blur views
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    removeAllBlurViews: function(success, error) {
        exec(success, error, 'LiquidBlur', 'removeAllBlurViews', []);
    },

    /**
     * Set blur view visibility
     * @param {string} blurId Blur view identifier
     * @param {boolean} visible Visibility state
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    setBlurViewVisibility: function(blurId, visible, success, error) {
        exec(success, error, 'LiquidBlur', 'setBlurViewVisibility', [blurId, visible]);
    },

    /**
     * Animate blur view properties
     * @param {string} blurId Blur view identifier
     * @param {Object} properties Properties to animate
     * @param {number} duration Animation duration in milliseconds
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    animateBlurView: function(blurId, properties, duration, success, error) {
        duration = duration || 300;
        exec(success, error, 'LiquidBlur', 'animateBlurView', [blurId, properties, duration]);
    },

    /**
     * Get system blur styles available on current iOS version
     * @param {Function} success Success callback with array of available styles
     * @param {Function} error Error callback
     */
    getAvailableBlurStyles: function(success, error) {
        exec(success, error, 'LiquidBlur', 'getAvailableBlurStyles', []);
    },

    /**
     * Enable/disable scroll edge effects for blur views
     * @param {boolean} enabled Whether to enable scroll edge effects
     * @param {Function} success Success callback
     * @param {Function} error Error callback
     */
    setScrollEdgeEffects: function(enabled, success, error) {
        exec(success, error, 'LiquidBlur', 'setScrollEdgeEffects', [enabled]);
    }
};

// Promise-based wrapper for modern async/await usage
LiquidBlur.promise = {
    isSupported: function() {
        return new Promise(function(resolve, reject) {
            LiquidBlur.isSupported(resolve, reject);
        });
    },

    createBlurView: function(options) {
        return new Promise(function(resolve, reject) {
            LiquidBlur.createBlurView(options, resolve, reject);
        });
    },

    updateBlurView: function(blurId, options) {
        return new Promise(function(resolve, reject) {
            LiquidBlur.updateBlurView(blurId, options, resolve, reject);
        });
    },

    removeBlurView: function(blurId) {
        return new Promise(function(resolve, reject) {
            LiquidBlur.removeBlurView(blurId, resolve, reject);
        });
    },

    removeAllBlurViews: function() {
        return new Promise(function(resolve, reject) {
            LiquidBlur.removeAllBlurViews(resolve, reject);
        });
    },

    setBlurViewVisibility: function(blurId, visible) {
        return new Promise(function(resolve, reject) {
            LiquidBlur.setBlurViewVisibility(blurId, visible, resolve, reject);
        });
    },

    animateBlurView: function(blurId, properties, duration) {
        return new Promise(function(resolve, reject) {
            LiquidBlur.animateBlurView(blurId, properties, duration, resolve, reject);
        });
    },

    getAvailableBlurStyles: function() {
        return new Promise(function(resolve, reject) {
            LiquidBlur.getAvailableBlurStyles(resolve, reject);
        });
    },

    setScrollEdgeEffects: function(enabled) {
        return new Promise(function(resolve, reject) {
            LiquidBlur.setScrollEdgeEffects(enabled, resolve, reject);
        });
    }
};

module.exports = LiquidBlur;
