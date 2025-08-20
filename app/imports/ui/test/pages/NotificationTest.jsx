import React, { useState } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import { Notifications, PushTokens } from "../../../api/notifications/Notifications";
import { NotificationHelpers, notificationManager } from "../../utils/notifications";
import { OneSignalHelpers, oneSignalManager } from "../../utils/oneSignalNotifications";
import {
  Container,
  Section,
  Title,
  TestButton,
  StatusDisplay,
  LogOutput,
  FormGroup,
  Input,
  Select,
  TextArea
} from "../styles/NotificationTest";

/**
 * Notification Testing Component
 * Quick testing interface for push notifications
 */
const NotificationTest = ({ currentUser, notifications, pushTokens, ready }) => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testForm, setTestForm] = useState({
    title: 'Test Notification',
    body: 'This is a test push notification!',
    type: 'system',
    priority: 'normal',
    targetUser: ''
  });

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = async () => {
    try {
      const logText = logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n');

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(logText);
        addLog('📋 Logs copied to clipboard!', 'success');
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = logText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        addLog('📋 Logs copied to clipboard (fallback method)!', 'success');
      }
    } catch (error) {
      addLog(`❌ Failed to copy logs: ${error.message}`, 'error');

      // Show logs in a new window as fallback
      const logText = logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n');
      const newWindow = window.open('', '_blank');
      newWindow.document.write(`<pre style="font-family: monospace; white-space: pre-wrap;">${logText}</pre>`);
      addLog('📋 Logs opened in new window (copy manually)', 'info');
    }
  };

  // Test 1: Register Push Token
  const testTokenRegistration = async () => {
    setIsLoading(true);
    try {
      addLog('🔧 Testing push token registration...', 'info');

      const testToken = `test-token-${Date.now()}`;
      const platform = 'web';
      const deviceInfo = {
        model: 'Browser Test',
        version: navigator.userAgent
      };

      const tokenId = await Meteor.callAsync(
        'notifications.registerPushToken',
        testToken,
        platform,
        deviceInfo
      );

      addLog(`✅ Token registered successfully: ${tokenId}`, 'success');
      addLog(`📱 Token: ${testToken}`, 'info');

    } catch (error) {
      addLog(`❌ Token registration failed: ${error.reason || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test 2: Send Self Notification
  const testSelfNotification = async () => {
    setIsLoading(true);
    try {
      addLog('📤 Sending notification to self...', 'info');

      const result = await Meteor.callAsync(
        'notifications.send',
        [Meteor.userId()],
        testForm.title,
        testForm.body,
        {
          type: testForm.type,
          priority: testForm.priority,
          data: { test: true, timestamp: Date.now() }
        }
      );

      addLog(`✅ Notification sent successfully!`, 'success');
      addLog(`📊 Batch ID: ${result.batchId}`, 'info');
      addLog(`📝 ${result.notificationIds.length} notification(s) created`, 'info');

    } catch (error) {
      addLog(`❌ Send failed: ${error.reason || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test 3: Debug Ride Notification Setup (Client-side)
  const debugRideNotification = async () => {
    setIsLoading(true);
    try {
      addLog('🔍 Debugging ride notification setup...', 'info');

      // Get current user info
      const currentUser = Meteor.user();
      addLog(`👤 Current user: ${currentUser?.username || 'Unknown'} (${currentUser?._id || 'No ID'})`, 'info');
      addLog(`🔑 User roles: [${currentUser?.roles?.join(', ') || 'None'}]`, 'info');

      // Get user's rides
      const rides = await Meteor.callAsync('rides.getUserRides') || [];
      addLog(`📋 Found ${rides.length} rides for current user`, 'info');

      if (rides.length === 0) {
        addLog('⚠️ No rides found. Create a ride first to test ride notifications.', 'warning');
        addLog('💡 Go to the rides page and create a ride, or join an existing ride', 'info');
        return;
      }

      const testRide = rides[0];
      addLog(`🎯 Using ride: ${testRide._id}`, 'info');
      addLog(`  📅 Date: ${new Date(testRide.date).toLocaleDateString()}`, 'info');
      addLog(`  🚗 Driver: ${testRide.driver}`, 'info');
      addLog(`  👥 Riders: [${testRide.riders?.join(', ') || 'None'}]`, 'info');
      addLog(`  🎯 From: ${testRide.origin} → To: ${testRide.destination}`, 'info');

      // Analyze permissions
      const isDriver = testRide.driver === currentUser?.username;
      const isRider = testRide.riders?.includes(currentUser?.username);
      const isAdmin = currentUser?.roles?.includes('admin');

      addLog(`🔑 Permissions analysis:`, 'info');
      addLog(`  - Is Driver: ${isDriver} (${testRide.driver} === ${currentUser?.username})`, isDriver ? 'success' : 'info');
      addLog(`  - Is Rider: ${isRider}`, isRider ? 'success' : 'info');
      addLog(`  - Is Admin: ${isAdmin}`, isAdmin ? 'success' : 'info');

      const hasPermission = isDriver || isRider || isAdmin;
      addLog(`  - Can send notifications: ${hasPermission}`, hasPermission ? 'success' : 'error');

      if (!hasPermission) {
        addLog('❌ No permission to send notifications for this ride', 'error');
        addLog('💡 You must be the driver, a rider, or an admin to send ride notifications', 'warning');
        return;
      }

      // Show who would receive notifications
      const allParticipants = [testRide.driver, ...(testRide.riders || [])];
      const recipients = allParticipants.filter(username => username !== currentUser?.username);

      addLog(`📬 Notification recipients:`, 'info');
      addLog(`  - All participants: [${allParticipants.join(', ')}]`, 'info');
      addLog(`  - Will send to: [${recipients.join(', ')}] (excluding sender)`, 'info');

      if (recipients.length === 0) {
        addLog('⚠️ No recipients! You are the only participant in this ride.', 'warning');
        addLog('💡 Add riders to the ride to test notifications', 'info');
      } else {
        addLog(`✅ Ready to send notifications to ${recipients.length} recipient(s)`, 'success');
      }

    } catch (error) {
      addLog(`❌ Debug failed: ${error.reason || error.message}`, 'error');
      addLog('💡 Try refreshing the page or check browser console for more details', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  // Test 4: Test Ride Notification (if user has rides)
  const testRideNotification = async () => {
    setIsLoading(true);
    try {
      addLog('🚗 Testing ride notification...', 'info');

      // Get user's first ride for testing
      const rides = await Meteor.callAsync('rides.getUserRides') || [];

      if (rides.length === 0) {
        addLog('⚠️ No rides found. Create a ride first to test ride notifications.', 'warning');
        return;
      }

      const testRide = rides[0];
      addLog(`��� Using ride: ${testRide._id}`, 'info');

      const result = await Meteor.callAsync(
        'notifications.sendToRideParticipants',
        testRide._id,
        'Test Ride Notification',
        'This is a test notification for your ride',
        {
          type: 'ride_update',
          priority: 'normal',
          action: 'view_ride'
        }
      );

      addLog(`✅ Ride notification sent!`, 'success');
      addLog(`📊 Batch ID: ${result.batchId}`, 'info');

    } catch (error) {
      addLog(`❌ Ride notification failed: ${error.reason || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test 4: Check Notification Status
  const checkNotificationStatus = async () => {
    setIsLoading(true);
    try {
      addLog('📊 Checking notification status...', 'info');

      // Get user's notifications
      const userNotifications = await Meteor.callAsync('notifications.getUserNotifications') || notifications;
      const unreadCount = userNotifications.filter(n => n.status !== 'read').length;

      addLog(`📬 Total notifications: ${userNotifications.length}`, 'info');
      addLog(`🔔 Unread notifications: ${unreadCount}`, 'info');

      // Get push tokens
      const userTokens = pushTokens || [];
      addLog(`📱 Active push tokens: ${userTokens.length}`, 'info');

      userTokens.forEach((token, index) => {
        const tokenValue = token.token || token.playerId || token._id || 'No token';
        const displayToken = typeof tokenValue === 'string' && tokenValue.length > 20
          ? tokenValue.substring(0, 20) + '...'
          : tokenValue;
        addLog(`  ${index + 1}. ${token.platform || 'Unknown'} - ${displayToken}`, 'info');
      });

      // Get service status if admin
      if (currentUser?.roles?.includes('admin')) {
        try {
          const stats = await Meteor.callAsync('notifications.getStats');
          addLog(`📈 System stats:`, 'info');
          addLog(`  Total: ${stats.total}, Last 24h: ${stats.last24Hours}`, 'info');
          addLog(`  Active tokens: ${stats.activeTokens}`, 'info');
        } catch (adminError) {
          addLog(`⚠️ Could not get admin stats: ${adminError.message}`, 'warning');
        }
      }

    } catch (error) {
      addLog(`❌ Status check failed: ${error.reason || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test 5: OneSignal Registration
  const testOneSignalRegistration = async () => {
    setIsLoading(true);
    try {
      addLog('🔔 Testing OneSignal registration...', 'info');

      // Check OneSignal support
      const isSupported = oneSignalManager.isSupported;
      const playerId = oneSignalManager.getPlayerId();

      addLog(`🌐 OneSignal supported: ${isSupported}`, 'info');
      addLog(`📱 Current player ID: ${playerId || 'None'}`, 'info');

      if (!isSupported) {
        addLog('⚠�� OneSignal not supported or not loaded', 'warning');
        return;
      }

      // Request permission if needed
      const isEnabled = await oneSignalManager.isEnabled();
      if (!isEnabled) {
        addLog('🔔 Requesting OneSignal permission...', 'info');
        const granted = await OneSignalHelpers.requestPermissionWithPrompt();
        addLog(`${granted ? '✅' : '❌'} OneSignal permission ${granted ? 'granted' : 'denied'}`,
               granted ? 'success' : 'error');
      } else {
        addLog('✅ OneSignal permission already granted', 'success');
      }

      // Test registration with server
      if (playerId) {
        try {
          await Meteor.callAsync('notifications.registerOneSignalPlayer', playerId, { test: true });
          addLog('✅ OneSignal player registered with server', 'success');
        } catch (error) {
          addLog(`❌ Server registration failed: ${error.reason || error.message}`, 'error');
        }
      }

    } catch (error) {
      addLog(`❌ OneSignal test failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test 6: OneSignal Test Notification
  const testOneSignalNotification = async () => {
    setIsLoading(true);
    try {
      addLog('🚀 Sending OneSignal test notification...', 'info');

      const success = await OneSignalHelpers.sendTestNotification();

      if (success) {
        addLog('✅ OneSignal test notification sent successfully!', 'success');
      } else {
        addLog('❌ OneSignal test notification failed', 'error');
      }

    } catch (error) {
      addLog(`❌ OneSignal test failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test 7: Permission and Manager Status
  const checkPermissions = async () => {
    setIsLoading(true);
    try {
      addLog('��� Checking notification permissions...', 'info');

      // Detect iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      const isIOSSafari = isIOS && isSafari;

      if (isIOSSafari) {
        addLog('📱 iOS Safari detected', 'info');
      }

      // Check secure context
      const isSecure = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
      addLog(`🔒 Secure context: ${isSecure ? 'Yes' : 'No'} (${location.protocol}//${location.hostname})`, isSecure ? 'success' : 'error');

      if (!isSecure) {
        addLog('❌ Push notifications require HTTPS or localhost', 'error');
        addLog('💡 Solutions: Use ngrok, Chrome flags, or access via localhost', 'warning');
        return;
      }

      // Check browser permission with iOS Safari handling
      if (typeof Notification !== 'undefined') {
        addLog(`🌐 Browser permission: ${Notification.permission}`, 'info');

        if (isIOSSafari) {
          // iOS Safari specific checks
          addLog('📱 iOS Safari notification support:', 'info');

          // Check if running as PWA
          const isPWA = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
          addLog(`  - PWA mode: ${isPWA ? 'Yes' : 'No'}`, isPWA ? 'success' : 'warning');

          if (!isPWA) {
            addLog('💡 iOS Safari: Notifications work best when added to Home Screen (PWA)', 'warning');
            addLog('💡 Or use OneSignal which has better iOS Safari support', 'info');
          }

          // Check iOS version (rough estimate)
          const iosVersion = navigator.userAgent.match(/OS (\d+)_/);
          if (iosVersion) {
            const version = parseInt(iosVersion[1]);
            addLog(`  - iOS version: ~${version}`, version >= 12 ? 'success' : 'warning');
            if (version < 12) {
              addLog('⚠️ iOS 12+ recommended for better notification support', 'warning');
            }
          }
        }
      } else {
        addLog('❌ Notification API not supported in this browser', 'error');
        if (isIOSSafari) {
          addLog('💡 iOS Safari: Try adding to Home Screen or use OneSignal integration', 'info');
        }
      }

      // Check notification manager status
      addLog(`📱 Manager supported: ${notificationManager.isSupported}`, 'info');
      addLog(`✅ Manager enabled: ${notificationManager.isEnabled()}`, 'info');
      addLog(`🔑 Has permission: ${notificationManager.hasPermission}`, 'info');

      const currentToken = notificationManager.getToken();
      if (currentToken) {
        addLog(`📱 Current token: ${currentToken.substring(0, 30)}...`, 'info');
      } else {
        addLog(`⚠️ No active token`, 'warning');
      }

      // Try to request permission (must be synchronous from user action)
      if (!notificationManager.hasPermission) {
        addLog('🔔 Requesting notification permission...', 'info');
        try {
          const granted = await notificationManager.requestPermission();
          addLog(`${granted ? '✅' : '❌'} Permission ${granted ? 'granted' : 'denied'}`,
                 granted ? 'success' : 'error');
        } catch (permError) {
          addLog(`❌ Permission request failed: ${permError.message}`, 'error');
          addLog('💡 Try clicking "Check Permissions" again - permission must be from direct user action', 'warning');
        }
      }

    } catch (error) {
      addLog(`❌ Permission check failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Dedicated permission request (must be from direct user action)
  const requestNotificationPermission = async () => {
    setIsLoading(true);
    try {
      addLog('🔔 Requesting notification permission...', 'info');

      if (typeof Notification === 'undefined') {
        addLog('❌ Notifications not supported in this browser', 'error');
        return;
      }

      // Direct permission request from user action
      const permission = Notification.requestPermission();
      const result = await (permission.then ? permission : Promise.resolve(permission));

      addLog(`${result === 'granted' ? '✅' : '❌'} Permission ${result}`,
             result === 'granted' ? 'success' : 'error');

      if (result === 'granted') {
        addLog('🎉 You can now receive push notifications!', 'success');
        // Update manager state
        notificationManager.hasPermission = true;
      } else if (result === 'denied') {
        addLog('💡 To enable notifications, go to browser settings and allow notifications for this site', 'warning');
      }

    } catch (error) {
      addLog(`❌ Permission request failed: ${error.message}`, 'error');
      addLog('💡 Permission requests must come from direct user interactions (button clicks)', 'warning');
    } finally {
      setIsLoading(false);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const result = await Meteor.callAsync('notifications.markAllAsRead');
      addLog(`✅ Marked ${result} notifications as read`, 'success');
    } catch (error) {
      addLog(`❌ Mark as read failed: ${error.reason || error.message}`, 'error');
    }
  };

  const handleFormChange = (field, value) => {
    setTestForm(prev => ({ ...prev, [field]: value }));
  };

  if (!ready) {
    return <Container><div>Loading...</div></Container>;
  }

  return (
    <Container>
      <Title>🧪 Push Notification Testing</Title>

      {/* Current Status */}
      <Section>
        <h3>📊 Current Status</h3>
        <StatusDisplay>
          <div>👤 User: {currentUser?.username || 'Not logged in'}</div>
          <div>🔔 Notifications: {notifications.length} total, {notifications.filter(n => n.status !== 'read').length} unread</div>
          <div>📱 Push Tokens: {pushTokens.length} active</div>
          <div>🌐 Browser Permission: {(() => {
            if (typeof Notification === 'undefined') {
              const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
              const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
              return isIOS && isSafari ? 'iOS Safari (Limited)' : 'Not supported';
            }
            return Notification.permission;
          })()}</div>
        </StatusDisplay>
      </Section>

      {/* Test Form */}
      <Section>
        <h3>📝 Custom Test Notification</h3>
        <FormGroup>
          <label>Title:</label>
          <Input
            value={testForm.title}
            onChange={(e) => handleFormChange('title', e.target.value)}
            placeholder="Notification title"
          />
        </FormGroup>
        <FormGroup>
          <label>Body:</label>
          <TextArea
            value={testForm.body}
            onChange={(e) => handleFormChange('body', e.target.value)}
            placeholder="Notification message"
            rows={3}
          />
        </FormGroup>
        <FormGroup>
          <label>Type:</label>
          <Select
            value={testForm.type}
            onChange={(e) => handleFormChange('type', e.target.value)}
          >
            <option value="system">System</option>
            <option value="ride_update">Ride Update</option>
            <option value="chat_message">Chat Message</option>
            <option value="emergency">Emergency</option>
          </Select>
        </FormGroup>
        <FormGroup>
          <label>Priority:</label>
          <Select
            value={testForm.priority}
            onChange={(e) => handleFormChange('priority', e.target.value)}
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
        </FormGroup>
      </Section>

      {/* Test Buttons */}
      <Section>
        <h3>🧪 Quick Tests</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <TestButton onClick={checkPermissions} disabled={isLoading}>
            🔐 Check Permissions
          </TestButton>
          <TestButton onClick={requestNotificationPermission} disabled={isLoading}>
            🔔 Request Permission
          </TestButton>
          <TestButton onClick={testTokenRegistration} disabled={isLoading}>
            📱 Register Token
          </TestButton>
          <TestButton onClick={testSelfNotification} disabled={isLoading}>
            📤 Send to Self
          </TestButton>
          <TestButton onClick={debugRideNotification} disabled={isLoading}>
            🔍 Debug Ride Setup
          </TestButton>
          <TestButton onClick={testRideNotification} disabled={isLoading}>
            🚗 Test Ride Notification
          </TestButton>
          <TestButton onClick={checkNotificationStatus} disabled={isLoading}>
            📊 Check Status
          </TestButton>
          <TestButton onClick={testOneSignalRegistration} disabled={isLoading}>
            🔔 OneSignal Setup
          </TestButton>
          <TestButton onClick={testOneSignalNotification} disabled={isLoading}>
            🚀 OneSignal Test
          </TestButton>
          <TestButton onClick={markAllAsRead} disabled={isLoading}>
            ✅ Mark All Read
          </TestButton>
        </div>
      </Section>

      {/* Logs */}
      <Section>
        <h3>
          📋 Test Logs
          <button
            onClick={copyLogs}
            disabled={logs.length === 0}
            style={{
              marginLeft: '16px',
              fontSize: '12px',
              opacity: logs.length === 0 ? 0.5 : 1,
              cursor: logs.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            📋 Copy
          </button>
          <button
            onClick={clearLogs}
            disabled={logs.length === 0}
            style={{
              marginLeft: '8px',
              fontSize: '12px',
              opacity: logs.length === 0 ? 0.5 : 1,
              cursor: logs.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            🗑️ Clear
          </button>
        </h3>
        <LogOutput>
          {logs.length === 0 ? (
            <div style={{ color: '#666', fontStyle: 'italic' }}>
              No logs yet. Run a test to see output here.
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={log.type} style={{
                color: log.type === 'error' ? '#e53e3e' :
                       log.type === 'success' ? '#38a169' :
                       log.type === 'warning' ? '#d69e2e' : '#4a5568',
                marginBottom: '4px',
                fontFamily: 'monospace',
                fontSize: '13px'
              }}>
                <span style={{ color: '#666' }}>[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </LogOutput>
      </Section>

      {/* Quick Instructions */}
      <Section>
        <h3>🚀 Quick Start</h3>
        <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
          <p><strong>1. Check Permissions</strong> - Make sure browser allows notifications</p>
          <p><strong>2. Register Token</strong> - Register a test push token (Firebase)</p>
          <p><strong>3. OneSignal Setup</strong> - Set up OneSignal if using OneSignal backend</p>
          <p><strong>4. Send to Self</strong> - Send yourself a test notification</p>
          <p><strong>5. Check Status</strong> - Verify everything is working</p>
          <p style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f7fafc', borderRadius: '4px' }}>
            💡 <strong>Tip:</strong> Open browser console (F12) to see additional debug information
          </p>
          {(() => {
            const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
            if (isIOS && isSafari) {
              return (
                <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
                  <strong>📱 iOS Safari Users:</strong>
                  <ul style={{ marginTop: '8px', marginBottom: '8px', paddingLeft: '20px' }}>
                    <li><strong>Add to Home Screen:</strong> Tap Share → Add to Home Screen for better notification support</li>
                    <li><strong>Use OneSignal:</strong> OneSignal tests work better than native browser notifications</li>
                    <li><strong>PWA Mode:</strong> Notifications work best when running as a Progressive Web App</li>
                    <li><strong>iOS 12+:</strong> Requires iOS 12 or later for full notification support</li>
                  </ul>
                </div>
              );
            }
            return null;
          })()}
        </div>
      </Section>
    </Container>
  );
};

NotificationTest.propTypes = {
  currentUser: PropTypes.object,
  notifications: PropTypes.array.isRequired,
  pushTokens: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired
};

export default withTracker(() => {
  const notificationSub = Meteor.subscribe('notifications.recent');
  const tokenSub = Meteor.subscribe('notifications.pushTokens');

  return {
    currentUser: Meteor.user(),
    notifications: Notifications.find({}, { sort: { createdAt: -1 } }).fetch(),
    pushTokens: PushTokens.find({}).fetch(),
    ready: notificationSub.ready() && tokenSub.ready()
  };
})(NotificationTest);
