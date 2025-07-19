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
