import styled, { keyframes } from "styled-components";

const modalSlideIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const successPulse = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
  backdrop-filter: blur(4px);
`;

export const Modal = styled.div`
  background-color: rgba(255, 255, 255, 1);
  border-radius: 16px;
  max-width: 400px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  animation: ${modalSlideIn} 0.3s ease-out;

  @media (max-width: 480px) {
    margin: 10px;
    border-radius: 12px;
  }
`;

export const Header = styled.div`
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid rgba(240, 240, 240, 1);
  position: relative;
  text-align: center;
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

  &:hover {
    background-color: rgba(240, 240, 240, 1);
    color: rgba(0, 0, 0, 1);
  }
`;

export const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;
`;

export const Subtitle = styled.div`
  font-size: 14px;
  color: rgba(100, 100, 100, 1);
  margin: 0;
  line-height: 1.4;
`;

export const Content = styled.div`
  padding: 24px;
`;

export const InputSection = styled.div`
  margin-bottom: 32px;
`;

export const CodeInputs = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

export const CodeInput = styled.input`
  width: 32px;
  height: 48px;
  border: 2px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  font-family: "SF Mono", "Monaco", "Consolas", monospace;
  background-color: rgba(255, 255, 255, 1);
  transition: all 0.2s ease;
  outline: none;
  color: rgba(0, 0, 0, 1);

  &:focus {
    border-color: rgba(0, 0, 0, 1);
    box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
  }

  &:not(:placeholder-shown) {
    border-color: rgba(0, 150, 0, 1);
    background-color: rgba(240, 255, 240, 1);
  }

  @media (max-width: 480px) {
    width: 28px;
    height: 44px;
    font-size: 16px;
  }
`;

export const Dash = styled.span`
  font-size: 20px;
  font-weight: 600;
  color: rgba(150, 150, 150, 1);
  margin: 0 4px;
  font-family: "SF Mono", "Monaco", "Consolas", monospace;
`;

export const ErrorMessage = styled.div`
  background-color: rgba(255, 240, 240, 1);
  border: 1px solid rgba(255, 200, 200, 1);
  border-radius: 8px;
  padding: 12px 16px;
  color: rgba(200, 0, 0, 1);
  font-size: 14px;
  text-align: center;
  margin-top: 16px;
`;

export const Success = styled.div`
  text-align: center;
  padding: 20px 0;
`;

export const SuccessIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: rgba(0, 200, 0, 1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 20px auto;
  animation: ${successPulse} 0.6s ease-out;
`;

export const SuccessTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin: 0 0 8px 0;
`;

export const SuccessMessage = styled.p`
  font-size: 14px;
  color: rgba(100, 100, 100, 1);
  line-height: 1.4;
  margin: 0;
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

export const ButtonPrimary = styled.button`
  flex: 1;
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover:not(:disabled) {
    background-color: rgba(40, 40, 40, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: rgba(200, 200, 200, 1);
    color: rgba(150, 150, 150, 1);
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 480px) {
    flex: none;
  }
`;

export const ButtonSecondary = styled.button`
  flex: 1;
  background-color: rgba(245, 245, 245, 1);
  color: rgba(100, 100, 100, 1);
  border: none;
  border-radius: 12px;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover:not(:disabled) {
    background-color: rgba(230, 230, 230, 1);
    color: rgba(0, 0, 0, 1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    flex: none;
  }
`;
