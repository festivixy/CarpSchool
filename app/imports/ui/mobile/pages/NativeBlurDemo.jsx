import React, { useState, useEffect } from "react";
import LiquidGlassBlur from "../liquidGlass/components/LiquidGlassBlur";
import LiquidGlassToolbar from "../liquidGlass/components/LiquidGlassToolbar";
import { useNativeBlur, useFloatingToolbar } from "../hooks/useNativeBlur";
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
} from "../styles/NativeBlurDemo";

/**
 * Demo component showcasing iOS 26 native blur and toolbar features
 * Demonstrates automatic fallback to CSS when native features are unavailable
 */
const NativeBlurDemo = () => {
  const [selectedBlur, setSelectedBlur] = useState("systemMaterial");
  const [showToolbar, setShowToolbar] = useState(true);
  const [blurIntensity, setBlurIntensity] = useState(1.0);

  const {
    isSupported: blurSupported,
    isLoading: blurLoading,
    getAvailableStyles,
  } = useNativeBlur();

  const {
    isSupported: toolbarSupported,
    isLoading: toolbarLoading,
  } = useFloatingToolbar();

  const [availableStyles, setAvailableStyles] = useState([]);

  useEffect(() => {
    if (blurSupported) {
      getAvailableStyles().then(setAvailableStyles).catch(() => {
        setAvailableStyles(["systemMaterial", "light", "dark"]);
      });
    } else {
      setAvailableStyles(["light", "dark", "tinted"]);
    }
  }, [blurSupported, getAvailableStyles]);

  const toolbarItems = [
    {
      type: "button",
      icon: "🏠",
      title: "Home",
      action: "home",
    },
    {
      type: "flexibleSpace",
    },
    {
      type: "button",
      icon: "🔍",
      title: "Search",
      action: "search",
    },
    {
      type: "button",
      icon: "⚙️",
      title: "Settings",
      action: "settings",
      primary: true,
    },
  ];

  const handleToolbarAction = (item, index, action) => {
    console.log("Toolbar action:", { item, index, action });
    alert(`Pressed: ${item.title}`);
  };

  const handleBlurReady = ({ blurId, useNative }) => {
    console.log("Blur ready:", { blurId, useNative });
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
          Native Blur: {blurSupported ? "✅ Supported" : "❌ CSS Fallback"}
        </StatusItem>
        <StatusItem>
          Native Toolbar: {toolbarSupported ? "✅ Supported" : "❌ CSS Fallback"}
        </StatusItem>
      </StatusBar>

      <ControlsContainer>
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
              {showToolbar ? "Hide Toolbar" : "Show Toolbar"}
            </ToolbarToggle>
          </ControlGroup>

          <ControlGroup>
            <ControlLabel>Native Blur Demo Areas</ControlLabel>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <LiquidGlassBlur
                blurStyle={selectedBlur}
                intensity={blurIntensity}
                floating={true}
                position="relative"
                onBlurReady={handleBlurReady}
                style={{ width: '200px', height: '100px' }}
              >
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Demo Panel 1</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    Native blur behind this panel
                  </div>
                </div>
              </LiquidGlassBlur>

              <LiquidGlassBlur
                blurStyle={selectedBlur}
                intensity={blurIntensity}
                floating={true}
                position="relative"
                style={{ width: '200px', height: '100px' }}
              >
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Demo Panel 2</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    Native blur behind this panel
                  </div>
                </div>
              </LiquidGlassBlur>
            </div>
          </ControlGroup>
        </ControlsContent>
      </ControlsContainer>

      {showToolbar && (
        <div style={{
          position: 'fixed',
          bottom: '120px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000
        }}>
          <LiquidGlassBlur
            blurStyle={selectedBlur}
            intensity={blurIntensity}
            floating={true}
            position="relative"
            style={{ width: '300px', height: '60px' }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              padding: '8px 16px',
              height: '100%'
            }}>
              {toolbarItems.filter(item => item.type === 'button').map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleToolbarAction(item, index, item.action)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '20px',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '8px',
                    transition: 'background 0.2s',
                  }}
                  onMouseOver={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseOut={(e) => e.target.style.background = 'none'}
                  title={item.title}
                >
                  {item.icon}
                </button>
              ))}
            </div>
          </LiquidGlassBlur>
        </div>
      )}
    </DemoContainer>
  );
};

export default NativeBlurDemo;
