import styled from "styled-components";

export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 15px;
  }
`;

export const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const Title = styled.h1`
  color: #333;
  font-size: 28px;
  font-weight: 700;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
  margin: 5px 0 0 0;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const RefreshButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: #0056b3;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const UserCard = styled.div`
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
    border-color: #4caf50;
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
    padding: 20px;
  }
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const UserAvatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    font-size: 24px;
    font-weight: bold;
    color: #666;
  }

  @media (max-width: 768px) {
    width: 56px;
    height: 56px;

    .placeholder {
      font-size: 20px;
    }
  }
`;

export const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

export const UserName = styled.h3`
  color: #333;
  font-size: 18px;
  font-weight: 600;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const UserType = styled.span`
  color: ${props => props.userType === "Driver" ? "#28a745" : "#007bff"};
  font-size: 14px;
  font-weight: 500;
  padding: 4px 8px;
  background: ${props => props.userType === "Driver" ? "#d4edda" : "#d1ecf1"};
  border-radius: 4px;
  display: inline-block;
  width: fit-content;
`;

export const UserEmail = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
  font-family: monospace;
`;

export const UserSchool = styled.p`
  color: #495057;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
`;

export const UserMeta = styled.p`
  color: #6c757d;
  font-size: 12px;
  margin: 0;
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

export const ApproveButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;

  &:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const RejectButton = styled.button`
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 100px;

  &:hover:not(:disabled) {
    background: #c82333;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  color: #666;
  font-size: 16px;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;

  div {
    font-size: 48px;
    margin-bottom: 20px;
  }

  h3 {
    color: #333;
    font-size: 24px;
    margin: 0 0 10px 0;
  }

  p {
    font-size: 16px;
    margin: 0;
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.5;
  }
`;

export const ErrorMessage = styled.div`
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  font-size: 14px;
`;

export const SuccessMessage = styled.div`
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
  font-size: 14px;
`;

// Modal styles
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
`;

export const ModalHeader = styled.div`
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid #eee;

  h3 {
    color: #333;
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
`;

export const ModalBody = styled.div`
  padding: 24px;

  p {
    color: #666;
    font-size: 14px;
    line-height: 1.5;
    margin: 0 0 20px 0;
  }
`;

export const ModalActions = styled.div`
  padding: 0 24px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

export const RejectInput = styled.textarea`
  width: 100%;
  min-height: 80px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
  }

  &::placeholder {
    color: #999;
  }
`;

export const ModalButton = styled.button`
  background: ${props => props.primary ? "#dc3545" : "#6c757d"};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: ${props => props.primary ? "#c82333" : "#5a6268"};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
