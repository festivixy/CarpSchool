import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

export const Content = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 30px 20px;
    margin: 20px;
  }
`;

export const Icon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

export const Title = styled.h1`
  color: #333;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 10px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const Subtitle = styled.p`
  color: #666;
  font-size: 16px;
  margin: 0 0 30px 0;
  
  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const StatusCard = styled.div`
  display: flex;
  align-items: center;
  padding: 15px;
  margin: 10px 0;
  border-radius: 8px;
  background: ${props => props.pending ? '#fff3cd' : '#d4edda'};
  border: 1px solid ${props => props.pending ? '#ffeaa7' : '#c3e6cb'};
  text-align: left;
`;

export const StatusIcon = styled.div`
  font-size: 20px;
  margin-right: 15px;
  opacity: ${props => props.pending ? 0.7 : 1};
`;

export const StatusText = styled.div`
  color: ${props => props.pending ? '#856404' : '#155724'};
  font-size: 14px;
  flex: 1;
`;

export const Message = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 25px;
  margin: 30px 0;
  color: #333;
  font-size: 16px;
  line-height: 1.6;
  text-align: left;
  
  @media (max-width: 768px) {
    font-size: 14px;
    padding: 20px;
  }
`;

export const InfoSection = styled.div`
  background: #e3f2fd;
  border-radius: 8px;
  padding: 20px;
  margin: 25px 0;
  text-align: left;
`;

export const InfoTitle = styled.h3`
  color: #1976d2;
  font-size: 16px;
  margin: 0 0 10px 0;
  font-weight: 600;
`;

export const InfoText = styled.p`
  color: #333;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
`;

export const Actions = styled.div`
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

export const LogoutButton = styled.button`
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #5a6268;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;
