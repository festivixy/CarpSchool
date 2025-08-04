package school.carp.plugins;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.PluginResult;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.util.Log;

/**
 * Android fallback implementation for FloatingToolbar plugin
 * Provides basic functionality but recommends CSS fallback for toolbar features
 */
public class FloatingToolbar extends CordovaPlugin {

    private static final String TAG = "FloatingToolbar";

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

        switch (action) {
            case "isSupported":
                return isSupported(callbackContext);
            case "createToolbar":
                return createToolbar(args, callbackContext);
            case "updateToolbar":
                return updateToolbar(args, callbackContext);
            case "addToolbarItem":
                return addToolbarItem(args, callbackContext);
            case "removeToolbarItem":
                return removeToolbarItem(args, callbackContext);
            case "setToolbarVisibility":
                return setToolbarVisibility(args, callbackContext);
            case "removeToolbar":
                return removeToolbar(args, callbackContext);
            case "removeAllToolbars":
                return removeAllToolbars(callbackContext);
            case "animateToolbar":
                return animateToolbar(args, callbackContext);
            case "configureSafeArea":
                return configureSafeArea(args, callbackContext);
            case "setScrollBehavior":
                return setScrollBehavior(args, callbackContext);
            default:
                return false;
        }
    }

    private boolean isSupported(CallbackContext callbackContext) {
        // Native toolbar not supported on Android - recommend CSS fallback
        Log.i(TAG, "Native toolbar not supported on Android platform");
        PluginResult result = new PluginResult(PluginResult.Status.OK, false);
        callbackContext.sendPluginResult(result);
        return true;
    }

    private boolean createToolbar(JSONArray args, CallbackContext callbackContext) {
        String message = "Native toolbar not supported on Android. Use CSS fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean updateToolbar(JSONArray args, CallbackContext callbackContext) {
        String message = "Native toolbar not supported on Android. Use CSS fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean addToolbarItem(JSONArray args, CallbackContext callbackContext) {
        String message = "Native toolbar not supported on Android. Use CSS fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean removeToolbarItem(JSONArray args, CallbackContext callbackContext) {
        String message = "Native toolbar not supported on Android. Use CSS fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean setToolbarVisibility(JSONArray args, CallbackContext callbackContext) {
        String message = "Native toolbar not supported on Android. Use CSS fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean removeToolbar(JSONArray args, CallbackContext callbackContext) {
        String message = "Native toolbar not supported on Android. Use CSS fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean removeAllToolbars(CallbackContext callbackContext) {
        String message = "Native toolbar not supported on Android. Use CSS fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean animateToolbar(JSONArray args, CallbackContext callbackContext) {
        String message = "Native toolbar not supported on Android. Use CSS fallback.";
        Log.w(TAG, message);
        callbackContext.error(message);
        return true;
    }

    private boolean configureSafeArea(JSONArray args, CallbackContext callbackContext) {
        // No-op for Android
        Log.i(TAG, "Safe area configuration not applicable on Android");
        PluginResult result = new PluginResult(PluginResult.Status.OK);
        callbackContext.sendPluginResult(result);
        return true;
    }

    private boolean setScrollBehavior(JSONArray args, CallbackContext callbackContext) {
        // No-op for Android
        Log.i(TAG, "Scroll behavior configuration not applicable on Android");
        PluginResult result = new PluginResult(PluginResult.Status.OK);
        callbackContext.sendPluginResult(result);
        return true;
    }
}
