import styled from "styled-components";
import { Link } from "react-router-dom";

// Styled Components for SignIn
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
`;

export const Copy = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(0, 0, 0, 1);
  text-align: center;
  justify-content: start;
`;

export const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
`;

export const Subtitle = styled.div`
  font-size: 14px;
  font-weight: 400;
  margin-top: 4px;
`;

export const Form = styled.form`
  margin-top: 24px;
  width: 100%;
  max-width: 327px;
`;

export const InputSection = styled.div`
  width: 100%;
  font-size: 14px;
  line-height: 1.4;
`;

export const Field = styled.div`
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

export const CaptchaSection = styled.div`
  margin: 20px 0;
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

export const SubmitButton = styled.button`
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 1);
  display: flex;
  min-height: 40px;
  width: 100%;
  align-items: center;
  color: rgba(255, 255, 255, 1);
  font-weight: 500;
  justify-content: center;
  padding: 0 16px;
  border: none;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;

  &:hover {
    background-color: rgba(40, 40, 40, 1);
  }
`;

export const ErrorMessage = styled.div`
  background-color: rgba(255, 240, 240, 1);
  border: 1px solid rgba(255, 200, 200, 1);
  border-radius: 8px;
  padding: 12px 16px;
  margin-top: 16px;
  color: rgba(200, 0, 0, 1);
  font-size: 14px;
  text-align: center;
  width: 100%;
  max-width: 327px;
`;

export const Divider = styled.div`
  display: flex;
  margin-top: 24px;
  max-width: 100%;
  width: 327px;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(130, 130, 130, 1);
  font-weight: 400;
  text-align: center;
  line-height: 1.4;
  justify-content: center;
`;

export const DividerLine = styled.div`
  background-color: rgba(230, 230, 230, 1);
  height: 1px;
  flex: 1;
`;

export const DividerText = styled.div`
  padding: 0 8px;
`;

export const Links = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
`;

export const StyledLink = styled(Link)`
  color: rgba(0, 0, 0, 1);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  padding: 8px;

  &:hover {
    text-decoration: underline;
    color: rgba(0, 0, 0, 1);
  }
`;

export const Legal = styled.div`
  color: rgba(130, 130, 130, 1);
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  text-align: center;
  margin-top: 24px;
  max-width: 327px;
`;

export const LegalLink = styled(Link)`
  color: rgba(0, 0, 0, 1);
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

// Clerk-specific styles
export const ClerkCard = styled.div`
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
`;

export const ClerkHeaderTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: rgba(0, 0, 0, 1);
`;

export const ClerkHeaderSubtitle = styled.p`
  font-size: 14px;
  color: rgba(130, 130, 130, 1);
  margin: 0 0 24px 0;
`;

export const ClerkSocialButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(249, 249, 249, 1);
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

export const ClerkFormLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 6px;
  color: rgba(0, 0, 0, 1);
`;

export const ClerkFormInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(0, 0, 0, 0.3);
  }
`;

export const ClerkFooterLink = styled.a`
  color: rgba(0, 0, 0, 1);
  font-size: 14px;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

