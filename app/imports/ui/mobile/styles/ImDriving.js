import styled, { keyframes } from "styled-components";

// Styled Components for ImDriving
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
  padding: 12px 16px 12px 44px;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  background-color: rgba(255, 255, 255, 1);
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }
`;

export const SearchIcon = styled.span`
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
  font-size: 14px;
  color: rgba(100, 100, 100, 1);
`;

export const RidesContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

export const RideWrapper = styled.div`
  margin-bottom: 16px;
`;

export const AdditionalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

export const ContactButton = styled.button`
  flex: 1;
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background-color: rgba(40, 40, 40, 1);
    transform: translateY(-1px);
  }
`;

export const CancelButton = styled.button`
  flex: 1;
  background-color: rgba(244, 67, 54, 1);
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background-color: rgba(211, 47, 47, 1);
    transform: translateY(-1px);
  }
`;

export const Empty = styled.div`
  text-align: center;
  padding: 60px 20px;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

export const EmptyIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

export const EmptyTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin: 0 0 8px 0;
`;

export const EmptyMessage = styled.p`
  font-size: 14px;
  color: rgba(100, 100, 100, 1);
  margin: 0 0 20px 0;
  line-height: 1.4;
`;

export const ClearSearchButton = styled.button`
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;

  &:hover {
    background-color: rgba(40, 40, 40, 1);
  }
`;

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  text-align: center;

  p {
    font-size: 16px;
    color: rgba(100, 100, 100, 1);
    margin: 0;
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(240, 240, 240, 1);
  border-top: 3px solid rgba(0, 0, 0, 1);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 16px;
`;
