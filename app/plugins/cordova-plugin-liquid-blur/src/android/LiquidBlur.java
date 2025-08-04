package school.carp.plugins;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

/**
 * Android fallback implementation for LiquidBlur plugin
 * Provides basic functionality but recommends CSS fallback for blur effects
 */
public class LiquidBlur extends CordovaPlugin {

    private static final String TAG = "LiquidBlur";

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

        switch (action) {
            case "isSupported":
                return isSupported(callbackContext);
            case "createBlurView":
                return createBlurView(args, callbackContext);
            case "updateBlurView":
                return updateBlurView(args, callbackContext);
            case "removeBlurView":
                return removeBlurView(args, callbackContext);
            case "removeAllBlurViews":
                return removeAllBlurViews(callbackContext);
            case "setBlurViewVisibility":
                return setBlurViewVisibility(args, callbackContext);
            case "animateBlurView":
                return animateBlurView(args, callbackContext);
            case "getAvailableBlurStyles":
                return getAvailableBlurStyles(callbackContext);
            case "setScrollEdgeEffects":
                return setScrollEdgeEffects(args, callbackContext);
            default:
                return false;
        }
    }

    private boolean isSupported(CallbackContext callbackContext) {
        // Native blur not supported on Android - recommend CSS fallback
        Log.i(TAG, "Native blur not supported on Android platform");
        PluginResult result = new PluginResult(PluginResult.Status.OK, false);
        callbackContext.sendPluginResult(result);
        return true;
    }

    private boolean createBlurView(JSONArray args, CallbackContext callbackContext) {
        String message = "Native blur not supported on Android. Use CSS backdrop-filter fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean updateBlurView(JSONArray args, CallbackContext callbackContext) {
        String message = "Native blur not supported on Android. Use CSS backdrop-filter fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean removeBlurView(JSONArray args, CallbackContext callbackContext) {
        String message = "Native blur not supported on Android. Use CSS backdrop-filter fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean removeAllBlurViews(CallbackContext callbackContext) {
        String message = "Native blur not supported on Android. Use CSS backdrop-filter fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean setBlurViewVisibility(JSONArray args, CallbackContext callbackContext) {
        String message = "Native blur not supported on Android. Use CSS backdrop-filter fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean animateBlurView(JSONArray args, CallbackContext callbackContext) {
        String message = "Native blur not supported on Android. Use CSS backdrop-filter fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean getAvailableBlurStyles(CallbackContext callbackContext) {
        // Return empty array for Android
        JSONArray styles = new JSONArray();
        Log.i(TAG, "No native blur styles available on Android");
        PluginResult result = new PluginResult(PluginResult.Status.OK, styles);
        callbackContext.sendPluginResult(result);
        return true;
    }

    private boolean setScrollEdgeEffects(JSONArray args, CallbackContext callbackContext) {
        // No-op for Android
        Log.i(TAG, "Scroll edge effects not applicable on Android");
        PluginResult result = new PluginResult(PluginResult.Status.OK);
        callbackContext.sendPluginResult(result);
        return true;
    }
}
