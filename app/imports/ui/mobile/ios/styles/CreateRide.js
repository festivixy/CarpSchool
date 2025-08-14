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

// Page container with normal page styling
export const CreateRidePageContainer = styled.div`
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 20px 0; /* Only top/bottom padding, no left/right */
`;

// Page content without modal container styling
export const CreateRideContent = styled.div`
  background-color: rgba(255, 255, 255, 1);
  border-radius: 16px;
  max-width: 400px;
  width: calc(100% - 32px);
  margin: 0 auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  animation: ${modalSlideIn} 0.3s ease-out;

  @media (max-width: 480px) {
    width: calc(100% - 32px);
    margin: 0 16px;
    border-radius: 12px;
    max-height: 95vh;
  }
`;

export const CreateRideHeader = styled.div`
  padding: 24px 24px 16px 24px;
  border-bottom: 1px solid rgba(240, 240, 240, 1);
  position: relative;
  text-align: center;
`;

export const CreateRideHeaderTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;
`;

export const Content = styled.div`
  padding: 24px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Section = styled.div`
  background-color: rgba(248, 249, 250, 1);
  border-radius: 12px;
  padding: 16px;
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const Field = styled.div`
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: rgba(0, 0, 0, 1);
  margin-bottom: 6px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background-color: rgba(255, 255, 255, 1);
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background-color: rgba(255, 255, 255, 1);
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background-color: rgba(255, 255, 255, 1);
  transition: all 0.2s ease;
  box-sizing: border-box;
  resize: vertical;
  min-height: 60px;

  &:focus {
    outline: none;
    border-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
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
  gap: 12px;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0;
  }
`;

export const FieldHalf = styled.div`
  flex: 1;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

export const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const DropdownTrigger = styled.div`
  position: relative;
  cursor: pointer;
  width: 100%;
  display: block;
`;

export const DropdownInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  padding-right: 40px;
  cursor: pointer;
  box-sizing: border-box;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background-color: rgba(255, 255, 255, 1);
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: rgba(0, 0, 0, 0.3);
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
  }
`;

export const DropdownArrow = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(150, 150, 150, 1);
  font-size: 12px;
  pointer-events: none;
  line-height: 1;
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 150px;
  overflow-y: auto;
  margin-top: 4px;
`;

export const DropdownItem = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid rgba(240, 240, 240, 1);
  transition: background-color 0.2s ease;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(248, 249, 250, 1);
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
  margin: 6px 0;
`;

export const SwapButton = styled.button`
  background-color: rgba(255, 255, 255, 1);
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: rgba(100, 100, 100, 1);
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(230, 230, 230, 1);
    color: rgba(0, 0, 0, 1);
    transform: scale(1.05);
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
