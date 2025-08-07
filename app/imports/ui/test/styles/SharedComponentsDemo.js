import styled from "styled-components";

export const DemoContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

export const DemoTitle = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: #1C1C1E;
  text-align: center;
  margin: 0 0 16px 0;

  @media (max-width: 768px) {
    font-size: 28px;
  }

  @media (prefers-color-scheme: dark) {
    color: #F2F2F7;
  }
`;

export const DemoDescription = styled.p`
  font-size: 18px;
  color: #666;
  text-align: center;
  line-height: 1.6;
  margin: 0 0 40px 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;

  ul {
    text-align: left;
    margin-top: 16px;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 30px;
  }

  @media (prefers-color-scheme: dark) {
    color: #AEAEB2;
  }
`;

export const DemoSection = styled.section`
  margin: 60px 0;
  padding: 40px;
  background: #FAFAFA;
  border-radius: 16px;
  border: 1px solid #E5E5EA;

  @media (max-width: 768px) {
    margin: 40px 0;
    padding: 24px;
  }

  @media (prefers-color-scheme: dark) {
    background: #1C1C1E;
    border-color: #2C2C2E;
  }
`;

export const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
    margin-bottom: 30px;
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

export const ComponentDemo = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  border: 1px solid #E5E5EA;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 24px;
    border-radius: 12px;
  }

  @media (prefers-color-scheme: dark) {
    background: #1C1C1E;
    border-color: #2C2C2E;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }
`;

export const ComponentTitle = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #1C1C1E;
  margin: 0 0 20px 0;
  border-bottom: 2px solid #E5E5EA;
  padding-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 16px;
  }

  @media (prefers-color-scheme: dark) {
    color: #F2F2F7;
    border-color: #2C2C2E;
  }
`;

export const ComponentControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;

  /* Special handling for button demos */
  &:has(button) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 12px;
  }

  @media (max-width: 768px) {
    gap: 12px;

    &:has(button) {
      flex-direction: column;
      align-items: stretch;
    }
  }
`;

export const DemoCode = styled.pre`
  background: #F8F8F8;
  border: 1px solid #E5E5EA;
  border-radius: 8px;
  padding: 16px;
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #1C1C1E;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 12px;
  }

  @media (prefers-color-scheme: dark) {
    background: #2C2C2E;
    border-color: #3A3A3C;
    color: #F2F2F7;
  }
`;
