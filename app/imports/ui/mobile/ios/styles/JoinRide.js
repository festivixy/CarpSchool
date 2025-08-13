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
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
  font-weight: 600;

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
    text-transform: none;
    letter-spacing: normal;
    font-weight: normal;
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

export const InfoText = styled.p`
  font-size: 16px;
  color: #8e8e93;
  line-height: 1.4;
  margin: 0 0 24px 0;
  text-align: center;
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

export const JoinRidePageContainer = styled.div`
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

export const JoinRideHeader = styled.div`
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

export const JoinRideHeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

export const JoinRideContent = styled.div`
  padding: 20px;
`;

export const JoinRideForm = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const CodeContainer = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 20px;
`;

export const SuccessModalContainer = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  max-width: 320px;
  width: 100%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

export const SuccessIconContainer = styled.div`
  font-size: 48px;
  margin-bottom: 20px;
`;

export const SuccessHeading = styled.h2`
  margin: 0 0 12px 0;
  font-size: 22px;
  font-weight: 600;
  color: #333;
`;

export const SuccessText = styled.p`
  margin: 0;
  font-size: 16px;
  color: #666;
  line-height: 1.4;
`;

export const MainPageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f5f5f5;
  padding-top: 60px;
  padding-bottom: 100px;
`;

export const FixedHeader = styled.div`
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

export const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

export const ContentPadding = styled.div`
  padding: 20px;
`;

export const FormContainer = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
`;

export const FormTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #333;
  text-align: center;
`;

export const FormDescription = styled.p`
  margin: 0 0 30px 0;
  font-size: 16px;
  color: #666;
  text-align: center;
  line-height: 1.4;
`;

export const CodeInputsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

export const CodeInputWrapper = styled.div`
  /* Wrapper for individual input and separator */
`;

export const CodeInput = styled.input`
  width: 40px;
  height: 50px;
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background-color: white;
  color: #333;
  outline: none;
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: #007AFF;
  }
`;

export const CodeSeparator = styled.span`
  display: inline-block;
  width: 16px;
  text-align: center;
  font-size: 20px;
  color: #ccc;
  vertical-align: middle;
`;

export const FormErrorMessage = styled.div`
  padding: 12px 16px;
  margin-bottom: 20px;
  background-color: #FFEBEE;
  border: 1px solid #FFCDD2;
  border-radius: 8px;
  color: #C62828;
  font-size: 14px;
  text-align: center;
`;

export const SubmitButton = styled.button`
  width: 100%;
  padding: 16px;
  background-color: ${props => (props.enabled ? "#007AFF" : "#ccc")};
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: ${props => (props.enabled ? "pointer" : "not-allowed")};
  transition: background-color 0.2s ease;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

// Additional styled components from JoinRideModal
export const InputSection = styled.div`
  margin-bottom: 32px;
`;

export const CodeInputs = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

export const Dash = styled.span`
  display: inline-block;
  width: 16px;
  text-align: center;
  font-size: 20px;
  color: #ccc;
  vertical-align: middle;
  line-height: 50px;
`;

export const Success = styled.div`
  text-align: center;
  padding: 40px 20px;
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

export const ButtonPrimary = styled.button`
  flex: 1;
  padding: 16px;
  background-color: #007AFF;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0056CC;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;
