import styled from "styled-components";

export const PageContainer = styled.div`
  background-color: #f8f9fa;
  min-height: 100vh;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
`;

export const FixedHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid #e9ecef;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const HeaderTitle = styled.h1`
  color: #212529;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

export const ContentPadding = styled.div`
  padding: 24px 20px;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

export const MainCard = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e9ecef;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 24px 20px;
    border-radius: 12px;
  }
`;

export const MainTitle = styled.h2`
  color: #212529;
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

export const MainDescription = styled.p`
  color: #6c757d;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;
`;

export const SkeletonSection = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 24px 20px;
    border-radius: 12px;
  }
`;

export const SkeletonTitle = styled.h3`
  color: #212529;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const SkeletonDescription = styled.p`
  color: #6c757d;
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 24px 0;
`;

export const ControlsCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    padding: 16px;
    gap: 16px;
  }
`;

export const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ControlLabel = styled.label`
  color: #495057;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
`;

export const ControlInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  font-size: 14px;
  width: 80px;
  
  &:focus {
    outline: none;
    border-color: #0d6efd;
    box-shadow: 0 0 0 2px rgba(13, 110, 253, 0.25);
  }
`;

export const ControlButton = styled.button`
  padding: 10px 20px;
  background: ${props => (props.active ? "#0d6efd" : "#6c757d")};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => (props.active ? "#0b5ed7" : "#5c636a")};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const CodeBlock = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  overflow-x: auto;
`;

export const ImportCode = styled.pre`
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #495057;
  white-space: pre-wrap;
  word-break: break-word;
`;

export const SkeletonDemo = styled.div`
  margin-top: 24px;
`;

export const DemoCard = styled.div`
  border: 2px solid #e9ecef;
  border-radius: 12px;
  overflow: hidden;
`;

export const DemoTitle = styled.div`
  background: #0d6efd;
  color: white;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
`;

export const DemoDescription = styled.div`
  background: #f8f9fa;
  padding: 12px 20px;
  color: #6c757d;
  font-size: 14px;
  border-bottom: 1px solid #e9ecef;
`;

export const SkeletonPreview = styled.div`
  background: #ffffff;
  min-height: 400px;
  overflow: hidden;
`;

export const SkeletonContainer = styled.div`
  width: 100%;
  height: 100%;
`;

export const UserInfoCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  color: white;
  
  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 12px;
  }
`;

export const UserInfoTitle = styled.h3`
  color: white;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

export const UserInfoItem = styled.div`
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  strong {
    color: white;
  }
`;

export const UserRoleBadge = styled.span`
  background: ${props => (props.isAdmin ? "#28a745" : "#6c757d")};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
`;
