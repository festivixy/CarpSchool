import React, { useState, useEffect, useRef } from "react";
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
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(true);
  const logTextAreaRef = useRef(null);

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

  // Capture console logs
  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (type, args) => {
      const timestamp = new Date().toLocaleTimeString();
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      }).join(' ');

      setLogs(prev => [...prev.slice(-50), { // Keep last 50 logs
        type,
        timestamp,
        message,
        id: Date.now() + Math.random()
      }]);
    };

    console.log = (...args) => {
      originalLog(...args);
      if (args.some(arg => String(arg).includes('LiquidGlass') || String(arg).includes('useFloating'))) {
        addLog('log', args);
      }
    };

    console.error = (...args) => {
      originalError(...args);
      if (args.some(arg => String(arg).includes('LiquidGlass') || String(arg).includes('useFloating'))) {
        addLog('error', args);
      }
    };

    console.warn = (...args) => {
      originalWarn(...args);
      if (args.some(arg => String(arg).includes('LiquidGlass') || String(arg).includes('useFloating'))) {
        addLog('warn', args);
      }
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Auto-scroll logs
  useEffect(() => {
    if (logTextAreaRef.current) {
      logTextAreaRef.current.scrollTop = logTextAreaRef.current.scrollHeight;
    }
  }, [logs]);

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

  // Log initial environment
  useEffect(() => {
    console.log("[NativeBlurDemo] 🚀 Component mounted - Environment check:", {
      platform: window.cordova ? 'Cordova' : 'Web',
      isCordova: !!window.cordova,
      isMeteorCordova: !!window.Meteor?.isCordova,
      hasFloatingToolbarPlugin: !!window.cordova?.plugins?.floatingToolbar,
      hasLiquidBlurPlugin: !!window.cordova?.plugins?.liquidBlur,
      userAgent: navigator.userAgent,
      toolbarSupported,
      toolbarLoading,
    });
  }, [toolbarSupported, toolbarLoading]);

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
          Native iOS 26 Toolbar: {toolbarSupported ? "✅ Liquid Glass" : "❌ CSS Fallback"}
        </StatusItem>
        <StatusItem>
          Blur Effects: CSS backdrop-filter only
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
            <ControlLabel>Debug Logs</ControlLabel>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <StyleButton
                active={showLogs}
                onClick={() => setShowLogs(!showLogs)}
              >
                {showLogs ? "Hide Logs" : "Show Logs"}
              </StyleButton>
              <StyleButton
                onClick={() => setLogs([])}
              >
                Clear Logs
              </StyleButton>
            </div>

            {showLogs && (
              <div style={{
                width: '100%',
                height: '300px',
                border: '1px solid rgba(0,0,0,0.2)',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'rgba(0,0,0,0.05)',
              }}>
                <textarea
                  ref={logTextAreaRef}
                  readOnly
                  value={logs.map(log =>
                    `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`
                  ).join('\n')}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    background: 'transparent',
                    fontFamily: 'Monaco, Consolas, monospace',
                    fontSize: '11px',
                    padding: '8px',
                    resize: 'none',
                    color: '#333',
                  }}
                  placeholder="Debug logs will appear here..."
                />
              </div>
            )}

            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Total logs: {logs.length} | Toolbar supported: {toolbarSupported ? '✅' : '❌'}
            </div>
          </ControlGroup>

          <ControlGroup>
            <ControlLabel>CSS Blur Demo Areas (Native Blur Disabled)</ControlLabel>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{
                width: '200px',
                height: '100px',
                background: `rgba(255, 255, 255, ${blurIntensity * 0.7})`,
                backdropFilter: `blur(${blurIntensity * 20}px)`,
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>CSS Blur Panel 1</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    CSS backdrop-filter blur
                  </div>
                </div>
              </div>

              <div style={{
                width: '200px',
                height: '100px',
                background: `rgba(255, 255, 255, ${blurIntensity * 0.7})`,
                backdropFilter: `blur(${blurIntensity * 20}px)`,
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>CSS Blur Panel 2</div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    CSS backdrop-filter blur
                  </div>
                </div>
              </div>
            </div>
          </ControlGroup>
        </ControlsContent>
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
          height={60}
        />
      )}
    </DemoContainer>
  );
};

export default NativeBlurDemo;
