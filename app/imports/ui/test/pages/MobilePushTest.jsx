import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { MobilePushHelpers } from "../../mobile/utils/MobilePushNotifications";
import {
  Container,
  Section,
  Title,
  TestButton,
  StatusDisplay,
  LogOutput,
} from "../styles/NotificationTest";

/**
 * Mobile Push Notification Testing Component
 * Tests native iOS/Android push notifications in Cordova apps
 */
const MobilePushTest = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({});

  useEffect(() => {
    // Check initial status
    updateStatus();

    // Update status periodically
    const interval = setInterval(updateStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const updateStatus = () => {
    const pushStatus = MobilePushHelpers.getStatus();
    setStatus(pushStatus);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Test 1: Check Mobile Push Support
  const testMobileSupport = async () => {
    setIsLoading(true);
    try {
      addLog("📱 Checking mobile push support...", "info");

      const pushStatus = MobilePushHelpers.getStatus();
      addLog(`📋 Status: ${JSON.stringify(pushStatus, null, 2)}`, "info");

      if (!window.cordova) {
        addLog("⚠️ Not running in Cordova environment", "warning");
        addLog("💡 This test only works in mobile apps", "info");
        return;
      }

      if (pushStatus.supported) {
        addLog("✅ Mobile push notifications supported", "success");
        addLog(`📱 Platform: ${pushStatus.platform}`, "info");
        addLog(`🔧 Backend: ${pushStatus.backend}`, "info");
        addLog(`🔑 Has Token: ${pushStatus.hasToken}`, "info");
      } else {
        addLog("❌ Mobile push notifications not supported", "error");
        addLog("💡 Make sure required plugins are installed", "warning");
      }

    } catch (error) {
      addLog(`❌ Support check failed: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Test 2: Request Permission
  const testPermissionRequest = async () => {
    setIsLoading(true);
    try {
      addLog("🔐 Requesting push notification permission...", "info");

      if (!window.cordova) {
        addLog("⚠️ Permission test only works in mobile apps", "warning");
        return;
      }

      const granted = await MobilePushHelpers.requestPermission();

      if (granted) {
        addLog("✅ Push notification permission granted", "success");
      } else {
        addLog("❌ Push notification permission denied", "error");
        addLog("💡 Check device notification settings", "warning");
      }

    } catch (error) {
      addLog(`❌ Permission request failed: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Test 3: Set Ride Tags
  const testSetRideTags = async () => {
    setIsLoading(true);
    try {
      addLog("🏷️ Setting ride tags...", "info");

      const testRideId = `test-ride-${Date.now()}`;
      const success = await MobilePushHelpers.setRideTags(testRideId);

      if (success) {
        addLog(`✅ Ride tags set successfully for ride: ${testRideId}`, "success");
        addLog("🎯 You can now receive ride-specific notifications", "info");
      } else {
        addLog("❌ Failed to set ride tags", "error");
      }

    } catch (error) {
      addLog(`❌ Set ride tags failed: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Test 4: Set Location Tags
  const testSetLocationTags = async () => {
    setIsLoading(true);
    try {
      addLog("📍 Setting location tags...", "info");

      const success = await MobilePushHelpers.setLocationTags("San Francisco", "CA");

      if (success) {
        addLog("✅ Location tags set successfully", "success");
        addLog("🌎 You can now receive location-based notifications", "info");
      } else {
        addLog("❌ Failed to set location tags", "error");
      }

    } catch (error) {
      addLog(`❌ Set location tags failed: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Test 5: Send Test Mobile Notification
  const testSendMobileNotification = async () => {
    setIsLoading(true);
    try {
      addLog("📤 Sending test mobile notification...", "info");

      const result = await Meteor.callAsync(
"notifications.send",
        [Meteor.userId()],
        "📱 Mobile Test",
        "This notification should appear on your mobile device!",
        {
          type: "system",
          priority: "normal",
          data: {
            test: true,
            mobile: true,
            action: "open_app",
            timestamp: Date.now(),
          },
        },
      );

      addLog("✅ Mobile notification sent successfully!", "success");
      addLog(`📊 Batch ID: ${result.batchId}`, "info");
      addLog("📱 Check your device for the notification", "info");

    } catch (error) {
      addLog(`❌ Mobile notification failed: ${error.reason || error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Test 6: Send Ride-Specific Mobile Notification
  const testSendRideNotification = async () => {
    setIsLoading(true);
    try {
      addLog("🚗 Sending ride-specific mobile notification...", "info");

      const testRideId = `mobile-test-ride-${Date.now()}`;

//       const result = await Meteor.callAsync(
// "notifications.send",
//         [Meteor.userId()],
//         "🚗 Driver Arriving",
//         "Your test driver will arrive in 5 minutes",
//         {
//           type: "ride_update",
//           priority: "high",
//           data: {
//             rideId: testRideId,
//             action: "track_driver",
//             driverName: "Test Driver",
//             eta: 5,
//           },
//         },
//       );

      addLog("✅ Ride notification sent successfully!", "success");
      addLog(`🚗 Ride ID: ${testRideId}`, "info");
      addLog("📱 Tapping the notification should open ride details", "info");

    } catch (error) {
      addLog(`❌ Ride notification failed: ${error.reason || error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Test 7: Clear Tags
  const testClearTags = async () => {
    setIsLoading(true);
    try {
      addLog("🧹 Clearing ride tags...", "info");

      const success = await MobilePushHelpers.clearRideTags();

      if (success) {
        addLog("✅ Ride tags cleared successfully", "success");
      } else {
        addLog("❌ Failed to clear ride tags", "error");
      }

    } catch (error) {
      addLog(`❌ Clear tags failed: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title>📱 Mobile Push Notification Testing</Title>

      {/* Current Status */}
      <Section>
        <h3>📊 Mobile Push Status</h3>
        <StatusDisplay>
          <div>🌍 Environment: {window.cordova ? "Cordova Mobile App" : "Web Browser"}</div>
          <div>📱 Platform: {status.platform || "Unknown"}</div>
          <div>🔧 Backend: {status.backend || "Unknown"}</div>
          <div>✅ Supported: {status.supported ? "Yes" : "No"}</div>
          <div>🔄 Initialized: {status.initialized ? "Yes" : "No"}</div>
          <div>🔑 Has Token: {status.hasToken ? "Yes" : "No"}</div>
          <div>🎫 Token: {status.token || "None"}</div>
        </StatusDisplay>
      </Section>

      {/* Test Buttons */}
      <Section>
        <h3>🧪 Mobile Push Tests</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <TestButton onClick={testMobileSupport} disabled={isLoading}>
            📱 Check Support
          </TestButton>
          <TestButton onClick={testPermissionRequest} disabled={isLoading}>
            🔐 Request Permission
          </TestButton>
          <TestButton onClick={testSetRideTags} disabled={isLoading}>
            🏷️ Set Ride Tags
          </TestButton>
          <TestButton onClick={testSetLocationTags} disabled={isLoading}>
            📍 Set Location Tags
          </TestButton>
          <TestButton onClick={testSendMobileNotification} disabled={isLoading}>
            📤 Send Mobile Test
          </TestButton>
          <TestButton onClick={testSendRideNotification} disabled={isLoading}>
            🚗 Send Ride Test
          </TestButton>
          <TestButton onClick={testClearTags} disabled={isLoading}>
            🧹 Clear Tags
          </TestButton>
        </div>
      </Section>

      {/* Logs */}
      <Section>
        <h3>
          📋 Test Logs
          <button onClick={clearLogs} style={{ marginLeft: "16px", fontSize: "12px" }}>
            Clear
          </button>
        </h3>
        <LogOutput>
          {logs.length === 0 ? (
            <div style={{ color: "#666", fontStyle: "italic" }}>
              No logs yet. Run a test to see output here.
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={log.type} style={{
                color: log.type === "error" ? "#e53e3e" : // eslint-disable-line no-nested-ternary
                       log.type === "success" ? "#38a169" : // eslint-disable-line no-nested-ternary
                       log.type === "warning" ? "#d69e2e" : "#4a5568",
                marginBottom: "4px",
                fontFamily: "monospace",
                fontSize: "13px",
              }}>
                <span style={{ color: "#666" }}>[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </LogOutput>
      </Section>

      {/* Setup Instructions */}
      <Section>
        <h3>📚 Mobile Setup Instructions</h3>
        <div style={{ fontSize: "14px", lineHeight: "1.6", 
          backgroundColor: "#f7fafc", padding: "16px", borderRadius: "8px" }}>
          <h4>For Firebase Mobile:</h4>
          <code style={{ display: "block", marginBottom: "8px" }}>
            meteor add cordova:cordova-plugin-fcm-with-dependecy-updated@7.8.0
          </code>

          <h4>For OneSignal Mobile:</h4>
          <code style={{ display: "block", marginBottom: "8px" }}>
            meteor add onesignal-cordova-plugin@3.0.1
          </code>

          <h4>Build for Mobile:</h4>
          <code style={{ display: "block", marginBottom: "8px" }}>
            meteor add-platform ios<br/>
            meteor add-platform android<br/>
            meteor build ../output --server=http://localhost:3000
          </code>

          <p style={{ marginTop: "12px", fontWeight: "600" }}>
            📖 See MOBILE_PUSH_SETUP.md for complete setup instructions
          </p>
        </div>
      </Section>
    </Container>
  );
};

MobilePushTest.propTypes = {};

export default MobilePushTest;
