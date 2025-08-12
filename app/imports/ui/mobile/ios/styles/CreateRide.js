import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

export const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f2f2f7;
  display: flex;
  flex-direction: column;
  padding-top: 44px; /* Account for native navbar */
`;

export const Content = styled.div`
  flex: 1;
  padding: 16px;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 16px;
  font-weight: 500;
  color: #000000;
  margin-bottom: 4px;
`;

export const Input = styled.input`
  background-color: #ffffff;
  border: 1px solid #c6c6c8;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  color: #000000;

  &:focus {
    outline: none;
    border-color: #007aff;
  }

  &:disabled {
    background-color: #f2f2f7;
    color: #8e8e93;
  }

  &::placeholder {
    color: #8e8e93;
  }
`;

export const TextArea = styled.textarea`
  background-color: #ffffff;
  border: 1px solid #c6c6c8;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 16px;
  color: #000000;
  resize: vertical;
  min-height: 80px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  &:focus {
    outline: none;
    border-color: #007aff;
  }

  &:disabled {
    background-color: #f2f2f7;
    color: #8e8e93;
  }

  &::placeholder {
    color: #8e8e93;
  }
`;

export const Button = styled.button`
  background-color: #007aff;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;

  &:active {
    background-color: #0056cc;
  }

  &:disabled {
    background-color: #8e8e93;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  background-color: #ffebee;
  color: #d32f2f;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  border: 1px solid #ffcdd2;
`;

export const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

export const SuccessOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

export const SuccessModal = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 40px 30px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 320px;
  width: 100%;
`;

export const SuccessIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
`;

export const SuccessTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px;
`;

export const SuccessMessage = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0 0 30px;
  line-height: 1.5;
`;

export const CreateRidePageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f5f5f5;
  padding-top: 60px;
  padding-bottom: 100px;
  overflow-y: auto;
`;

export const CreateRideHeader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
`;

export const CreateRideHeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

export const CreateRideContent = styled.div`
  padding: 20px;
`;

export const CreateRideForm = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const FormField = styled.div`
  margin-bottom: 20px;
`;

export const DateTimeRow = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
`;

export const FlexField = styled.div`
  flex: 1;
`;
