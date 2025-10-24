import styled from "styled-components";

export const SmtpContainer = styled.div`
  background-color: rgba(255, 255, 255, 1);
  border-radius: 12px;
  padding: 24px;
  margin: 24px 0;
  border: 1px solid rgba(230, 230, 230, 1);
  max-width: 600px;
`;

export const SmtpHeader = styled.div`
  margin-bottom: 24px;
  text-align: center;
`;

export const SmtpTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin: 0;
`;

export const SmtpSection = styled.div`
  margin-bottom: 24px;
`;

export const SmtpField = styled.div`
  margin-bottom: 20px;
`;

export const SmtpLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin-bottom: 8px;
`;

export const SmtpInput = styled.input`
  width: 100%;
  min-height: 44px;
  padding: 12px 16px;
  border: 2px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  background-color: rgba(255, 255, 255, 1);
  color: rgba(0, 0, 0, 1);
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(34, 197, 94, 1);
  }

  &:disabled {
    background-color: rgba(245, 245, 245, 1);
    cursor: not-allowed;
  }

  &::placeholder {
    color: rgba(130, 130, 130, 1);
  }
`;

export const SmtpSelect = styled.select`
  width: 100%;
  min-height: 44px;
  padding: 12px 16px;
  border: 2px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  background-color: rgba(255, 255, 255, 1);
  color: rgba(0, 0, 0, 1);
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(34, 197, 94, 1);
  }

  &:disabled {
    background-color: rgba(245, 245, 245, 1);
    cursor: not-allowed;
  }
`;

export const SmtpToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: rgba(34, 197, 94, 1);
  }

  span {
    font-size: 14px;
    color: rgba(100, 100, 100, 1);
    font-weight: 500;
  }
`;

export const SmtpButton = styled.button`
  background-color: rgba(34, 197, 94, 1);
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  margin-right: 12px;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: rgba(22, 163, 74, 1);
  }

  &:disabled {
    background-color: rgba(150, 150, 150, 1);
    cursor: not-allowed;
  }
`;

export const SmtpTestButton = styled.button`
  background-color: rgba(59, 130, 246, 1);
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: rgba(37, 99, 235, 1);
  }

  &:disabled {
    background-color: rgba(150, 150, 150, 1);
    cursor: not-allowed;
  }
`;

export const InfoMessage = styled.div`
  background-color: rgba(240, 249, 255, 1);
  border: 1px solid rgba(59, 130, 246, 1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: rgba(30, 64, 175, 1);
  font-size: 14px;
  line-height: 1.5;
`;

export const SuccessMessage = styled.div`
  background-color: rgba(240, 255, 240, 1);
  border: 1px solid rgba(34, 197, 94, 1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  color: rgba(22, 163, 74, 1);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
`;

export const ErrorMessage = styled.div`
  background-color: rgba(255, 240, 240, 1);
  border: 1px solid rgba(220, 53, 69, 1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  color: rgba(220, 53, 69, 1);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
`;
