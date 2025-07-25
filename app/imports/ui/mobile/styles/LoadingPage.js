import styled, { keyframes } from "styled-components";

// Spinner rotation animation
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Pulse animation for text
const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 40px 20px;
  text-align: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  
  @media (max-width: 768px) {
    min-height: 40vh;
    padding: 30px 15px;
  }
`;

export const LoadingSpinner = styled.div`
  width: ${props => {
    switch (props.size) {
      case 'small': return '40px';
      case 'large': return '80px';
      default: return '60px';
    }
  }};
  height: ${props => {
    switch (props.size) {
      case 'small': return '40px';
      case 'large': return '80px';
      default: return '60px';
    }
  }};
  margin-bottom: 24px;
  position: relative;
`;

export const SpinnerCircle = styled.div`
  width: 100%;
  height: 100%;
  border: 4px solid #e3e3e3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  
  /* Add inner shadow for depth */
  box-shadow: 
    0 0 0 1px rgba(52, 152, 219, 0.1),
    inset 0 0 10px rgba(52, 152, 219, 0.1);
`;

export const LoadingMessage = styled.h2`
  color: #2c3e50;
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  animation: ${pulse} 2s ease-in-out infinite;
  
  @media (max-width: 768px) {
    font-size: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const LoadingSubMessage = styled.p`
  color: #7f8c8d;
  font-size: 16px;
  font-weight: 400;
  margin: 0;
  max-width: 400px;
  line-height: 1.5;
  
  @media (max-width: 768px) {
    font-size: 14px;
    max-width: 300px;
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    max-width: 250px;
  }
`;
