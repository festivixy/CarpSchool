import styled, { keyframes } from "styled-components";

// Animations
const bounce = keyframes`
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -1px, 0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Main Badge Component
export const Badge = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: ${props => props.hasCount ? 'rgba(244, 67, 54, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.hasCount ? 'rgba(244, 67, 54, 0.15)' : 'rgba(0, 0, 0, 0.1)'};
    transform: scale(1.05);
  }

  &:before {
    content: "🔔";
    font-size: 18px;
    opacity: ${props => props.hasCount ? 0.8 : 0.6};
  }

  ${props => props.hasCount && `
    animation: ${pulse} 2s infinite;
  `}
`;

// Badge Count
export const BadgeCount = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #f44336;
  color: white;
  font-size: 10px;
  font-weight: 600;
  min-width: 16px;
  height: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
  border: 2px solid white;
  animation: ${bounce} 1s ease-in-out;
`;

// Notification List Container
export const NotificationList = styled.div`
  position: absolute;
  top: ${props => props.position?.includes('top') ? 'auto' : '100%'};
  bottom: ${props => props.position?.includes('top') ? '100%' : 'auto'};
  right: ${props => props.position?.includes('left') ? 'auto' : '0'};
  left: ${props => props.position?.includes('left') ? '0' : 'auto'};
  width: 320px;
  max-height: 400px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.1);
  overflow: hidden;
  z-index: 1000;
  animation: ${slideIn} 0.3s ease-out;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 60px;
    left: 16px;
    right: 16px;
    width: auto;
    max-height: calc(100vh - 120px);
  }
`;

// Individual Notification Item
export const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: ${props => props.isRead ? 'transparent' : 'rgba(33, 150, 243, 0.02)'};
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }

  &:last-child {
    border-bottom: none;
  }

  ${props => !props.isRead && `
    border-left: 3px solid #2196f3;
  `}
`;

// Notification Icon
export const NotificationIcon = styled.div`
  font-size: 20px;
  margin-right: 12px;
  margin-top: 2px;
  flex-shrink: 0;
`;

// Notification Content
export const NotificationContent = styled.div`
  flex: 1;
  min-width: 0;
`;

// Notification Title
export const NotificationTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.3;
`;

// Notification Body
export const NotificationBody = styled.p`
  margin: 0 0 6px 0;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.4;
  word-wrap: break-word;
`;

// Notification Time
export const NotificationTime = styled.span`
  font-size: 11px;
  color: rgba(0, 0, 0, 0.4);
  font-weight: 500;
`;

// Notification Actions
export const NotificationActions = styled.div`
  margin-left: 8px;
  flex-shrink: 0;
`;

// Action Button
export const NotificationButton = styled.button`
  background: none;
  border: none;
  color: #2196f3;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(33, 150, 243, 0.1);
  }
`;

// Mark All Read Button
export const MarkAllReadButton = styled.button`
  background: none;
  border: none;
  color: #2196f3;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: rgba(33, 150, 243, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Empty State
export const EmptyState = styled.div`
  color: rgba(0, 0, 0, 0.5);
`;

// Notification Toast (for in-app notifications)
export const NotificationToast = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 16px;
  max-width: 300px;
  z-index: 10000;
  animation: ${slideIn} 0.3s ease-out;
  cursor: pointer;
  
  @media (max-width: 768px) {
    left: 16px;
    right: 16px;
    max-width: none;
  }
`;

export const ToastContent = styled.div`
  display: flex;
  align-items: flex-start;
`;

export const ToastIcon = styled.div`
  font-size: 20px;
  margin-right: 12px;
  margin-top: 2px;
`;

export const ToastText = styled.div`
  flex: 1;
`;

export const ToastTitle = styled.h4`
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
`;

export const ToastBody = styled.p`
  margin: 0;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.4;
`;

export const ToastClose = styled.button`
  background: none;
  border: none;
  color: rgba(0, 0, 0, 0.4);
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  font-size: 16px;
  line-height: 1;
  
  &:hover {
    color: rgba(0, 0, 0, 0.6);
  }
`;
