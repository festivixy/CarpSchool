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

// Page container with gradient background like skeleton
export const CreateRidePageContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  position: relative;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  margin: 0;
  padding: 0;
  width: 100%;
  overflow-x: hidden;
`;

// Page content with modern rounded design like skeleton
export const CreateRideContent = styled.div`
  background: #ffffff;
  border-radius: 24px 24px 0 0;
  min-height: 100vh;
  margin-top: 120px;
  position: relative;
  z-index: 2;

  @media (max-width: 480px) {
    border-radius: 20px 20px 0 0;
    margin-top: 100px;
    min-height: 100vh;
  }
`;

export const CreateRideHeader = styled.div`
  text-align: center;
  padding: 60px 20px 20px;
  background: transparent;
  border: none;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  margin: 0;
`;

export const CreateRideHeaderTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: rgba(255, 255, 255, 1);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

export const Content = styled.div`
  padding: 32px 24px;

  @media (max-width: 480px) {
    padding: 24px 20px;
  }
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: rgba(60, 60, 60, 1);
  margin: 0;
`;

export const Input = styled.input`
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const Select = styled.select`
  width: 100%;
  height: 48px;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  min-height: 96px;
  padding: 12px 16px;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  background-color: #f8f9fa;
  transition: all 0.2s ease;
  box-sizing: border-box;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #667eea;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const CharCount = styled.div`
  font-size: 11px;
  color: rgba(150, 150, 150, 1);
  text-align: right;
  margin-top: 4px;
`;

export const DateTimeRow = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 20px;
  }
`;

export const FieldHalf = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const DropdownTrigger = styled.div`
  position: relative;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
`;

export const DropdownInput = styled.input`
  width: 100%;
  height: 48px;
  padding: 12px 50px 12px 16px;
  cursor: pointer;
  box-sizing: border-box;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  background-color: #f8f9fa;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
`;

export const DropdownArrow = styled.span`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(150, 150, 150, 1);
  font-size: 14px;
  pointer-events: none;
  line-height: 1;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid #e9ecef;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 8px;
`;

export const DropdownItem = styled.div`
  padding: 16px;
  cursor: pointer;
  border-bottom: 1px solid #f8f9fa;
  transition: all 0.2s ease;
  font-size: 16px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8f9fa;
  }

  &.no-results {
    color: rgba(150, 150, 150, 1);
    font-style: italic;
    cursor: default;

    &:hover {
      background-color: transparent;
    }
  }
`;

export const SwapContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 12px 0;
`;

export const SwapButton = styled.button`
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 16px;
  color: #667eea;
  transition: all 0.2s ease;

  &:hover {
    background-color: #667eea;
    color: white;
    transform: scale(1.05);
    border-color: #667eea;
  }
`;

export const ErrorMessage = styled.div`
  background-color: rgba(255, 240, 240, 1);
  border: 1px solid rgba(255, 200, 200, 1);
  border-radius: 8px;
  padding: 12px 16px;
  color: rgba(200, 0, 0, 1);
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
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
  width: 100%;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 28px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  margin-top: 24px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  &:disabled {
    background: #e9ecef;
    color: #adb5bd;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
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
  margin: 0 0 16px 0;
`;

export const SuccessDetails = styled.div`
  background-color: rgba(248, 249, 250, 1);
  border-radius: 8px;
  padding: 12px;
  text-align: left;
  font-size: 13px;
  color: rgba(60, 60, 60, 1);

  div {
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
`;

export const SuccessDetailItem = styled.div`
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;
