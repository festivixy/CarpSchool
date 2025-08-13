import styled from "styled-components";

export const FlexContainer = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
  ${props => props.$marginTop && `margin-top: ${props.$marginTop};`}
`;

export const MarginContainer = styled.div`
  margin-top: 20px;
`;

export const InlineText = styled.span`
  margin-left: 20px;
`;

export const CenteredContainer = styled.div`
  margin-top: 16px;
  text-align: center;
`;

export const DemoContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

export const DemoSection = styled.section`
  margin-bottom: 40px;
`;

export const DemoTitle = styled.h2`
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
`;

export const DemoDescription = styled.p`
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
`;

export const ComponentGrid = styled.div`
  display: grid;
  gap: 24px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

export const ComponentDemo = styled.div`
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: white;
`;

export const ComponentTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
`;

export const ComponentControls = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 4px;
`;

export const DemoCode = styled.pre`
  background: #f4f4f4;
  padding: 12px;
  border-radius: 4px;
  font-size: 14px;
  overflow-x: auto;
  margin: 16px 0;
`;
