import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 0;
  margin: 0;
`;

export const Header = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1rem 1.5rem;
  margin-bottom: 2rem;
`;

export const AppName = styled.h1`
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
  text-align: center;
`;

export const Content = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 1.5rem 2rem;
`;

export const Copy = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

export const Title = styled.h2`
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
`;

export const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.5;
`;

export const Section = styled.section`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

export const SectionTitle = styled.h3`
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

export const ComponentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: #f7fafc;
  border-radius: 12px;
  border: 2px dashed #e2e8f0;
`;

export const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
`;

export const ControlItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const Label = styled.label`
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 500;
`;

export const Input = styled.input`
  padding: 0.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const InfoCard = styled.div`
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

export const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const InfoLabel = styled.span`
  color: #4a5568;
  font-size: 0.875rem;
  font-weight: 500;
`;

export const InfoValue = styled.span`
  color: #2d3748;
  font-size: 0.875rem;
  font-family: "SF Mono", "Monaco", "Consolas", monospace;
`;

export const PageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f5f5f5;
  padding-top: 60px;
  padding-bottom: 100px;
  overflow-y: auto;
`;

export const FixedHeader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
`;

export const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

export const ContentPadding = styled.div`
  padding: 20px;
`;

export const MainCard = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const MainTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
`;

export const MainDescription = styled.p`
  margin: 0;
  font-size: 16px;
  color: #666;
  line-height: 1.4;
`;

export const TestGrid = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 20px;
`;

export const TestButton = styled.button`
  background-color: white;
  border: none;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const TestIcon = styled.div`
  font-size: 24px;
  min-width: 32px;
  text-align: center;
  user-select: none;
`;

export const TestContent = styled.div`
  flex: 1;
`;

export const TestName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

export const TestDescription = styled.div`
  font-size: 14px;
  color: #666;
  line-height: 1.3;
`;

export const TestArrow = styled.div`
  font-size: 20px;
  color: #999;
  user-select: none;
`;

export const UserInfoCard = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const UserInfoTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

export const UserInfoItem = styled.div`
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
`;

export const UserRoleBadge = styled.div`
  display: inline-block;
  padding: 4px 8px;
  background-color: #007AFF;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;
