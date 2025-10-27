import styled from "styled-components";

// Styled Components for Captcha
export const CaptchaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CaptchaLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

export const CaptchaContainer = styled.div`
  display: inline-flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  padding: 13px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  width: 327px;
  height: 94px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 280px;
    max-width: 90vw;
  }

  @media (max-width: 480px) {
    width: 250px;
    max-width: 95vw;
    padding: 10px;
    gap: 8px;
  }
`;

export const CaptchaDisplay = styled.div`
  display: flex;
  padding: 9px 50px 9px 49px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 4px;
  border: 1px solid #dee2e6;
  background: #fff;
  width: 150px;
  height: 50px;
  justify-content: center;

  @media (max-width: 768px) {
    width: 120px;
    padding: 9px 30px;
  }

  @media (max-width: 480px) {
    width: 100px;
    height: 40px;
    padding: 9px 20px;
  }

  svg {
    max-width: 100%;
    height: auto;
  }
`;

export const CaptchaLoading = styled.div`
  display: flex;
  padding: 9px 50px 9px 49px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff;
  border-radius: 4px;
  color: #6c757d;
  font-size: 14px;
  width: 150px;
  height: 50px;
  border: 1px solid #dee2e6;

  @media (max-width: 768px) {
    width: 120px;
    padding: 9px 30px;
  }

  @media (max-width: 480px) {
    width: 100px;
    height: 40px;
    padding: 9px 20px;
    font-size: 12px;
  }
`;

export const CaptchaRefreshButton = styled.button`
  display: flex;
  padding: 10px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: #007bff;
  border: none;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);

  @media (max-width: 480px) {
    padding: 8px;
  }

  &:hover:not(:disabled) {
    background: #0056b3;
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  img {
    width: 20px;
    height: 20px;
    filter: invert(1);

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }
`;

export const CaptchaInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
`;
