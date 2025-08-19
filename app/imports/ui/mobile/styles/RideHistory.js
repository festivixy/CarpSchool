import styled from "styled-components";

export const Container = styled.div`
  background-color: rgba(255, 255, 255, 1);
  min-height: 100vh;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const Header = styled.div`
  margin-bottom: 24px;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 16px;
  color: rgba(33, 150, 243, 1);
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 12px;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

export const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;
`;

export const Subtitle = styled.p`
  font-size: 16px;
  color: rgba(100, 100, 100, 1);
  margin: 0;
  line-height: 1.4;
`;

export const HistoryContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

export const HistorySection = styled.div`
  margin-bottom: 32px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

export const HistorySectionTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(224, 224, 224, 1);
`;

export const TimelineItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-left: 3px solid ${props => props.completed ? 'rgba(76, 175, 80, 1)' : 'rgba(224, 224, 224, 1)'};
  padding-left: 16px;
  margin-left: 12px;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: -8px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: ${props => props.completed ? 'rgba(76, 175, 80, 1)' : 'rgba(224, 224, 224, 1)'};
    border: 2px solid white;
    box-shadow: 0 0 0 2px ${props => props.completed ? 'rgba(76, 175, 80, 1)' : 'rgba(224, 224, 224, 1)'};
  }
`;

export const TimelineInfo = styled.div`
  flex: 1;
`;

export const TimelineTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 4px;
`;

export const TimelineTime = styled.div`
  font-size: 14px;
  color: rgba(100, 100, 100, 1);
`;

export const RiderProgressItem = styled.div`
  padding: 16px;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 12px;
  margin-bottom: 12px;
  background-color: rgba(249, 249, 249, 1);
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

export const RiderProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const RiderProgressName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
`;

export const RiderProgressStatus = styled.div`
  font-size: 14px;
  color: ${props => props.completed ? 'rgba(76, 175, 80, 1)' : 'rgba(255, 152, 0, 1)'};
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 6px;
  background-color: ${props => props.completed ? 'rgba(76, 175, 80, 0.1)' : 'rgba(255, 152, 0, 0.1)'};
`;

export const RiderProgressDetails = styled.div`
  font-size: 14px;
  color: rgba(100, 100, 100, 1);
  line-height: 1.5;
  
  div {
    margin-bottom: 4px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const EventItem = styled.div`
  padding: 12px 16px;
  border-left: 4px solid rgba(33, 150, 243, 1);
  margin-bottom: 12px;
  background-color: rgba(245, 245, 245, 1);
  border-radius: 0 8px 8px 0;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: rgba(240, 240, 240, 1);
  }
`;

export const EventTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin-bottom: 6px;
`;

export const EventDetails = styled.div`
  font-size: 13px;
  color: rgba(100, 100, 100, 1);
  line-height: 1.4;
  
  div {
    margin-bottom: 2px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const NotFound = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  margin-top: 40px;
`;

export const NotFoundIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.5;
`;

export const NotFoundTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 12px 0;
`;

export const NotFoundMessage = styled.p`
  font-size: 16px;
  color: rgba(100, 100, 100, 1);
  margin: 0;
  line-height: 1.5;
  max-width: 400px;
`;
