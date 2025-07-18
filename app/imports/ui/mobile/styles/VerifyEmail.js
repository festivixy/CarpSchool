import styled from "styled-components";
import { Link } from "react-router-dom";

// Styled Components for VerifyEmail
export const Container = styled.div`
  background-color: rgba(255, 255, 255, 1);
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  margin: 0 auto;
  padding: 10px 0;
  min-height: 100vh;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

export const Header = styled.div`
  display: flex;
  width: 224px;
  max-width: 100%;
  flex-direction: column;
  font-size: 24px;
  color: rgba(0, 0, 0, 1);
  font-weight: 600;
  text-align: center;
  letter-spacing: -0.24px;
  align-items: center;
`;

export const AppName = styled.div`
  margin-top: 75px;
`;

export const Content = styled.div`
  display: flex;
  margin-top: 74px;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 0 24px;
  max-width: 400px;

  @media (max-width: 480px) {
    padding: 0 16px;
  }
`;

export const Icon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.8;

  @media (max-width: 480px) {
    font-size: 48px;
  }
`;

export const Copy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(0, 0, 0, 1);
  text-align: center;
  justify-content: start;
  margin-bottom: 32px;
`;

export const Title = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

export const Subtitle = styled.div`
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: rgba(100, 100, 100, 1);

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const Actions = styled.div`
  margin-bottom: 32px;
`;

export const ActionLink = styled(Link)`
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);
  text-decoration: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: inline-block;

  &:hover {
    background-color: rgba(40, 40, 40, 1);
    color: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
  }
`;

export const Help = styled.div`
  background-color: rgba(248, 249, 250, 1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  width: 100%;
  box-sizing: border-box;

  p {
    font-size: 14px;
    font-weight: 600;
    color: rgba(0, 0, 0, 1);
    margin: 0 0 12px 0;
  }

  ul {
    margin: 0;
    padding-left: 16px;
    font-size: 14px;
    color: rgba(100, 100, 100, 1);
    line-height: 1.5;
  }

  li {
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

export const CaptchaSection = styled.div`
  margin: 20px 0 16px 0;
  text-align: center;
`;

export const CaptchaLabel = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 1);
`;

export const CaptchaContainer = styled.div`
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
  background-color: rgba(249, 249, 249, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  position: relative;
`;

export const CaptchaLoading = styled.div`
  color: rgba(130, 130, 130, 1);
  font-size: 14px;
`;

export const CaptchaDisplay = styled.div`
  line-height: 1;
`;

export const CaptchaRefreshIcon = styled.button`
  position: absolute;
  bottom: 4px;
  right: 4px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(200, 200, 200, 1);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(2px);
  padding: 0;

  img {
    width: 14px;
    height: 14px;
    opacity: 0.7;
  }

  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 1);
    border-color: rgba(0, 0, 0, 0.3);
    transform: scale(1.1);

    img {
      opacity: 1;
    }
  }

  &:disabled {
    background-color: rgba(245, 245, 245, 0.8);
    cursor: not-allowed;
    transform: none;

    img {
      opacity: 0.3;
    }
  }
`;

export const CaptchaInputWrapper = styled.div`
  margin-bottom: 16px;
`;

export const Input = styled.input`
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 1);
  display: flex;
  min-height: 40px;
  width: 100%;
  color: rgba(130, 130, 130, 1);
  font-weight: 400;
  padding: 10px 16px;
  border: 1px solid rgba(224, 224, 224, 1);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(0, 0, 0, 0.3);
    color: rgba(0, 0, 0, 1);
  }

  &::placeholder {
    color: rgba(130, 130, 130, 1);
  }
`;

export const ResendButton = styled.button`
  background-color: rgba(0, 122, 255, 1);
  color: rgba(255, 255, 255, 1);
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
  width: 100%;
  box-sizing: border-box;

  &:hover:not(:disabled) {
    background-color: rgba(0, 100, 220, 1);
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: rgba(150, 150, 150, 1);
    cursor: not-allowed;
    transform: none;
  }
`;

export const SuccessMessage = styled.div`
  background-color: rgba(46, 160, 67, 0.1);
  color: rgba(46, 160, 67, 1);
  border: 1px solid rgba(46, 160, 67, 0.2);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
`;

export const ErrorMessage = styled.div`
  background-color: rgba(255, 59, 48, 0.1);
  color: rgba(255, 59, 48, 1);
  border: 1px solid rgba(255, 59, 48, 0.2);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  margin-top: 12px;
  text-align: center;
`;

export const Legal = styled.div`
  color: rgba(130, 130, 130, 1);
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  text-align: center;
  max-width: 327px;
`;

export const LegalLink = styled(Link)`
  color: rgba(0, 0, 0, 1);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
