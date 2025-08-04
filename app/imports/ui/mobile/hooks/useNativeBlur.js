import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * React hook for managing native iOS blur effects
 * Provides seamless integration with Cordova liquid blur plugin
 */
export const useNativeBlur = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const blurViewsRef = useRef(new Map());

  useEffect(() => {
    const checkSupport = async () => {
      try {
        if (window.cordova?.plugins?.liquidBlur) {
          const supported = await window.cordova.plugins.liquidBlur.promise.isSupported();
          setIsSupported(supported);
        }
      } catch (error) {
        console.log('[useNativeBlur] Native blur not available:', error);
        setIsSupported(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (window.cordova) {
      checkSupport();
    } else {
      // Wait for deviceready event
      const onDeviceReady = () => checkSupport();
      document.addEventListener('deviceready', onDeviceReady);
      return () => document.removeEventListener('deviceready', onDeviceReady);
    }
  }, []);

  const createBlurView = useCallback(async (options = {}) => {
    if (!isSupported || !window.cordova?.plugins?.liquidBlur) {
      throw new Error('Native blur not supported');
    }

    try {
      const blurId = await window.cordova.plugins.liquidBlur.promise.createBlurView(options);
      blurViewsRef.current.set(blurId, options);
      return blurId;
    } catch (error) {
      console.error('[useNativeBlur] Failed to create blur view:', error);
      throw error;
    }
  }, [isSupported]);

  const updateBlurView = useCallback(async (blurId, options) => {
    if (!isSupported || !window.cordova?.plugins?.liquidBlur) {
      throw new Error('Native blur not supported');
    }

    try {
      await window.cordova.plugins.liquidBlur.promise.updateBlurView(blurId, options);
      const existing = blurViewsRef.current.get(blurId) || {};
      blurViewsRef.current.set(blurId, { ...existing, ...options });
    } catch (error) {
      console.error('[useNativeBlur] Failed to update blur view:', error);
      throw error;
    }
  }, [isSupported]);

  const removeBlurView = useCallback(async (blurId) => {
    if (!isSupported || !window.cordova?.plugins?.liquidBlur) {
      return;
    }

    try {
      await window.cordova.plugins.liquidBlur.promise.removeBlurView(blurId);
      blurViewsRef.current.delete(blurId);
    } catch (error) {
      console.error('[useNativeBlur] Failed to remove blur view:', error);
    }
  }, [isSupported]);

  const setBlurVisibility = useCallback(async (blurId, visible) => {
    if (!isSupported || !window.cordova?.plugins?.liquidBlur) {
      return;
    }

    try {
      await window.cordova.plugins.liquidBlur.promise.setBlurViewVisibility(blurId, visible);
    } catch (error) {
      console.error('[useNativeBlur] Failed to set blur visibility:', error);
    }
  }, [isSupported]);

  const animateBlur = useCallback(async (blurId, properties, duration = 300) => {
    if (!isSupported || !window.cordova?.plugins?.liquidBlur) {
      return;
    }

    try {
      await window.cordova.plugins.liquidBlur.promise.animateBlurView(blurId, properties, duration);
    } catch (error) {
      console.error('[useNativeBlur] Failed to animate blur view:', error);
    }
  }, [isSupported]);

  const removeAllBlurs = useCallback(async () => {
    if (!isSupported || !window.cordova?.plugins?.liquidBlur) {
      return;
    }

    try {
      await window.cordova.plugins.liquidBlur.promise.removeAllBlurViews();
      blurViewsRef.current.clear();
    } catch (error) {
      console.error('[useNativeBlur] Failed to remove all blur views:', error);
    }
  }, [isSupported]);

  const getAvailableStyles = useCallback(async () => {
    if (!isSupported || !window.cordova?.plugins?.liquidBlur) {
      return [];
    }

    try {
      return await window.cordova.plugins.liquidBlur.promise.getAvailableBlurStyles();
    } catch (error) {
      console.error('[useNativeBlur] Failed to get blur styles:', error);
      return [];
    }
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (blurViewsRef.current.size > 0) {
        removeAllBlurs().catch(console.error);
      }
    };
  }, [removeAllBlurs]);

  return {
    isSupported,
    isLoading,
    createBlurView,
    updateBlurView,
    removeBlurView,
    setBlurVisibility,
    animateBlur,
    removeAllBlurs,
    getAvailableStyles,
    activeBlurs: Array.from(blurViewsRef.current.keys())
  };
};

/**
 * Hook for managing floating toolbars
 */
export const useFloatingToolbar = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const toolbarsRef = useRef(new Map());
  const actionHandlerRef = useRef(null);

  useEffect(() => {
    const checkSupport = async () => {
      try {
        if (window.cordova?.plugins?.floatingToolbar) {
          const supported = await window.cordova.plugins.floatingToolbar.promise.isSupported();
          setIsSupported(supported);
        }
      } catch (error) {
        console.log('[useFloatingToolbar] Native toolbar not available:', error);
        setIsSupported(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (window.cordova) {
      checkSupport();
    } else {
      const onDeviceReady = () => checkSupport();
      document.addEventListener('deviceready', onDeviceReady);
      return () => document.removeEventListener('deviceready', onDeviceReady);
    }
  }, []);

  const setActionHandler = useCallback((handler) => {
    actionHandlerRef.current = handler;
    if (window.cordova?.plugins?.floatingToolbar) {
      window.cordova.plugins.floatingToolbar.setActionHandler(handler);
    }
  }, []);

  const createToolbar = useCallback(async (options = {}) => {
    if (!isSupported || !window.cordova?.plugins?.floatingToolbar) {
      throw new Error('Native toolbar not supported');
    }

    try {
      const toolbarId = await window.cordova.plugins.floatingToolbar.promise.createToolbar(options);
      toolbarsRef.current.set(toolbarId, options);
      return toolbarId;
    } catch (error) {
      console.error('[useFloatingToolbar] Failed to create toolbar:', error);
      throw error;
    }
  }, [isSupported]);

  const updateToolbar = useCallback(async (toolbarId, options) => {
    if (!isSupported || !window.cordova?.plugins?.floatingToolbar) {
      throw new Error('Native toolbar not supported');
    }

    try {
      await window.cordova.plugins.floatingToolbar.promise.updateToolbar(toolbarId, options);
      const existing = toolbarsRef.current.get(toolbarId) || {};
      toolbarsRef.current.set(toolbarId, { ...existing, ...options });
    } catch (error) {
      console.error('[useFloatingToolbar] Failed to update toolbar:', error);
      throw error;
    }
  }, [isSupported]);

  const addToolbarItem = useCallback(async (toolbarId, item) => {
    if (!isSupported || !window.cordova?.plugins?.floatingToolbar) {
      throw new Error('Native toolbar not supported');
    }

    try {
      await window.cordova.plugins.floatingToolbar.promise.addToolbarItem(toolbarId, item);
    } catch (error) {
      console.error('[useFloatingToolbar] Failed to add toolbar item:', error);
      throw error;
    }
  }, [isSupported]);

  const setToolbarVisibility = useCallback(async (toolbarId, visible, animated = true) => {
    if (!isSupported || !window.cordova?.plugins?.floatingToolbar) {
      return;
    }

    try {
      await window.cordova.plugins.floatingToolbar.promise.setToolbarVisibility(toolbarId, visible, animated);
    } catch (error) {
      console.error('[useFloatingToolbar] Failed to set toolbar visibility:', error);
    }
  }, [isSupported]);

  const removeToolbar = useCallback(async (toolbarId) => {
    if (!isSupported || !window.cordova?.plugins?.floatingToolbar) {
      return;
    }

    try {
      await window.cordova.plugins.floatingToolbar.promise.removeToolbar(toolbarId);
      toolbarsRef.current.delete(toolbarId);
    } catch (error) {
      console.error('[useFloatingToolbar] Failed to remove toolbar:', error);
    }
  }, [isSupported]);

  const removeAllToolbars = useCallback(async () => {
    if (!isSupported || !window.cordova?.plugins?.floatingToolbar) {
      return;
    }

    try {
      await window.cordova.plugins.floatingToolbar.promise.removeAllToolbars();
      toolbarsRef.current.clear();
    } catch (error) {
      console.error('[useFloatingToolbar] Failed to remove all toolbars:', error);
    }
  }, [isSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (toolbarsRef.current.size > 0) {
        removeAllToolbars().catch(console.error);
      }
    };
  }, [removeAllToolbars]);

  return {
    isSupported,
    isLoading,
    createToolbar,
    updateToolbar,
    addToolbarItem,
    setToolbarVisibility,
    removeToolbar,
    removeAllToolbars,
    setActionHandler,
    activeToolbars: Array.from(toolbarsRef.current.keys())
  };
};

export default { useNativeBlur, useFloatingToolbar };
