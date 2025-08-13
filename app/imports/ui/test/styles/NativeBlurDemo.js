import styled from "styled-components";

export const FlexContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

export const BlurContainer = styled.div`
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 16px;
  margin: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
`;

export const InfoText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
`;

export const DemoGrid = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const DemoPanel = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  min-width: 200px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const PanelContent = styled.div`
  padding: 16px;
  text-align: center;
`;

export const PanelTitle = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  color: white;
`;

export const PanelSubtext = styled.div`
  font-size: 12px;
  opacity: 0.8;
  color: white;
`;
