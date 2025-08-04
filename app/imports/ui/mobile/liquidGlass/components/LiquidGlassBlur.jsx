import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { useNativeBlur } from '../../hooks/useNativeBlur';

/**
 * LiquidGlassBlur Component
 * 
 * Provides iOS 26 Liquid Glass blur effects with automatic fallback to CSS
 * Uses native UIVisualEffectView when available for optimal performance
 */
const LiquidGlassBlur = ({
  children,
  blurStyle = 'systemMaterial',
  intensity = 1.0,
  floating = false,
  position = 'relative',
  frame = null,
  className = '',
  style = {},
  animated = true,
  fallbackStyle = 'light',
  onBlurReady = null,
  ...props
}) => {
  const {
    isSupported: nativeSupported,
    isLoading,
    createBlurView,
    removeBlurView,
    updateBlurView,
    setBlurVisibility
  } = useNativeBlur();

  const [blurId, setBlurId] = useState(null);
  const [isVisible, setIsVisible] = useState(true);
  const [useNative, setUseNative] = useState(false);
  const containerRef = useRef(null);
  const mountedRef = useRef(true);

  // Determine if we should use native blur
  useEffect(() => {
    mountedRef.current = true;
    
    if (!isLoading) {
      setUseNative(nativeSupported && window.cordova && window.Meteor?.isCordova);
    }

    return () => {
      mountedRef.current = false;
    };
  }, [nativeSupported, isLoading]);

  // Create native blur view when component mounts
  useEffect(() => {
    if (useNative && !blurId && containerRef.current) {
      createNativeBlur();
    }

    return () => {
      if (blurId) {
        removeBlurView(blurId).catch(console.error);
      }
    };
  }, [useNative, blurId]);

  const createNativeBlur = useCallback(async () => {
    if (!useNative || !containerRef.current) return;

    try {
      const blurOptions = {
        style: blurStyle,
        alpha: intensity,
        floating: floating,
        frame: frame || {
          x: 0,
          y: 0,
          width: '100%',
          height: '100%'
        }
      };

      const id = await createBlurView(blurOptions);
      
      if (mountedRef.current) {
        setBlurId(id);
        
        if (onBlurReady) {
          onBlurReady({ blurId: id, useNative: true });
        }
      }
    } catch (error) {
      console.error('[LiquidGlassBlur] Failed to create native blur:', error);
      setUseNative(false);
    }
  }, [useNative, blurStyle, intensity, floating, frame, createBlurView, onBlurReady]);

  // Update native blur when props change
  useEffect(() => {
    if (useNative && blurId) {
      updateBlurView(blurId, {
        style: blurStyle,
        alpha: intensity,
        floating: floating
      }).catch(console.error);
    }
  }, [blurStyle, intensity, floating, blurId, useNative, updateBlurView]);

  // Handle visibility changes
  const handleVisibilityChange = useCallback((visible) => {
    setIsVisible(visible);
    
    if (useNative && blurId) {
      setBlurVisibility(blurId, visible).catch(console.error);
    }
  }, [useNative, blurId, setBlurVisibility]);

  // Expose methods to parent components
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.setVisibility = handleVisibilityChange;
      containerRef.current.updateBlur = (options) => {
        if (useNative && blurId) {
          return updateBlurView(blurId, options);
        }
      };
    }
  }, [handleVisibilityChange, useNative, blurId, updateBlurView]);

  // Call onBlurReady for CSS fallback
  useEffect(() => {
    if (!useNative && !isLoading && onBlurReady) {
      onBlurReady({ blurId: null, useNative: false });
    }
  }, [useNative, isLoading, onBlurReady]);

  if (isLoading) {
    return (
      <LoadingContainer ref={containerRef} className={className} style={style} {...props}>
        {children}
      </LoadingContainer>
    );
  }

  if (useNative) {
    // Native blur - transparent container that content renders over the native blur
    return (
      <NativeBlurContainer
        ref={containerRef}
        className={className}
        style={style}
        position={position}
        isVisible={isVisible}
        {...props}
      >
        {children}
      </NativeBlurContainer>
    );
  }

  // CSS fallback
  return (
    <CSSBlurContainer
      ref={containerRef}
      className={className}
      style={style}
      blurStyle={fallbackStyle}
      intensity={intensity}
      floating={floating}
      position={position}
      isVisible={isVisible}
      animated={animated}
      {...props}
    >
      {children}
    </CSSBlurContainer>
  );
};

LiquidGlassBlur.propTypes = {
  children: PropTypes.node,
  blurStyle: PropTypes.oneOf([
    'systemMaterial',
    'systemThinMaterial', 
    'systemThickMaterial',
    'systemChromeMaterial',
    'systemUltraThinMaterial',
    'light',
    'dark',
    'extraLight'
  ]),
  intensity: PropTypes.number,
  floating: PropTypes.bool,
  position: PropTypes.oneOf(['relative', 'absolute', 'fixed', 'sticky']),
  frame: PropTypes.shape({
    x: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    y: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  }),
  className: PropTypes.string,
  style: PropTypes.object,
  animated: PropTypes.bool,
  fallbackStyle: PropTypes.oneOf(['light', 'dark', 'tinted']),
  onBlurReady: PropTypes.func
};

// Styled components
const LoadingContainer = styled.div`
  position: relative;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0.6;
`;

const NativeBlurContainer = styled.div`
  position: ${props => props.position};
  background: transparent;
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: opacity 0.3s ease;
  
  /* Ensure content is visible over native blur */
  z-index: 10;
`;

const CSSBlurContainer = styled.div`
  position: ${props => props.position};
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: ${props => props.animated ? 'all 0.3s ease' : 'none'};
  
  /* CSS backdrop-filter fallback */
  background: ${props => {
    const alpha = props.intensity * 0.7;
    switch (props.blurStyle) {
      case 'dark':
        return `rgba(0, 0, 0, ${alpha})`;
      case 'tinted':
        return `rgba(120, 120, 128, ${alpha})`;
      default:
        return `rgba(255, 255, 255, ${alpha})`;
    }
  }};
  
  backdrop-filter: blur(${props => props.intensity * 20}px);
  -webkit-backdrop-filter: blur(${props => props.intensity * 20}px);
  
  ${props => props.floating && `
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    margin: 8px;
  `}
  
  /* Fallback for browsers without backdrop-filter support */
  @supports not (backdrop-filter: blur(1px)) {
    background: ${props => {
      const alpha = Math.min(props.intensity * 0.9, 0.95);
      switch (props.blurStyle) {
        case 'dark':
          return `rgba(0, 0, 0, ${alpha})`;
        case 'tinted':
          return `rgba(120, 120, 128, ${alpha})`;
        default:
          return `rgba(255, 255, 255, ${alpha})`;
      }
    }};
  }
`;

export default LiquidGlassBlur;
