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
  gap: 12px;
`;

export const ShareButton = styled.button`
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);

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
`;

export const JoinButton = styled.button`
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: rgba(76, 175, 80, 1);
  color: rgba(255, 255, 255, 1);

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
`;

export const ChatButton = styled.button`
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: rgba(33, 150, 243, 1);
  color: rgba(255, 255, 255, 1);

  &:hover:not(:disabled) {
    background-color: rgba(25, 118, 210, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const MapButton = styled.button`
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: rgba(156, 39, 176, 1);
  color: rgba(255, 255, 255, 1);

  &:hover:not(:disabled) {
    background-color: rgba(123, 31, 162, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

export const ShareIcon = styled.span`
  font-size: 16px;
`;

export const JoinIcon = styled.span`
  font-size: 16px;
`;

export const ChatIcon = styled.span`
  font-size: 16px;
`;

export const MapIcon = styled.span`
  font-size: 16px;
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
  z-index: 1000;
  padding: 20px;
  box-sizing: border-box;
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
