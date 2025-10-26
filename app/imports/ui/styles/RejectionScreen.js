import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

export const Content = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 48px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(244, 67, 54, 0.1);
  border: 1px solid #ffcdd2;

  @media (max-width: 768px) {
    padding: 32px 24px;
    border-radius: 16px;
  }
`;

export const Icon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    font-size: 48px;
    margin-bottom: 16px;
  }
`;

export const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #d32f2f;
  margin: 0 0 12px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const Subtitle = styled.h2`
  font-size: 18px;
  font-weight: 500;
  color: #666;
  margin: 0 0 32px 0;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 24px;
  }
`;

export const Message = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 32px;
  text-align: left;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 24px;
  }
`;

export const ReasonSection = styled.div`
  background: #ffebee;
  border: 1px solid #ffcdd2;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: left;
`;

export const ReasonTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #d32f2f;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ReasonText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: #666;
  margin: 0;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
  border-left: 4px solid #f44336;
`;

export const StatusCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  background: ${props => props.rejected ? "#ffebee" : "#fff3e0"};
  border: 1px solid ${props => props.rejected ? "#ffcdd2" : "#ffcc02"};
`;

export const StatusIcon = styled.div`
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.rejected ? "#ffcdd2" : "#fff3e0"};
  flex-shrink: 0;
`;

export const StatusText = styled.div`
  flex: 1;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.rejected ? "#d32f2f" : "#f57c00"};
`;

export const Actions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

export const ReVerifyButton = styled.button`
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: 0 4px 12px rgba(76, 175, 80, 0.2);
  }
`;

export const LogoutButton = styled.button`
  background: #f5f5f5;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: #eee;
    color: #555;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const LoadingState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #666;
  font-size: 16px;

  div {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &::before {
    content: "⏳";
    font-size: 24px;
    animation: pulse 1.5s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

export const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 14px;
  border-left: 4px solid #f44336;
  text-align: left;
`;

export const SuccessMessage = styled.div`
  background: #e8f5e8;
  color: #2e7d32;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 14px;
  border-left: 4px solid #4caf50;
  text-align: left;
`;
