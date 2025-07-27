import styled, { keyframes } from "styled-components";

// Styled Components for MyRides
export const Container = styled.div`
  background-color: rgba(248, 249, 250, 1);
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
  text-align: center;
  margin-bottom: 24px;
`;

export const Title = styled.h1`
  font-size: 24px;
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

export const TabsContainer = styled.div`
  display: flex;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 20px;
`;

export const Tab = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${(props) => (props.active ? "rgba(0, 123, 255, 1)" : "transparent")};
  color: ${(props) => (props.active ? "white" : "rgba(100, 100, 100, 1)")};

  &:hover {
    background-color: ${(props) => (props.active ? "rgba(0, 123, 255, 0.9)" : "rgba(0, 123, 255, 0.1)")};
  }

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 10px 12px;
  }
`;

export const TabContent = styled.div`
  width: 100%;
`;

export const SearchSection = styled.div`
  margin-bottom: 20px;
`;

export const SearchContainer = styled.div`
  position: relative;
  max-width: 500px;
  margin: 0 auto;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 20px 12px 44px;
  border: 2px solid rgba(230, 230, 230, 1);
  border-radius: 12px;
  font-size: 16px;
  background-color: rgba(255, 255, 255, 1);
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: rgba(0, 123, 255, 1);
  }

  &::placeholder {
    color: rgba(150, 150, 150, 1);
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: rgba(150, 150, 150, 1);
`;

export const Summary = styled.div`
  text-align: center;
  margin-bottom: 20px;
  color: rgba(100, 100, 100, 1);
  font-size: 14px;
`;

export const RidesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 600px;
  margin: 0 auto;
`;

export const RideWrapper = styled.div`
  background-color: rgba(255, 255, 255, 1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

export const AdditionalActions = styled.div`
  padding: 16px;
  border-top: 1px solid rgba(240, 240, 240, 1);
  background-color: rgba(250, 250, 250, 1);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ContactButton = styled.button`
  background-color: rgba(0, 123, 255, 1);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  flex: 1;

  &:hover {
    background-color: rgba(0, 123, 255, 0.9);
  }
`;

export const CancelButton = styled.button`
  background-color: rgba(255, 71, 87, 1);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 71, 87, 0.9);
  }
`;

export const LeaveButton = styled.button`
  background-color: rgba(255, 193, 7, 1);
  color: rgba(0, 0, 0, 0.8);
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(255, 193, 7, 0.9);
  }
`;

export const Empty = styled.div`
  text-align: center;
  padding: 60px 20px;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

export const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 8px 0;
`;

export const EmptyMessage = styled.p`
  font-size: 14px;
  color: rgba(100, 100, 100, 1);
  margin: 0 0 20px 0;
  line-height: 1.4;
`;

export const ClearSearchButton = styled.button`
  background-color: rgba(108, 117, 125, 1);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(108, 117, 125, 0.9);
  }
`;

export const JoinNewButton = styled.button`
  background-color: rgba(40, 167, 69, 1);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(40, 167, 69, 0.9);
  }
`;

// Loading Animation
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  color: rgba(100, 100, 100, 1);
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(230, 230, 230, 1);
  border-top: 4px solid rgba(0, 123, 255, 1);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 16px;
`;
