import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--danger-soft) 0%, var(--danger-soft) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

export const Content = styled.div`
  background: var(--cream-0);
  border-radius: 24px;
  padding: 48px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(244, 67, 54, 0.1);
  border: 1px solid var(--danger-soft);

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
  color: var(--danger);
  margin: 0 0 12px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const Subtitle = styled.h2`
  font-size: 18px;
  font-weight: 500;
  color: var(--ink-3);
  margin: 0 0 32px 0;
  
  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 24px;
  }
`;

export const Message = styled.div`
  font-size: 16px;
  line-height: 1.6;
  color: var(--ink-2);
  margin-bottom: 32px;
  text-align: left;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 24px;
  }
`;

export const ReasonSection = styled.div`
  background: var(--danger-soft);
  border: 1px solid var(--danger-soft);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  text-align: left;
`;

export const ReasonTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--danger);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const ReasonText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: var(--ink-3);
  margin: 0;
  padding: 12px;
  background: var(--cream-0);
  border-radius: 8px;
  border-left: 4px solid var(--danger);
`;

export const StatusCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  background: ${props => props.rejected ? "var(--danger-soft)" : "var(--signal-yellow-soft)"};
  border: 1px solid ${props => props.rejected ? "var(--danger-soft)" : "var(--signal-yellow)"};
`;

export const StatusIcon = styled.div`
  font-size: 24px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.rejected ? "var(--danger-soft)" : "var(--signal-yellow-soft)"};
  flex-shrink: 0;
`;

export const StatusText = styled.div`
  flex: 1;
  text-align: left;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.rejected ? "var(--danger)" : "var(--amber)"};
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
  background: linear-gradient(135deg, var(--leaf) 0%, var(--leaf) 100%);
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
  background: var(--cream-1);
  color: var(--ink-3);
  border: 1px solid var(--cream-3);
  border-radius: 12px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: var(--cream-2);
    color: var(--ink-2);
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
  color: var(--ink-3);
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
  background: var(--danger-soft);
  color: var(--danger-deep);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 14px;
  border-left: 4px solid var(--danger);
  text-align: left;
`;

export const SuccessMessage = styled.div`
  background: var(--leaf-soft);
  color: var(--leaf);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  font-size: 14px;
  border-left: 4px solid var(--leaf);
  text-align: left;
`;
