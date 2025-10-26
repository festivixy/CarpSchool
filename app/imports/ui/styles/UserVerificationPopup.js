import styled from "styled-components";

export const PopupOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const PopupContent = styled.div`
  background: #fff;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

export const PopupHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  background: #fff;
  border-radius: 16px 16px 0 0;
`;

export const PopupTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

export const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

export const PopupBody = styled.div`
  padding: 24px;
`;

export const UserSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8fafb;
  border-radius: 12px;
`;

export const UserAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  background: #e1e5e9;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    font-size: 24px;
    font-weight: 600;
    color: #666;
  }
`;

export const UserInfo = styled.div`
  flex: 1;
`;

export const UserName = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

export const UserBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  background: ${props => props.userType === "Driver" ? "#e3f2fd" : "#f3e5f5"};
  color: ${props => props.userType === "Driver" ? "#1976d2" : "#7b1fa2"};
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;

  @media (min-width: 480px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const InfoItem = styled.div`
  padding: 12px;
  background: #f8fafb;
  border-radius: 8px;
`;

export const InfoLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

export const InfoValue = styled.div`
  font-size: 14px;
  color: #333;
  word-break: break-word;
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

export const ApproveButton = styled.button`
  flex: 1;
  padding: 14px 24px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #45a049;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const RejectButton = styled.button`
  flex: 1;
  padding: 14px 24px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #da190b;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const RejectModal = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
`;

export const RejectModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
`;

export const RejectModalHeader = styled.div`
  padding: 20px 20px 0;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }
`;

export const RejectModalBody = styled.div`
  padding: 20px;

  p {
    margin: 0 0 16px;
    color: #666;
    line-height: 1.5;
  }
`;

export const RejectInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

export const RejectModalActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 0 20px 20px;
`;

export const ModalButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${props => props.primary ? `
    background: #f44336;
    color: white;

    &:hover:not(:disabled) {
      background: #da190b;
    }
  ` : `
    background: #f5f5f5;
    color: #333;

    &:hover:not(:disabled) {
      background: #eee;
    }
  `}

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
  border-left: 4px solid #f44336;
`;
