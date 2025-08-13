import styled from "styled-components";

export const TestPageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f5f5f5;
  padding-top: 60px;
  overflow-y: auto;
`;

export const TestPageHeader = styled.div`
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

export const TestPageTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

export const TestPageContent = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

export const TestControlsCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const TestControlsTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

export const TestControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
`;

export const TestControlLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

export const ControlItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const TestControlInput = styled.input`
  margin: 0;
`;

export const TestComponentsGrid = styled.div`
  display: grid;
  gap: 24px;
`;

export const TestComponentCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const TestComponentHeader = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
  position: relative;
  z-index: 1;
`;

export const TestComponentTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
`;

export const TestComponentDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
`;

export const TestComponentDemo = styled.div`
  position: relative;
  min-height: 200px;
  overflow: hidden;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
`;

export const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background: white;
`;

export const DemoContainer = styled.div`
  background-color: ${props => (props.$theme === "dark" ? "#333" : "#f8f9fa")};
  padding: 20px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
`;

export const VerboseDemoContainer = styled.div`
  background-color: ${props => (props.$theme === "dark" ? "#222" : "#ffffff")};
  padding: 20px;
  border-radius: 8px;
  position: relative;
  z-index: 1;
`;

export const LiquidGlassDemoContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
`;

export const GlassBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
`;

export const RelativeContainer = styled.div`
  position: relative;
  z-index: 1;
`;

export const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

export const ComparisonCard = styled.div`
  padding: 16px;
  background-color: ${props => props.$bgColor || "#f8f9fa"};
  background: ${props => props.$gradient || "none"};
  border-radius: 8px;
  border: 1px solid #e5e5e5;
`;

export const ComparisonTitle = styled.h4`
  margin: 0 0 8px 0;
  color: ${props => props.$color || "#333"};
  font-size: 16px;
  font-weight: 600;
`;

export const ComparisonDescription = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${props => props.$color || "#666"};
  opacity: ${props => props.$opacity || 1};
  line-height: 1.4;
`;
