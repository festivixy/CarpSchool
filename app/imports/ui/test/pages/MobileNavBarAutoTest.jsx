import React, { useState } from "react";
import { withRouter } from "react-router-dom";
import MobileNavBarAuto from "../../mobile/components/MobileNavBarAuto";
import ErrorBoundary from "../../components/ErrorBoundary";
import {
  Container,
  Content,
  Header,
  Title,
  Subtitle,
  Section,
  SectionTitle,
  SectionContent,
  ComponentContainer,
  EnvironmentInfo,
  InfoCard,
  InfoRow,
  InfoLabel,
  InfoValue,
  ControlsGrid,
  ControlItem,
  Label,
  Select,
  Button,
  NavBarWrapper,
  TestResults,
  LogOutput,
} from "../styles/MobileNavBarAutoTest";

/**
 * Test page for MobileNavBarAuto component
 * Tests automatic environment detection and component switching
 */
const MobileNavBarAutoTest = ({ history }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [testLogs, setTestLogs] = useState([]);
  const [customItems, setCustomItems] = useState([
    {
      id: "test1",
      label: "Test 1",
      icon: "/svg/home.svg",
      action: "navigate",
    },
    {
      id: "test2",
      label: "Test 2",
      icon: "/svg/search.svg",
      action: "navigate",
    },
    {
      id: "test3",
      label: "Test 3",
      icon: "/svg/plus.svg",
      action: "navigate",
    },
  ]);

  // Environment detection info
  const getEnvironmentInfo = () => ({
      hasDevice: !!window.device,
      hasCordova: !!window.cordova,
      platform: window.device?.platform || "Web Browser",
      userAgent: navigator.userAgent,
      isNativeIOS: window.cordova && window.device?.platform?.toLowerCase() === "ios",
    });

  const envInfo = getEnvironmentInfo();

  // Handle navbar item press
  // Note: NativeNavBar calls onItemPress(item, index, action) - item first!
  const handleItemPress = (item, index, action) => {
    try {
      const timestamp = new Date().toLocaleTimeString();
      const itemLabel = item?.label || item?.id || "Unknown Item";
      const logEntry = `[${timestamp}] NavBar item pressed: ${itemLabel} (index: ${index}, action: ${action})`;

      console.log("[MobileNavBarAutoTest] NavBar interaction:", { item, index, action });

      // Safely update state
      if (typeof index === 'number' && index >= 0) {
        setActiveIndex(index);
      }

      setTestLogs(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 logs

    } catch (error) {
      console.error("[MobileNavBarAutoTest] Error in handleItemPress:", error);
      const errorEntry = `[${new Date().toLocaleTimeString()}] ERROR: ${error.message}`;
      setTestLogs(prev => [errorEntry, ...prev.slice(0, 9)]);
    }
  };

  // Debug: Monitor the global action handler
  React.useEffect(() => {
    // Check if global handler is set
    const checkGlobalHandler = () => {
      const hasGlobalHandler = !!window.NativeNavBarActionHandler;
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] Global handler check: ${hasGlobalHandler ? 'SET' : 'NOT SET'}`;
      setTestLogs(prev => [logEntry, ...prev.slice(0, 9)]);

      if (hasGlobalHandler) {
        console.log("[MobileNavBarAutoTest] ✅ Global handler found:", window.NativeNavBarActionHandler);
      } else {
        console.log("[MobileNavBarAutoTest] ❌ No global handler found");
      }
    };

    // Initial check
    checkGlobalHandler();

    // Monitor for changes every 2 seconds
    const interval = setInterval(checkGlobalHandler, 2000);

    // Override the global handler to add our own logging
    const originalHandler = window.NativeNavBarActionHandler;
    window.NativeNavBarActionHandler = function(navBarId, action, itemIndex) {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = `[${timestamp}] NATIVE CALL: navBarId=${navBarId}, action=${action}, itemIndex=${itemIndex}`;
      console.log("[MobileNavBarAutoTest] 🔥 Native action handler called!", { navBarId, action, itemIndex });

      // Update test logs
      setTestLogs(prev => [logEntry, ...prev.slice(0, 9)]);

      // Call original handler if it exists
      if (originalHandler && typeof originalHandler === 'function') {
        originalHandler(navBarId, action, itemIndex);
      }
    };

    return () => {
      clearInterval(interval);
      // Restore original handler
      if (originalHandler) {
        window.NativeNavBarActionHandler = originalHandler;
      }
    };
  }, []);

  // Simulate environment changes for testing
  const simulateEnvironment = (type) => {
    const timestamp = new Date().toLocaleTimeString();
    let logEntry = "";

    switch (type) {
      case "ios":
        // Simulate iOS Cordova environment
        window.cordova = { version: "12.0.0" };
        window.device = { platform: "iOS", version: "17.0" };
        logEntry = `[${timestamp}] Simulated iOS Cordova environment`;
        break;
      case "android":
        // Simulate Android Cordova environment
        window.cordova = { version: "12.0.0" };
        window.device = { platform: "Android", version: "13.0" };
        logEntry = `[${timestamp}] Simulated Android Cordova environment`;
        break;
      case "web":
        // Simulate web browser environment
        delete window.cordova;
        delete window.device;
        logEntry = `[${timestamp}] Simulated Web Browser environment`;
        break;
      default:
        logEntry = `[${timestamp}] Unknown environment type`;
    }

    setTestLogs(prev => [logEntry, ...prev.slice(0, 9)]);

    // Force re-render by updating state
    setActiveIndex(prev => prev);
  };

  const clearLogs = () => {
    setTestLogs([]);
  };

  return (
    <Container>
      <Content>
        <Header>
          <Title>MobileNavBarAuto Test Page</Title>
          <Subtitle>
            Tests automatic environment detection and component switching
          </Subtitle>
        </Header>

        <Section>
          <SectionTitle>Environment Detection</SectionTitle>
          <SectionContent>
            <EnvironmentInfo>
              <InfoCard>
                <InfoRow>
                  <InfoLabel>Platform:</InfoLabel>
                  <InfoValue>{envInfo.platform}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Has Cordova:</InfoLabel>
                  <InfoValue>{envInfo.hasCordova ? "Yes" : "No"}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Has Device:</InfoLabel>
                  <InfoValue>{envInfo.hasDevice ? "Yes" : "No"}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Is Native iOS:</InfoLabel>
                  <InfoValue>{envInfo.isNativeIOS ? "Yes" : "No"}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Expected Component:</InfoLabel>
                  <InfoValue>
                    {envInfo.isNativeIOS ? "NativeNavBar" : "MobileNavBarCSS"}
                  </InfoValue>
                </InfoRow>
              </InfoCard>
            </EnvironmentInfo>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>Test Controls</SectionTitle>
          <SectionContent>
            <ControlsGrid>
              <ControlItem>
                <Label>Simulate Environment:</Label>
                <div>
                  <Button onClick={() => simulateEnvironment("ios")}>
                    iOS Cordova
                  </Button>
                  <Button onClick={() => simulateEnvironment("android")}>
                    Android Cordova
                  </Button>
                  <Button onClick={() => simulateEnvironment("web")}>
                    Web Browser
                  </Button>
                </div>
              </ControlItem>
              <ControlItem>
                <Label>Active Tab Index:</Label>
                <Select
                  value={activeIndex}
                  onChange={(e) => setActiveIndex(parseInt(e.target.value))}
                >
                  <option value={0}>Tab 0</option>
                  <option value={1}>Tab 1</option>
                  <option value={2}>Tab 2</option>
                  <option value={3}>Tab 3</option>
                  <option value={4}>Tab 4</option>
                </Select>
              </ControlItem>
              <ControlItem>
                <Label>Test Logs:</Label>
                <Button onClick={clearLogs}>Clear Logs</Button>
              </ControlItem>
              <ControlItem>
                <Label>Manual Native Test:</Label>
                <div>
                  <Button onClick={() => {
                    if (window.NativeNavBarActionHandler) {
                      window.NativeNavBarActionHandler("test-navbar", "navigate", 0);
                    } else {
                      const logEntry = `[${new Date().toLocaleTimeString()}] No global handler to test`;
                      setTestLogs(prev => [logEntry, ...prev.slice(0, 9)]);
                    }
                  }}>
                    Test Global Handler
                  </Button>
                  <Button onClick={() => {
                    const hasPlugin = !!window.cordova?.plugins?.NativeNavBar;
                    const logEntry = `[${new Date().toLocaleTimeString()}] Plugin check: ${hasPlugin ? 'AVAILABLE' : 'NOT FOUND'}`;
                    setTestLogs(prev => [logEntry, ...prev.slice(0, 9)]);
                    console.log("[Test] Plugin status:", {
                      hasCordova: !!window.cordova,
                      hasPlugin,
                      pluginMethods: window.cordova?.plugins?.NativeNavBar ? Object.keys(window.cordova.plugins.NativeNavBar) : 'N/A'
                    });
                  }}>
                    Check Plugin
                  </Button>
                </div>
              </ControlItem>
            </ControlsGrid>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>MobileNavBarAuto Component</SectionTitle>
          <SectionContent>
            <ComponentContainer>
              <NavBarWrapper>
                <ErrorBoundary
                  title="NavBar Component Error"
                  message="The navbar component encountered an error during testing"
                  showDetails={true}
                  showRetry={true}
                  showReport={false}
                  variant="minimal"
                  onError={(error, errorInfo, errorId) => {
                    const errorEntry = `[${new Date().toLocaleTimeString()}] ERROR: ${error.message} (ID: ${errorId})`;
                    setTestLogs(prev => [errorEntry, ...prev.slice(0, 9)]);
                  }}
                  onRetry={() => {
                    const retryEntry = `[${new Date().toLocaleTimeString()}] User clicked retry - reloading navbar`;
                    setTestLogs(prev => [retryEntry, ...prev.slice(0, 9)]);
                  }}
                >
                  <MobileNavBarAuto
                    history={history}
                    activeIndex={activeIndex}
                    onItemPress={handleItemPress}
                  />
                </ErrorBoundary>
              </NavBarWrapper>
            </ComponentContainer>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>Test Results</SectionTitle>
          <SectionContent>
            <TestResults>
              <Label>Event Logs (Latest 10):</Label>
              <LogOutput>
                {testLogs.length === 0 ? (
                  <div>No events logged yet. Interact with the navbar to see logs.</div>
                ) : (
                  testLogs.map((log, index) => (
                    <div key={index}>{log}</div>
                  ))
                )}
              </LogOutput>
            </TestResults>
          </SectionContent>
        </Section>

        <Section>
          <SectionTitle>Usage Instructions</SectionTitle>
          <SectionContent>
            <InfoCard>
              <p><strong>How to test:</strong></p>
              <ol>
                <li>Check the "Environment Detection" section to see current environment</li>
                <li>Use "Simulate Environment" buttons to test different scenarios</li>
                <li>Interact with the navbar above to test functionality</li>
                <li>Check console logs for detailed debug information</li>
                <li>Verify that the correct component is being used based on environment</li>
              </ol>

              <p><strong>Expected Behavior:</strong></p>
              <ul>
                <li><strong>iOS Cordova:</strong> Should use NativeNavBar with native UITabBar</li>
                <li><strong>Web Browser:</strong> Should use MobileNavBarCSS with styled-components</li>
                <li><strong>Android Cordova:</strong> Should use MobileNavBarCSS (fallback)</li>
              </ul>

              <p><strong>Debug Info:</strong></p>
              <ul>
                <li>Check browser console for "[MobileNavBarAuto]" logs</li>
                <li>Environment detection info is logged on each render</li>
                <li>Component selection reasoning is logged</li>
              </ul>
            </InfoCard>
          </SectionContent>
        </Section>
      </Content>
    </Container>
  );
};

export default withRouter(MobileNavBarAutoTest);
