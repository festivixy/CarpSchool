import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import {
  NotificationToast,
  ToastContent,
  ToastIcon,
  ToastText,
  ToastTitle,
  ToastBody,
  ToastClose
} from "../styles/NotificationBadge";

/**
 * In-App Notification Toast
 * Shows when app is in foreground and receives push notification
 */
const NotificationToastComponent = ({ 
  title, 
  body, 
  type, 
  data, 
  onClose, 
  onAction,
  autoClose = 5000 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoClose > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoClose);

      return () => clearTimeout(timer);
    }
  }, [autoClose]);

  const getIcon = (notificationType) => {
    const icons = {
      ride_update: "🚗",
      ride_cancelled: "❌", 
      rider_joined: "👋",
      rider_left: "👋",
      chat_message: "💬",
      ride_starting: "🚦",
      ride_completed: "✅",
      emergency: "🚨",
      system: "ℹ️"
    };
    return icons[notificationType] || "📬";
  };

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

  const handleClick = () => {
    if (onAction) {
      onAction(data);
    }
    handleClose();
  };

  if (!isVisible) {
    return null;
  }

  // Create portal to render at document body level
  return createPortal(
    <NotificationToast onClick={handleClick}>
      <ToastContent>
        <ToastIcon>{getIcon(type)}</ToastIcon>
        <ToastText>
          <ToastTitle>{title}</ToastTitle>
          <ToastBody>{body}</ToastBody>
        </ToastText>
        <ToastClose onClick={(e) => {
          e.stopPropagation();
          handleClose();
        }}>
          ×
        </ToastClose>
      </ToastContent>
    </NotificationToast>,
    document.body
  );
};

NotificationToastComponent.propTypes = {
  title: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  type: PropTypes.string,
  data: PropTypes.object,
  onClose: PropTypes.func,
  onAction: PropTypes.func,
  autoClose: PropTypes.number
};

// Toast Manager for handling multiple toasts
class ToastManager {
  constructor() {
    this.toasts = new Map();
    this.toastId = 0;
    
    // Listen for custom events from notification manager
    if (typeof window !== 'undefined') {
      window.addEventListener('inAppNotification', this.handleInAppNotification.bind(this));
    }
  }

  handleInAppNotification(event) {
    const { title, message, type, data } = event.detail;
    this.show(title, message, { type, data });
  }

  show(title, body, options = {}) {
    const id = ++this.toastId;
    const toastProps = {
      title,
      body,
      type: options.type,
      data: options.data,
      autoClose: options.autoClose !== undefined ? options.autoClose : 5000,
      onClose: () => this.remove(id),
      onAction: options.onAction || this.defaultAction
    };

    // Create and render toast
    const toastElement = React.createElement(NotificationToastComponent, {
      key: id,
      ...toastProps
    });

    this.toasts.set(id, toastElement);
    this.render();

    return id;
  }

  remove(id) {
    this.toasts.delete(id);
    this.render();
  }

  defaultAction(data) {
    // Default navigation action
    if (data?.rideId && window.FlowRouter) {
      window.FlowRouter.go('/mobile/ride-info', { rideId: data.rideId });
    } else if (data?.chatId && window.FlowRouter) {
      window.FlowRouter.go('/chat', {}, { chatId: data.chatId });
    }
  }

  render() {
    // This is a simplified version - in a real app you might want to use
    // a more sophisticated state management approach
    if (this.container) {
      this.container.forceUpdate();
    }
  }

  clear() {
    this.toasts.clear();
    this.render();
  }
}

// Export singleton instance
export const toastManager = new ToastManager();

// React component wrapper for toast container
export class ToastContainer extends React.Component {
  componentDidMount() {
    toastManager.container = this;
  }

  componentWillUnmount() {
    toastManager.container = null;
  }

  render() {
    return (
      <div>
        {Array.from(toastManager.toasts.values())}
      </div>
    );
  }
}

export default NotificationToastComponent;
