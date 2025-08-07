import styled from "styled-components";

export const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
`;

export const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

export const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
`;

export const Title = styled.h1`
  color: #2c3e50;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const Subtitle = styled.p`
  color: #7f8c8d;
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.6;
`;

export const Section = styled.div`
  margin-bottom: 40px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionTitle = styled.h2`
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 20px;
  padding-left: 15px;
  border-left: 4px solid #667eea;
`;

export const SectionContent = styled.div`
  padding: 0 20px;
`;

export const ComponentContainer = styled.div`
  background: #f8f9fa;
  border-radius: 15px;
  padding: 30px;
  border: 2px dashed #dee2e6;
  position: relative;
  
  &::before {
    content: "Test Component Area";
    position: absolute;
    top: -12px;
    left: 20px;
    background: #f8f9fa;
    padding: 0 10px;
    font-size: 0.85rem;
    color: #6c757d;
    font-weight: 500;
  }
`;

export const EnvironmentInfo = styled.div`
  display: grid;
  gap: 20px;
`;

export const InfoCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  
  ol, ul {
    margin: 10px 0;
    padding-left: 20px;
    
    li {
      margin-bottom: 8px;
      line-height: 1.5;
    }
  }
  
  p {
    margin: 15px 0;
    line-height: 1.6;
    
    &:first-child {
      margin-top: 0;
    }
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
  
  &:last-child {
    border-bottom: none;
  }
`;

export const InfoLabel = styled.span`
  font-weight: 600;
  color: #495057;
  font-size: 0.95rem;
`;

export const InfoValue = styled.span`
  color: #667eea;
  font-weight: 500;
  font-size: 0.95rem;
`;

export const ControlsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
`;

export const ControlItem = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
  
  div {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
`;

export const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #495057;
  margin-bottom: 10px;
  font-size: 0.95rem;
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px 15px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  background: #ffffff;
  color: #495057;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const Button = styled.button`
  padding: 10px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

export const NavBarWrapper = styled.div`
  position: relative;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  /* Ensure navbar takes full width if needed */
  > * {
    width: 100%;
  }
`;

export const TestResults = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid #e9ecef;
`;

export const LogOutput = styled.div`
  background: #2c3e50;
  color: #ecf0f1;
  border-radius: 8px;
  padding: 15px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  min-height: 120px;
  max-height: 300px;
  overflow-y: auto;
  
  div {
    margin-bottom: 4px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #34495e;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #667eea;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #764ba2;
  }
`;
