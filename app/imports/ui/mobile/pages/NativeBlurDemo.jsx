import React, { useState, useEffect } from 'react';
import LiquidGlassBlur from '../liquidGlass/components/LiquidGlassBlur';
import LiquidGlassToolbar from '../liquidGlass/components/LiquidGlassToolbar';
import { useNativeBlur, useFloatingToolbar } from '../hooks/useNativeBlur';
import {
  DemoContainer,
  BackgroundContent,
  ContentGrid,
  ContentCard,
  CardTitle,
  CardText,
  StatusBar,
  StatusItem,
  ControlsContainer,
  ControlsContent,
  ControlGroup,
  ControlLabel,
  StyleSelector,
  StyleButton,
  IntensitySlider,
  ToolbarToggle,
  LoadingContainer,
  LoadingText,
} from '../styles/NativeBlurDemo';

/**
 * Demo component showcasing iOS 26 native blur and toolbar features
 * Demonstrates automatic fallback to CSS when native features are unavailable
 */
const NativeBlurDemo = () => {
  const [selectedBlur, setSelectedBlur] = useState('systemMaterial');
  const [showToolbar, setShowToolbar] = useState(true);
  const [blurIntensity, setBlurIntensity] = useState(1.0);

  const {
    isSupported: blurSupported,
    isLoading: blurLoading,
    getAvailableStyles
  } = useNativeBlur();

  const {
    isSupported: toolbarSupported,
    isLoading: toolbarLoading
  } = useFloatingToolbar();

  const [availableStyles, setAvailableStyles] = useState([]);

  useEffect(() => {
    if (blurSupported) {
      getAvailableStyles().then(setAvailableStyles).catch(() => {
        setAvailableStyles(['systemMaterial', 'light', 'dark']);
      });
    } else {
      setAvailableStyles(['light', 'dark', 'tinted']);
    }
  }, [blurSupported, getAvailableStyles]);

  const toolbarItems = [
    {
      type: 'button',
      icon: '🏠',
      title: 'Home',
      action: 'home'
    },
    {
      type: 'flexibleSpace'
    },
    {
      type: 'button',
      icon: '🔍',
      title: 'Search',
      action: 'search'
    },
    {
      type: 'button',
      icon: '⚙️',
      title: 'Settings',
      action: 'settings',
      primary: true
    }
  ];

  const handleToolbarAction = (item, index, action) => {
    console.log('Toolbar action:', { item, index, action });
    alert(`Pressed: ${item.title}`);
  };

  const handleBlurReady = ({ blurId, useNative }) => {
    console.log('Blur ready:', { blurId, useNative });
  };

  if (blurLoading || toolbarLoading) {
    return (
      <LoadingContainer>
        <LoadingText>Initializing Native Features...</LoadingText>
      </LoadingContainer>
    );
  }

  return (
    <DemoContainer>
      <BackgroundContent>
        <ContentGrid>
          {Array.from({ length: 20 }, (_, i) => (
            <ContentCard key={i}>
              <CardTitle>Card {i + 1}</CardTitle>
              <CardText>
                This is sample content to demonstrate the blur effect.
                Native iOS 26 blur creates a beautiful frosted glass appearance.
              </CardText>
            </ContentCard>
          ))}
        </ContentGrid>
      </BackgroundContent>

      <StatusBar>
        <StatusItem>
          Native Blur: {blurSupported ? '✅ Supported' : '❌ CSS Fallback'}
        </StatusItem>
        <StatusItem>
          Native Toolbar: {toolbarSupported ? '✅ Supported' : '❌ CSS Fallback'}
        </StatusItem>
      </StatusBar>

      <ControlsContainer>
        <LiquidGlassBlur
          blurStyle={selectedBlur}
          intensity={blurIntensity}
          floating={true}
          onBlurReady={handleBlurReady}
        >
          <ControlsContent>
            <ControlGroup>
              <ControlLabel>Blur Style</ControlLabel>
              <StyleSelector>
                {availableStyles.map(style => (
                  <StyleButton
                    key={style}
                    active={selectedBlur === style}
                    onClick={() => setSelectedBlur(style)}
                  >
                    {style}
                  </StyleButton>
                ))}
              </StyleSelector>
            </ControlGroup>

            <ControlGroup>
              <ControlLabel>Intensity: {blurIntensity.toFixed(1)}</ControlLabel>
              <IntensitySlider
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={blurIntensity}
                onChange={(e) => setBlurIntensity(parseFloat(e.target.value))}
              />
            </ControlGroup>

            <ControlGroup>
              <ToolbarToggle
                active={showToolbar}
                onClick={() => setShowToolbar(!showToolbar)}
              >
                {showToolbar ? 'Hide Toolbar' : 'Show Toolbar'}
              </ToolbarToggle>
            </ControlGroup>
          </ControlsContent>
        </LiquidGlassBlur>
      </ControlsContainer>

      {showToolbar && (
        <LiquidGlassToolbar
          items={toolbarItems}
          position="bottom"
          floating={true}
          blurStyle={selectedBlur}
          onItemPress={handleToolbarAction}
          visible={showToolbar}
          animated={true}
        />
      )}
    </DemoContainer>
  );
};

export default NativeBlurDemo;
