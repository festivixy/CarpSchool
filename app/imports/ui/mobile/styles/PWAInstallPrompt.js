import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const ModalOverlay = styled.div`
  display: ${props => (props.$isVisible ? "flex" : "none")};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7));
  backdrop-filter: blur(10px);
  justify-content: center;
  align-items: flex-end;
  z-index: 99999;
  padding: 0 16px 16px 16px;
  animation: ${fadeIn} 0.3s ease-out;

  * {
    box-sizing: border-box;
  }

  @media (min-width: 768px) {
    align-items: center;
    padding: 16px;
  }
`;

export const ModalContent = styled.div`
  width: 100%;
  max-width: 400px;
  background: linear-gradient(145deg, #ffffff, #f8f9fa);
  border-radius: 24px 24px 16px 16px;
  padding: 32px 24px 24px 24px;
  position: relative;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.5);
  animation: ${slideUp} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  &::before {
    content: '';
    position: absolute;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 4px;
    background: linear-gradient(90deg, #e2e8f0, #cbd5e0);
    border-radius: 2px;
  }

  h1 {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 16px 0;
    text-align: center;
    background: linear-gradient(135deg, #1a202c, #2d3748);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.3;
  }

  @media (min-width: 768px) {
    border-radius: 20px;
    animation: ${fadeIn} 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

    &::before {
      display: none;
    }
  }
`;

export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
`;

export const AppLogo = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  object-fit: cover;
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.15),
    0 4px 8px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

export const AppName = styled.h2`
  margin: 0;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  letter-spacing: -0.01em;
`;

export const InstallButton = styled.button`
  width: 100%;
  background: ${props => (props.disabled
    ? "linear-gradient(135deg, #e2e8f0, #cbd5e0)"
    : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)")};
  color: ${props => (props.disabled ? "#718096" : "#ffffff")};
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 600;
  padding: 16px 24px;
  cursor: ${props => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${props => (props.disabled ? 0.6 : 1)};
  transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
  box-shadow: ${props => (props.disabled
    ? "none"
    : "0 8px 16px rgba(102, 126, 234, 0.3), 0 4px 8px rgba(0, 0, 0, 0.1)")};
  position: relative;
  overflow: hidden;
  letter-spacing: -0.01em;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    transform: translateY(-2px);
    box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4), 0 8px 16px rgba(0, 0, 0, 0.15);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

export const SkipButton = styled.button`
  all: initial;
  font: inherit;
  width: 100%;
  text-align: center;
  cursor: pointer;
  color: #718096;
  font-size: 14px;
  font-weight: 500;
  margin-top: 16px;
  padding: 12px;
  border-radius: 12px;
  transition: all 0.2s ease;
  background: transparent;

  &:hover {
    color: #4a5568;
    background: rgba(113, 128, 150, 0.1);
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const IOSInstructions = styled.div`
  background: linear-gradient(135deg, #f7fafc, #edf2f7);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);

  ol {
    margin: 0;
    padding: 0;
    margin-left: 20px;
    counter-reset: step-counter;
  }

  li {
    margin-bottom: 16px;
    padding-left: 8px;
    font-size: 15px;
    line-height: 1.5;
    color: #4a5568;
    counter-increment: step-counter;
    position: relative;

    &::marker {
      font-weight: 600;
      color: #667eea;
    }

    &:last-child {
      margin-bottom: 0;
    }

    p {
      margin: 4px 0 0 0;
      font-weight: 500;
    }
  }
`;

export const ShareIcon = styled.span`
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  margin: 0 6px;
  padding: 4px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 6px;
  color: white;

  svg {
    fill: currentColor;
    filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
  }
`;
