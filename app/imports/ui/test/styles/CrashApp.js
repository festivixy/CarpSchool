import styled from "styled-components";

// Base container and layout
export const PageContainer = styled.div`
  background-color: rgba(255, 255, 255, 1);
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  margin: 0 auto;
  padding: 20px 0;
  min-height: 100vh;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px 0;
  }
`;

export const FixedHeader = styled.div`
  display: flex;
  max-width: 100%;
  flex-direction: column;
  font-size: 28px;
  color: rgba(0, 0, 0, 1);
  font-weight: 700;
  text-align: center;
  letter-spacing: -0.5px;
  align-items: center;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 20px;
  }
`;

export const HeaderTitle = styled.h1`
  margin: 20px 0 8px 0;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ContentPadding = styled.div`
  max-width: 600px;
  width: 100%;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    padding: 0 15px;
    gap: 20px;
  }
`;

export const MainCard = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 24px;
  color: white;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

export const MainTitle = styled.h2`
  margin: 0 0 12px 0;
  font-size: 24px;
  font-weight: 700;
  color: white;
`;

export const MainDescription = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
`;

export const WarningCard = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
`;

export const WarningIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
`;

export const WarningTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #856404;
`;

export const WarningDescription = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #856404;
`;

export const CrashButton = styled.button`
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  border: none;
  border-radius: 12px;
  padding: 20px 32px;
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  align-self: center;
  min-width: 200px;

  &:hover {
    background: linear-gradient(135deg, #c82333 0%, #a71e2a 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(220, 53, 69, 0.4);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
  }
`;

export const CrashIcon = styled.span`
  font-size: 24px;
`;
