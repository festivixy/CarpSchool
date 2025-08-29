import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import { Notifications, NOTIFICATION_TYPES, NOTIFICATION_PRIORITY } from "../../api/notifications/Notifications";
import { isAdminRole } from "../desktop/components/NavBarRoleUtils";
import {
  Container,
  Header,
  Title,
  Section,
  SectionTitle,
  StatsGrid,
  StatCard,
  StatNumber,
  StatLabel,
  FormSection,
  FormGroup,
  Label,
  Input,
  TextArea,
  Select,
  Button,
  NotificationList,
  NotificationItem,
  NotificationContent,
  ActionButtons,
  StatusBadge,
  ErrorMessage,
  SuccessMessage,
} from "../styles/AdminNotifications";

/**
 * Admin Notifications Management Page
 * Allows admins to view notification stats, send test notifications, and manage the notification system
 */
const AdminNotifications = ({ stats, notifications, ready, currentUser }) => {
  const [testForm, setTestForm] = useState({
    recipients: "",
    title: "",
    body: "",
    type: "system",
    priority: "normal",
    rideId: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [showTestForm, setShowTestForm] = useState(false);

  // Check admin permissions
  const isAdmin = isAdminRole(currentUser);

  useEffect(() => {
    if (!isAdmin) {
      // Redirect non-admins
      if (window.FlowRouter) {
        window.FlowRouter.go("/");
      }
    }
  }, [isAdmin]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleTestFormChange = (field, value) => {
    setTestForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSendTestNotification = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { recipients, title, body, type, priority, rideId } = testForm;

      if (!title || !body) {
        throw new Error("Title and body are required");
      }

      let recipientIds = [];

      if (recipients.trim()) {
        // Parse recipients (comma-separated usernames or user IDs)
        recipientIds = recipients.split(",").map(r => r.trim()).filter(r => r);
      } else {
        // Send to current user as test
        recipientIds = [Meteor.userId()];
      }

      const options = {
        type,
        priority,
        data: rideId ? { rideId } : {},
      };

      if (rideId && ["ride_update", "ride_cancelled", "rider_joined"].includes(type)) {
        // Use ride-specific method
        await Meteor.callAsync(
          "notifications.sendToRideParticipants",
          rideId,
          title,
          body,
          options,
        );
      } else {
        // Use general send method
        await Meteor.callAsync(
          "notifications.send",
          recipientIds,
          title,
          body,
          options,
        );
      }

      showMessage("success", "Test notification sent successfully!");

      // Reset form
      setTestForm({
        recipients: "",
        title: "",
        body: "",
        type: "system",
        priority: "normal",
        rideId: "",
      });

    } catch (error) {
      console.error("Test notification failed:", error);
      showMessage("error", error.reason || error.message || "Failed to send notification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCleanup = async () => {
    if (!confirm("This will delete old notifications. Continue?")) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await Meteor.callAsync("notifications.cleanup", 30);
      showMessage("success", `Cleaned up ${result} old notifications`);
    } catch (error) {
      showMessage("error", error.reason || error.message || "Cleanup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await Meteor.callAsync("notifications.markAsRead", notificationId);
      showMessage("success", "Notification marked as read");
    } catch (error) {
      showMessage("error", error.reason || error.message);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleString();

  const getStatusColor = (status) => {
    const colors = {
      pending: "#ffa726",
      sent: "#66bb6a",
      delivered: "#42a5f5",
      failed: "#ef5350",
      read: "#9e9e9e",
    };
    return colors[status] || "#9e9e9e";
  };

  if (!ready) {
    return <Container><div>Loading...</div></Container>;
  }

  if (!isAdmin) {
    return <Container><div>Access denied. Admin privileges required.</div></Container>;
  }

  return (
    <Container>
      <Header>
        <Title>Notification Management</Title>
      </Header>

      {message.text && (
        message.type === "error" ? (
          <ErrorMessage>{message.text}</ErrorMessage>
        ) : (
          <SuccessMessage>{message.text}</SuccessMessage>
        )
      )}

      {/* Statistics Section */}
      <Section>
        <SectionTitle>Statistics</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatNumber>{stats.total || 0}</StatNumber>
            <StatLabel>Total Notifications</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.last24Hours || 0}</StatNumber>
            <StatLabel>Last 24 Hours</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.activeTokens || 0}</StatNumber>
            <StatLabel>Active Devices</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.byStatus?.sent || 0}</StatNumber>
            <StatLabel>Sent</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.byStatus?.failed || 0}</StatNumber>
            <StatLabel>Failed</StatLabel>
          </StatCard>
          <StatCard>
            <StatNumber>{stats.byStatus?.read || 0}</StatNumber>
            <StatLabel>Read</StatLabel>
          </StatCard>
        </StatsGrid>
      </Section>

      {/* Test Notification Form */}
      <Section>
        <SectionTitle>
          Test Notifications
          <Button
            onClick={() => setShowTestForm(!showTestForm)}
            style={{ marginLeft: "16px", fontSize: "14px" }}
          >
            {showTestForm ? "Hide" : "Show"} Test Form
          </Button>
        </SectionTitle>

        {showTestForm && (
          <FormSection>
            <form onSubmit={handleSendTestNotification}>
              <FormGroup>
                <Label>Recipients (comma-separated usernames/IDs, leave empty for self)</Label>
                <Input
                  type="text"
                  value={testForm.recipients}
                  onChange={(e) => handleTestFormChange("recipients", e.target.value)}
                  placeholder="user1, user2, user3..."
                />
              </FormGroup>

              <FormGroup>
                <Label>Title *</Label>
                <Input
                  type="text"
                  value={testForm.title}
                  onChange={(e) => handleTestFormChange("title", e.target.value)}
                  placeholder="Notification title"
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Body *</Label>
                <TextArea
                  value={testForm.body}
                  onChange={(e) => handleTestFormChange("body", e.target.value)}
                  placeholder="Notification message"
                  rows={3}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>Type</Label>
                <Select
                  value={testForm.type}
                  onChange={(e) => handleTestFormChange("type", e.target.value)}
                >
                  {Object.values(NOTIFICATION_TYPES).map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Priority</Label>
                <Select
                  value={testForm.priority}
                  onChange={(e) => handleTestFormChange("priority", e.target.value)}
                >
                  {Object.values(NOTIFICATION_PRIORITY).map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label>Ride ID (for ride-specific notifications)</Label>
                <Input
                  type="text"
                  value={testForm.rideId}
                  onChange={(e) => handleTestFormChange("rideId", e.target.value)}
                  placeholder="Optional ride ID"
                />
              </FormGroup>

              <ActionButtons>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Test Notification"}
                </Button>
              </ActionButtons>
            </form>
          </FormSection>
        )}
      </Section>

      {/* System Actions */}
      <Section>
        <SectionTitle>System Actions</SectionTitle>
        <ActionButtons>
          <Button onClick={handleCleanup} disabled={isLoading}>
            {isLoading ? "Cleaning..." : "Cleanup Old Notifications"}
          </Button>
        </ActionButtons>
      </Section>

      {/* Recent Notifications */}
      <Section>
        <SectionTitle>Recent Notifications</SectionTitle>
        <NotificationList>
          {notifications.length === 0 ? (
            <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
              No notifications found
            </div>
          ) : (
            notifications.slice(0, 50).map(notification => (
              <NotificationItem key={notification._id}>
                <NotificationContent>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: "0 0 4px 0", fontSize: "14px" }}>{notification.title}</h4>
                      <p style={{ margin: "0 0 8px 0", fontSize: "13px", color: "#666" }}>{notification.body}</p>
                      <div style={{ fontSize: "11px", color: "#999" }}>
                        <span>To: {notification.userId}</span>
                        <span style={{ margin: "0 8px" }}>•</span>
                        <span>Type: {notification.type}</span>
                        <span style={{ margin: "0 8px" }}>•</span>
                        <span>{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                    <div style={{ marginLeft: "16px", textAlign: "right" }}>
                      <StatusBadge color={getStatusColor(notification.status)}>
                        {notification.status}
                      </StatusBadge>
                      {notification.status !== "read" && (
                        <Button
                          onClick={() => handleMarkAsRead(notification._id)}
                          style={{ marginTop: "8px", fontSize: "11px", padding: "4px 8px" }}
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </NotificationContent>
              </NotificationItem>
            ))
          )}
        </NotificationList>
      </Section>
    </Container>
  );
};

AdminNotifications.propTypes = {
  stats: PropTypes.object.isRequired,
  notifications: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
  currentUser: PropTypes.object,
};

export default withTracker(() => {
  const statsHandle = Meteor.subscribe("notifications.admin", {}, { limit: 100 });
  const currentUser = Meteor.user();

  return {
    stats: {
      total: 0,
      last24Hours: 0,
      activeTokens: 0,
      byStatus: {},
      byType: {},
    }, // Would be populated from a reactive method call
    notifications: Notifications.find({}, {
      sort: { createdAt: -1 },
      limit: 100,
    }).fetch(),
    ready: statsHandle.ready(),
    currentUser,
  };
})(AdminNotifications);
