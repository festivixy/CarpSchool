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

  // Test 3: Test Ride Notification (if user has rides)
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
      addLog(`🎯 Using ride: ${testRide._id}`, 'info');

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
        addLog(`  ${index + 1}. ${token.platform} - ${token.token.substring(0, 20)}...`, 'info');
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
        addLog('⚠️ OneSignal not supported or not loaded', 'warning');
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
      addLog('🔐 Checking notification permissions...', 'info');

      // Check browser permission
      if (typeof Notification !== 'undefined') {
        addLog(`🌐 Browser permission: ${Notification.permission}`, 'info');
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

      // Try to request permission
      if (!notificationManager.hasPermission) {
        addLog('🔔 Requesting notification permission...', 'info');
        const granted = await notificationManager.requestPermission();
        addLog(`${granted ? '✅' : '❌'} Permission ${granted ? 'granted' : 'denied'}`,
               granted ? 'success' : 'error');
      }

    } catch (error) {
      addLog(`❌ Permission check failed: ${error.message}`, 'error');
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
          <div>🌐 Browser Permission: {typeof Notification !== 'undefined' ? Notification.permission : 'Not supported'}</div>
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
          <TestButton onClick={testTokenRegistration} disabled={isLoading}>
            📱 Register Token
          </TestButton>
          <TestButton onClick={testSelfNotification} disabled={isLoading}>
            📤 Send to Self
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
          <button onClick={clearLogs} style={{ marginLeft: '16px', fontSize: '12px' }}>
            Clear
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
