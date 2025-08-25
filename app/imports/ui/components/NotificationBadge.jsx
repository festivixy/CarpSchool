import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import { NotificationHelpers } from "../utils/notifications";
import {
  Badge,
  BadgeCount,
  NotificationList,
  NotificationItem,
  NotificationIcon,
  NotificationContent,
  NotificationTitle,
  NotificationBody,
  NotificationTime,
  NotificationActions,
  NotificationButton,
  MarkAllReadButton,
  EmptyState,
} from "../styles/NotificationBadge";

/**
 * Notification Badge Component
 * Shows unread count and notification list
 */
const NotificationBadge = ({
  unreadCount,
  notifications,
  ready,
  showList = false,
  onToggleList = null,
  position = "bottom-right",
}) => {
  const [isListOpen, setIsListOpen] = useState(showList);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsListOpen(showList);
  }, [showList]);

  const handleToggleList = () => {
    const newState = !isListOpen;
    setIsListOpen(newState);
    if (onToggleList) {
      onToggleList(newState);
    }
  };

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await NotificationHelpers.markAsRead(notificationId);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    try {
      await NotificationHelpers.markAllAsRead();
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (notification.status !== "read") {
      await NotificationHelpers.markAsRead(notification._id);
    }

    // Navigate based on notification data
    if (notification.data?.rideId) {
      if (window.FlowRouter) {
        FlowRouter.go("/mobile/ride-info", { rideId: notification.data.rideId });
      }
    } else if (notification.data?.chatId) {
      if (window.FlowRouter) {
        FlowRouter.go("/chat", {}, { chatId: notification.data.chatId });
      }
    }

    // Close list after navigation
    setIsListOpen(false);
  };

  const getNotificationIcon = (type) => {
    const icons = {
      ride_update: "🚗",
      ride_cancelled: "❌",
      rider_joined: "👋",
      rider_left: "👋",
      chat_message: "💬",
      ride_starting: "🚦",
      ride_completed: "✅",
      emergency: "🚨",
      system: "ℹ️",
    };
    return icons[type] || "📬";
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 80) => {
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  if (!ready) {
    return <Badge><BadgeCount>...</BadgeCount></Badge>;
  }

  return (
    <>
      <Badge onClick={handleToggleList} hasCount={unreadCount > 0}>
        {unreadCount > 0 && (
          <BadgeCount>
            {unreadCount > 99 ? "99+" : unreadCount}
          </BadgeCount>
        )}
      </Badge>

      {isListOpen && (
        <NotificationList position={position}>
          <div style={{
            padding: "16px",
            borderBottom: "1px solid #eee",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
              Notifications
            </h3>
            {unreadCount > 0 && (
              <MarkAllReadButton
                onClick={handleMarkAllAsRead}
                disabled={isLoading}
              >
                {isLoading ? "..." : "Mark all read"}
              </MarkAllReadButton>
            )}
          </div>

          {notifications.length === 0 ? (
            <EmptyState>
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
                <h4 style={{ margin: "0 0 8px 0", color: "#666" }}>No notifications</h4>
                <p style={{ margin: 0, color: "#999", fontSize: "14px" }}>
                  You&apos;re all caught up!
                </p>
              </div>
            </EmptyState>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification._id}
                isRead={notification.status === "read"}
                onClick={() => handleNotificationClick(notification)}
              >
                <NotificationIcon>
                  {getNotificationIcon(notification.type)}
                </NotificationIcon>

                <NotificationContent>
                  <NotificationTitle>
                    {notification.title}
                  </NotificationTitle>
                  <NotificationBody>
                    {truncateText(notification.body)}
                  </NotificationBody>
                  <NotificationTime>
                    {formatTimeAgo(notification.createdAt)}
                  </NotificationTime>
                </NotificationContent>

                {notification.status !== "read" && (
                  <NotificationActions>
                    <NotificationButton
                      onClick={(e) => handleMarkAsRead(notification._id, e)}
                    >
                      Mark read
                    </NotificationButton>
                  </NotificationActions>
                )}
              </NotificationItem>
            ))
          )}
        </NotificationList>
      )}
    </>
  );
};

NotificationBadge.propTypes = {
  unreadCount: PropTypes.number.isRequired,
  notifications: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
  showList: PropTypes.bool,
  onToggleList: PropTypes.func,
  position: PropTypes.oneOf(["bottom-right", "bottom-left", "top-right", "top-left"]),
};

export default withTracker(() => {
  const subscription = Meteor.subscribe("notifications.recent");
  const countSubscription = Meteor.subscribe("notifications.unreadCount");

  return {
    unreadCount: NotificationHelpers.getUnreadCount(),
    notifications: NotificationHelpers.getRecentNotifications(),
    ready: subscription.ready() && countSubscription.ready(),
  };
})(NotificationBadge);
