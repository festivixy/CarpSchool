import styled, { keyframes } from "styled-components";

const modalSlideIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const overlayFadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(4px);
  animation: ${overlayFadeIn} 0.2s ease-out;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const Modal = styled.div`
  background-color: rgba(255, 255, 255, 1);
  border-radius: 16px;
  max-width: 420px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  animation: ${modalSlideIn} 0.3s ease-out;
  
  @media (max-width: 768px) {
    border-radius: 12px;
    max-width: 100%;
  }
`;

export const Header = styled.div`
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid rgba(240, 240, 240, 1);
  position: relative;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 20px 20px 12px 20px;
  }
`;

export const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 18px;
  color: rgba(100, 100, 100, 1);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: rgba(240, 240, 240, 1);
    color: rgba(0, 0, 0, 1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    top: 16px;
    right: 16px;
    width: 28px;
    height: 28px;
    font-size: 16px;
  }
`;

export const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;
  line-height: 1.3;
  padding-right: 40px;
  
  @media (max-width: 768px) {
    font-size: 18px;
    padding-right: 32px;
  }
`;

export const Subtitle = styled.p`
  font-size: 14px;
  color: rgba(100, 100, 100, 1);
  margin: 0;
  line-height: 1.4;
  padding-right: 40px;
  
  @media (max-width: 768px) {
    font-size: 13px;
    padding-right: 32px;
  }
`;

export const Content = styled.div`
  padding: 0 24px 16px 24px;
  min-height: 20px;
  
  @media (max-width: 768px) {
    padding: 0 20px 12px 20px;
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px 24px;
  border-top: 1px solid rgba(240, 240, 240, 1);
  
  @media (max-width: 768px) {
    padding: 12px 20px 20px 20px;
    flex-direction: column-reverse;
    gap: 8px;
  }
`;

export const ButtonSecondary = styled.button`
  flex: 1;
  background-color: rgba(248, 249, 250, 1);
  color: rgba(0, 0, 0, 0.87);
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: rgba(240, 240, 240, 1);
    border-color: rgba(200, 200, 200, 1);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
  }
`;

export const ButtonPrimary = styled.button`
  flex: 1;
  background-color: ${props => (props.destructive ? "rgba(220, 38, 38, 1)" : "rgba(0, 0, 0, 1)")};
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    background-color: ${props => (props.destructive ? "rgba(185, 28, 28, 1)" : "rgba(30, 30, 30, 1)")};
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
  }
`;

export const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid rgba(255, 255, 255, 1);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

export const ErrorMessage = styled.div`
  background-color: rgba(254, 242, 242, 1);
  border: 1px solid rgba(252, 165, 165, 1);
  color: rgba(153, 27, 27, 1);
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.4;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 10px;
  }
`;
