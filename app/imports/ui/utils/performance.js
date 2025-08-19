/**
 * Performance monitoring utilities for React components
 * 
 * This module provides tools for measuring and optimizing component performance
 * in development and production environments.
 */

/**
 * Higher-order component for performance profiling
 * @param {string} componentName - Name of the component to profile
 * @param {React.Component} WrappedComponent - Component to wrap
 * @returns {React.Component} - Profiled component
 */
export const withPerformanceProfiler = (componentName, WrappedComponent) => {
  if (process.env.NODE_ENV !== 'development') {
    return WrappedComponent;
  }

  return React.forwardRef((props, ref) => (
    <React.Profiler
      id={componentName}
      onRender={(id, phase, actualDuration, baseDuration, startTime, commitTime, interactions) => {
        // Log performance data in development
        if (actualDuration > 10) { // Only log slow renders (>10ms)
          console.log(`⚡ [Performance] ${id} ${phase} took ${actualDuration.toFixed(2)}ms`, {
            actualDuration: actualDuration.toFixed(2),
            baseDuration: baseDuration.toFixed(2),
            startTime: startTime.toFixed(2),
            commitTime: commitTime.toFixed(2),
            interactions: interactions.size,
          });
        }
      }}
    >
      <WrappedComponent {...props} ref={ref} />
    </React.Profiler>
  ));
};

/**
 * Performance measurement hook
 * @param {string} operationName - Name of the operation to measure
 * @returns {Function} - Function to call when operation completes
 */
export const usePerformanceMeasure = (operationName) => {
  const startTime = React.useRef(null);
  
  const startMeasure = React.useCallback(() => {
    if (process.env.NODE_ENV === 'development') {
      startTime.current = performance.now();
    }
  }, []);
  
  const endMeasure = React.useCallback(() => {
    if (process.env.NODE_ENV === 'development' && startTime.current !== null) {
      const duration = performance.now() - startTime.current;
      if (duration > 5) { // Only log operations taking >5ms
        console.log(`⏱️ [Performance] ${operationName} took ${duration.toFixed(2)}ms`);
      }
      startTime.current = null;
    }
  }, [operationName]);
  
  return { startMeasure, endMeasure };
};

/**
 * Memoization utility with performance tracking
 * @param {Function} factory - Function to memoize
 * @param {Array} deps - Dependencies array
 * @param {string} name - Name for performance tracking
 * @returns {any} - Memoized value
 */
export const useMemoWithPerf = (factory, deps, name = 'unknown') => {
  const [value, setValue] = React.useState(() => factory());
  const prevDeps = React.useRef(deps);
  
  React.useEffect(() => {
    const depsChanged = !deps.every((dep, index) => dep === prevDeps.current[index]);
    
    if (depsChanged) {
      if (process.env.NODE_ENV === 'development') {
        const startTime = performance.now();
        const newValue = factory();
        const duration = performance.now() - startTime;
        
        if (duration > 1) { // Log expensive computations >1ms
          console.log(`🧮 [Performance] useMemo(${name}) recalculated in ${duration.toFixed(2)}ms`);
        }
        
        setValue(newValue);
      } else {
        setValue(factory());
      }
      
      prevDeps.current = deps;
    }
  }, deps);
  
  return value;
};

/**
 * Callback memoization with performance tracking
 * @param {Function} callback - Callback function to memoize
 * @param {Array} deps - Dependencies array
 * @param {string} name - Name for performance tracking
 * @returns {Function} - Memoized callback
 */
export const useCallbackWithPerf = (callback, deps, name = 'unknown') => {
  const memoizedCallback = React.useCallback(callback, deps);
  
  if (process.env.NODE_ENV === 'development') {
    return React.useCallback((...args) => {
      const startTime = performance.now();
      const result = memoizedCallback(...args);
      const duration = performance.now() - startTime;
      
      if (duration > 5) { // Log expensive callbacks >5ms
        console.log(`🔄 [Performance] useCallback(${name}) executed in ${duration.toFixed(2)}ms`);
      }
      
      return result;
    }, [memoizedCallback, name]);
  }
  
  return memoizedCallback;
};

/**
 * Component render tracking utility
 * @param {string} componentName - Name of the component
 * @param {object} props - Component props
 */
export const useRenderTracking = (componentName, props = {}) => {
  const renderCount = React.useRef(0);
  const lastRenderTime = React.useRef(Date.now());
  
  React.useEffect(() => {
    renderCount.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    if (process.env.NODE_ENV === 'development') {
      if (renderCount.current > 1 && timeSinceLastRender < 100) {
        console.warn(`🔥 [Performance] ${componentName} rendered ${renderCount.current} times (last render ${timeSinceLastRender}ms ago)`, {
          props: Object.keys(props),
          renderCount: renderCount.current,
        });
      }
    }
    
    lastRenderTime.current = now;
  });
};

/**
 * Memory usage tracking (development only)
 * @param {string} componentName - Name of the component
 */
export const useMemoryTracking = (componentName) => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development' && performance.memory) {
      const memory = performance.memory;
      console.log(`💾 [Memory] ${componentName} mounted`, {
        used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
        total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + 'MB',
        limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + 'MB',
      });
    }
  }, [componentName]);
};

/**
 * List virtualization helper for large lists
 * @param {Array} items - Array of items to virtualize
 * @param {number} containerHeight - Height of the visible container
 * @param {number} itemHeight - Height of each item
 * @param {number} overscan - Number of items to render outside visible area
 * @returns {object} - Virtualization data
 */
export const useListVirtualization = (items, containerHeight, itemHeight, overscan = 3) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const visibleRange = React.useMemo(() => {
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(items.length - 1, startIndex + visibleCount + overscan * 2);
    
    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, itemHeight, items.length, overscan]);
  
  const visibleItems = React.useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1).map((item, index) => ({
      item,
      index: visibleRange.startIndex + index,
      top: (visibleRange.startIndex + index) * itemHeight,
    }));
  }, [items, visibleRange, itemHeight]);
  
  const totalHeight = items.length * itemHeight;
  
  const handleScroll = React.useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);
  
  return {
    visibleItems,
    totalHeight,
    handleScroll,
    visibleRange,
  };
};
