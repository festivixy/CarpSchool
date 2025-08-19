import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const modalSlideIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

export const RideCard = styled.div`
  background-color: rgba(255, 255, 255, 1);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(240, 240, 240, 1);
  transition: all 0.2s ease;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  max-width: 400px;
  margin: 0 auto;
  /* Prevent creating stacking context that interferes with modals */
  position: relative;
  z-index: 1;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
`;

export const Header = styled.div`
  margin-bottom: 16px;
`;

export const Route = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

export const RouteItem = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const RouteLabel = styled.span`
  font-size: 12px;
  color: rgba(150, 150, 150, 1);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const RouteLocation = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
`;

export const RouteArrow = styled.div`
  font-size: 20px;
  color: rgba(0, 0, 0, 0.6);
  margin: 0 8px;

  @media (max-width: 480px) {
    align-self: center;
    transform: rotate(90deg);
    margin: 4px 0;
  }
`;

export const Status = styled.div`
  text-align: center;
`;

export const StatusLooking = styled.span`
  background-color: rgba(255, 193, 7, 0.1);
  color: rgba(255, 133, 27, 1);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const StatusMatched = styled.span`
  background-color: rgba(76, 175, 80, 0.1);
  color: rgba(56, 142, 60, 1);
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Details = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

export const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DetailIcon = styled.span`
  font-size: 16px;
  width: 20px;
  text-align: center;
`;

export const DetailText = styled.span`
  font-size: 14px;
  color: rgba(60, 60, 60, 1);
`;

export const Notes = styled.div`
  background-color: rgba(248, 249, 250, 1);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
`;

export const NotesLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(100, 100, 100, 1);
  display: block;
  margin-bottom: 4px;
`;

export const NotesText = styled.span`
  font-size: 14px;
  color: rgba(60, 60, 60, 1);
  line-height: 1.4;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
`;

export const ShareButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);
  width: 44px;
  height: 44px;
  position: relative;

  &:hover:not(:disabled) {
    background-color: rgba(40, 40, 40, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.loading {
    opacity: 0.8;
  }

  @media (min-width: 769px) {
    &:hover::after {
      content: attr(title);
      position: absolute;
      bottom: -32px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;
    }
  }
`;

export const JoinButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(76, 175, 80, 1);
  color: rgba(255, 255, 255, 1);
  width: 44px;
  height: 44px;
  position: relative;

  &:hover:not(:disabled) {
    background-color: rgba(56, 142, 60, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.loading {
    opacity: 0.8;
  }

  @media (min-width: 769px) {
    &:hover::after {
      content: attr(title);
      position: absolute;
      bottom: -32px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;
    }
  }
`;

export const ChatButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(33, 150, 243, 1);
  color: rgba(255, 255, 255, 1);
  width: 44px;
  height: 44px;
  position: relative;

  &:hover:not(:disabled) {
    background-color: rgba(25, 118, 210, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (min-width: 769px) {
    &:hover::after {
      content: attr(title);
      position: absolute;
      bottom: -32px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;
    }
  }
`;

export const StartRideButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 152, 0, 1);
  color: rgba(255, 255, 255, 1);
  width: 44px;
  height: 44px;
  position: relative;

  &:hover:not(:disabled) {
    background-color: rgba(245, 124, 0, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.loading {
    opacity: 0.8;
  }

  @media (min-width: 769px) {
    &:hover::after {
      content: attr(title);
      position: absolute;
      bottom: -32px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;
    }
  }
`;

export const MapButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(156, 39, 176, 1);
  color: rgba(255, 255, 255, 1);
  width: 44px;
  height: 44px;
  position: relative;

  &:hover:not(:disabled) {
    background-color: rgba(123, 31, 162, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (min-width: 769px) {
    &:hover::after {
      content: attr(title);
      position: absolute;
      bottom: -32px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;
    }
  }
`;

export const ShareIcon = styled.span`
  font-size: 18px;
  display: block;
`;

export const JoinIcon = styled.span`
  font-size: 18px;
  display: block;
`;

export const StartRideIcon = styled.span`
  font-size: 18px;
  display: block;
`;

export const ChatIcon = styled.span`
  font-size: 18px;
  display: block;
`;

export const MapIcon = styled.span`
  font-size: 18px;
  display: block;
`;

export const Spinner = styled.span`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid rgba(255, 255, 255, 1);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

/* Modal Styles */
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
  /* Ensure it's always on top */
  isolation: isolate;
`;

export const Modal = styled.div`
  background-color: rgba(255, 255, 255, 1);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${modalSlideIn} 0.3s ease-out;

  @media (max-width: 480px) {
    margin: 0;
    border-radius: 12px;
  }
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 24px 16px;
  border-bottom: 1px solid rgba(240, 240, 240, 1);
`;

export const ModalTitle = styled.h2`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin: 0;
`;

export const ModalIcon = styled.span`
  font-size: 24px;
`;

export const ModalClose = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: rgba(150, 150, 150, 1);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(240, 240, 240, 1);
    color: rgba(0, 0, 0, 1);
  }
`;

export const ModalContent = styled.div`
  padding: 24px;
  text-align: center;
`;

export const ModalText = styled.div`
  margin-bottom: 24px;

  p {
    font-size: 16px;
    color: rgba(60, 60, 60, 1);
    margin: 0;
    line-height: 1.5;
  }
`;

export const ShareCodeContainer = styled.div`
  background-color: rgba(248, 249, 250, 1);
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
`;

export const ShareCode = styled.div`
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  font-size: 32px;
  font-weight: 700;
  color: rgba(0, 0, 0, 1);
  letter-spacing: 4px;
  text-align: center;

  @media (max-width: 480px) {
    font-size: 24px;
    letter-spacing: 2px;
  }
`;

export const ModalNote = styled.div`
  font-size: 14px;
  color: rgba(100, 100, 100, 1);
  line-height: 1.4;
  margin-bottom: 24px;
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

export const CopyButton = styled.button`
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);

  &:hover {
    background-color: rgba(40, 40, 40, 1);
    transform: translateY(-1px);
  }
`;

export const DoneButton = styled.button`
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  background-color: rgba(248, 249, 250, 1);
  color: rgba(0, 0, 0, 1);
  border: 1px solid rgba(224, 224, 224, 1);

  &:hover {
    background-color: rgba(240, 240, 240, 1);
    transform: translateY(-1px);
  }
`;

export const ConfirmPickupButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(34, 139, 34, 1);
  color: rgba(255, 255, 255, 1);
  width: 44px;
  height: 44px;
  position: relative;

  &:hover:not(:disabled) {
    background-color: rgba(46, 125, 50, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.loading {
    opacity: 0.8;
  }

  @media (min-width: 769px) {
    &:hover::after {
      content: attr(title);
      position: absolute;
      bottom: -32px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;
    }
  }
`;

export const ConfirmPickupIcon = styled.span`
  font-size: 18px;
  display: block;
`;

export const ShowCodeButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(63, 81, 181, 1);
  color: rgba(255, 255, 255, 1);
  width: 44px;
  height: 44px;
  position: relative;

  &:hover:not(:disabled) {
    background-color: rgba(48, 63, 159, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (min-width: 769px) {
    &:hover::after {
      content: attr(title);
      position: absolute;
      bottom: -32px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;
    }
  }
`;

export const ShowCodeIcon = styled.span`
  font-size: 18px;
  display: block;
`;

export const CompleteRideButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(76, 175, 80, 1);
  color: rgba(255, 255, 255, 1);
  width: 44px;
  height: 44px;
  position: relative;

  &:hover:not(:disabled) {
    background-color: rgba(56, 142, 60, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.loading {
    opacity: 0.8;
  }

  @media (min-width: 769px) {
    &:hover::after {
      content: attr(title);
      position: absolute;
      bottom: -32px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;
    }
  }
`;

export const CompleteRideIcon = styled.span`
  font-size: 18px;
  display: block;
`;

export const DropoffButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 193, 7, 1);
  color: rgba(255, 255, 255, 1);
  width: 44px;
  height: 44px;
  position: relative;

  &:hover:not(:disabled) {
    background-color: rgba(255, 160, 0, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  &.loading {
    opacity: 0.8;
  }

  @media (min-width: 769px) {
    &:hover::after {
      content: attr(title);
      position: absolute;
      bottom: -32px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;
    }
  }
`;

export const DropoffIcon = styled.span`
  font-size: 18px;
  display: block;
`;

export const ViewHistoryButton = styled.button`
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(103, 58, 183, 1);
  color: rgba(255, 255, 255, 1);
  width: 44px;
  height: 44px;
  position: relative;

  &:hover:not(:disabled) {
    background-color: rgba(81, 45, 168, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  @media (min-width: 769px) {
    &:hover::after {
      content: attr(title);
      position: absolute;
      bottom: -32px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      z-index: 10;
    }
  }
`;

export const ViewHistoryIcon = styled.span`
  font-size: 18px;
  display: block;
`;

export const PickupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
`;

export const PickupModal = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  max-height: 80vh;
  overflow-y: auto;
`;

export const PickupModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const PickupModalTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const RiderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const RiderItem = styled.div`
  padding: 16px;
  border: 2px solid ${props => props.error ? 'rgba(244, 67, 54, 1)' : 'rgba(224, 224, 224, 1)'};
  border-radius: 12px;
  background-color: ${props => props.error ? 'rgba(255, 235, 238, 1)' : 'rgba(249, 249, 249, 1)'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  opacity: ${props => props.disabled ? 0.6 : 1};

  &:hover {
    ${props => !props.disabled && `
      border-color: rgba(33, 150, 243, 1);
      transform: translateY(-1px);
    `}
  }
`;

export const RiderName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 4px;
`;

export const RiderStatus = styled.div`
  font-size: 14px;
  color: ${props => props.error ? 'rgba(244, 67, 54, 1)' : 'rgba(100, 100, 100, 1)'};
`;

export const CodeInputSection = styled.div`
  margin-top: 12px;
  padding: 12px;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 8px;
  border: 1px solid rgba(224, 224, 224, 1);
`;

export const CodeDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-family: monospace;
  font-size: 18px;
  font-weight: 600;
`;

export const CodeDigit = styled.span`
  display: inline-block;
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  border: 2px solid rgba(224, 224, 224, 1);
  border-radius: 6px;
  background-color: ${props => props.filled ? 'rgba(225, 245, 254, 1)' : 'rgba(245, 245, 245, 1)'};
  color: ${props => props.filled ? 'rgba(1, 87, 155, 1)' : 'rgba(158, 158, 158, 1)'};
`;

export const CodeInput = styled.input`
  width: 80px;
  padding: 8px 12px;
  border: 2px solid rgba(224, 224, 224, 1);
  border-radius: 6px;
  font-size: 16px;
  font-family: monospace;
  text-align: center;

  &:focus {
    outline: none;
    border-color: rgba(33, 150, 243, 1);
  }
`;

export const VerifyButton = styled.button`
  background-color: rgba(76, 175, 80, 1);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-left: 8px;

  &:hover:not(:disabled) {
    background-color: rgba(56, 142, 60, 1);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const CodeModalContent = styled.div`
  text-align: center;
  padding: 20px 0;
`;

export const FullCodeDisplay = styled.div`
  font-size: 48px;
  font-family: monospace;
  font-weight: bold;
  color: rgba(33, 150, 243, 1);
  margin: 20px 0;
  letter-spacing: 8px;
`;

export const CodeInstructions = styled.p`
  font-size: 16px;
  color: rgba(100, 100, 100, 1);
  margin: 16px 0;
  line-height: 1.5;
`;

export const HistoryModalContent = styled.div`
  max-height: 60vh;
  overflow-y: auto;
  padding: 8px 0;
`;

export const HistorySection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const HistorySectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(224, 224, 224, 1);
`;

export const TimelineItem = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-left: 3px solid ${props => props.completed ? 'rgba(76, 175, 80, 1)' : 'rgba(224, 224, 224, 1)'};
  padding-left: 12px;
  margin-left: 8px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    left: -7px;
    top: 50%;
    transform: translateY(-50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${props => props.completed ? 'rgba(76, 175, 80, 1)' : 'rgba(224, 224, 224, 1)'};
  }
`;

export const TimelineInfo = styled.div`
  flex: 1;
`;

export const TimelineTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 2px;
`;

export const TimelineTime = styled.div`
  font-size: 12px;
  color: rgba(100, 100, 100, 1);
`;

export const RiderProgressItem = styled.div`
  padding: 12px;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  margin-bottom: 8px;
  background-color: rgba(249, 249, 249, 1);
`;

export const RiderProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const RiderProgressName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
`;

export const RiderProgressStatus = styled.div`
  font-size: 12px;
  color: ${props => props.completed ? 'rgba(76, 175, 80, 1)' : 'rgba(255, 152, 0, 1)'};
  font-weight: 600;
`;

export const RiderProgressDetails = styled.div`
  font-size: 12px;
  color: rgba(100, 100, 100, 1);
  line-height: 1.4;

  div {
    margin-bottom: 2px;
  }
`;

export const EventItem = styled.div`
  padding: 8px 12px;
  border-left: 3px solid rgba(33, 150, 243, 1);
  margin-bottom: 8px;
  background-color: rgba(245, 245, 245, 1);
  border-radius: 0 4px 4px 0;
`;

export const EventTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 4px;
`;

export const EventDetails = styled.div`
  font-size: 11px;
  color: rgba(100, 100, 100, 1);
  line-height: 1.3;

  div {
    margin-bottom: 1px;
  }
`;
