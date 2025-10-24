import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";

// Keyframes for spinner animation
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

// Styled Components for EditProfile
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
`;

export const Loading = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(100, 100, 100, 1);
`;

export const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid rgba(240, 240, 240, 1);
  border-top: 4px solid rgba(0, 0, 0, 1);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 16px;
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
  margin-top: 40px;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 0 24px;
  max-width: 500px;
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
  margin-bottom: 8px;
`;

export const Subtitle = styled.div`
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  color: rgba(100, 100, 100, 1);
`;

export const Form = styled.form`
  width: 100%;
  max-width: 500px;
`;

export const InputSection = styled.div`
  width: 100%;
  font-size: 14px;
  line-height: 1.4;
`;

export const Section = styled.div`
  margin-bottom: 32px;
  padding: 24px;
  background-color: rgba(248, 249, 250, 1);
  border-radius: 12px;
  border: 1px solid rgba(230, 230, 230, 1);

  @media (max-width: 480px) {
    padding: 20px;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin: 0 0 20px 0;
  border-bottom: 2px solid rgba(0, 0, 0, 1);
  padding-bottom: 8px;
`;

export const Field = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  font-size: 14px;
  color: rgba(0, 0, 0, 1);
`;

export const Input = styled.input`
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 1);
  display: flex;
  min-height: 44px;
  width: 100%;
  color: rgba(130, 130, 130, 1);
  font-weight: 400;
  padding: 12px 16px;
  border: 2px solid rgba(224, 224, 224, 1);
  font-size: 16px;
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

export const Select = styled.select`
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 1);
  display: flex;
  min-height: 44px;
  width: 100%;
  color: rgba(130, 130, 130, 1);
  font-weight: 400;
  padding: 12px 16px;
  border: 2px solid rgba(224, 224, 224, 1);
  font-size: 16px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(0, 0, 0, 0.3);
    color: rgba(0, 0, 0, 1);
  }
`;

export const FileInput = styled.input`
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 1);
  width: 100%;
  padding: 12px 16px;
  border: 2px solid rgba(224, 224, 224, 1);
  font-size: 16px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(0, 0, 0, 0.3);
  }
`;

export const FileInfo = styled.div`
  font-size: 12px;
  color: rgba(100, 100, 100, 1);
  margin-top: 4px;
`;

export const ImagePreview = styled.div`
  margin-bottom: 16px;
  text-align: center;
`;

export const PreviewImg = styled.img`
  max-width: 150px;
  max-height: 150px;
  border-radius: 8px;
  border: 2px solid rgba(224, 224, 224, 1);
  object-fit: cover;
`;

export const CaptchaContainer = styled.div`
  border: 2px solid rgba(224, 224, 224, 1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: rgba(255, 255, 255, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
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
  bottom: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(200, 200, 200, 1);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(2px);
  padding: 0;

  img {
    width: 16px;
    height: 16px;
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

export const UploadSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background-color: rgba(240, 248, 255, 1);
  border-radius: 8px;
  border: 2px solid rgba(200, 220, 240, 1);
`;

export const UploadButton = styled.button`
  border-radius: 8px;
  background-color: rgba(0, 100, 200, 1);
  display: flex;
  min-height: 44px;
  width: 100%;
  align-items: center;
  color: rgba(255, 255, 255, 1);
  font-weight: 600;
  justify-content: center;
  padding: 0 16px;
  border: none;
  font-size: 16px;
  font-family: inherit;
  cursor: pointer;
  margin-top: 16px;

  &:hover:not(:disabled) {
    background-color: rgba(0, 80, 160, 1);
  }

  &:disabled {
    background-color: rgba(150, 150, 150, 1);
    cursor: not-allowed;
  }
`;

export const Button = styled.button`
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 1);
  display: flex;
  min-height: 48px;
  width: 100%;
  align-items: center;
  color: rgba(255, 255, 255, 1);
  font-weight: 600;
  justify-content: center;
  padding: 0 16px;
  border: none;
  font-size: 16px;
  font-family: inherit;
  cursor: pointer;
  margin-bottom: 24px;

  &:hover:not(:disabled) {
    background-color: rgba(40, 40, 40, 1);
  }

  &:disabled {
    background-color: rgba(150, 150, 150, 1);
    cursor: not-allowed;
  }
`;

export const RoleChangeButton = styled.button`
  border-radius: 8px;
  background-color: rgba(220, 53, 69, 1);
  display: flex;
  min-height: 48px;
  width: 100%;
  align-items: center;
  color: rgba(255, 255, 255, 1);
  font-weight: 600;
  justify-content: center;
  padding: 0 16px;
  border: none;
  font-size: 16px;
  font-family: inherit;
  cursor: pointer;
  margin-bottom: 12px;

  &:hover:not(:disabled) {
    background-color: rgba(200, 35, 51, 1);
  }

  &:disabled {
    background-color: rgba(150, 150, 150, 1);
    cursor: not-allowed;
  }
`;

export const ReverifyWarning = styled.div`
  background-color: rgba(255, 248, 220, 1);
  border: 1px solid rgba(255, 204, 128, 1);
  border-radius: 8px;
  padding: 12px 16px;
  color: rgba(156, 111, 0, 1);
  font-size: 14px;
  text-align: center;
  font-weight: 500;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background-color: rgba(255, 255, 255, 1);
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

export const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px 24px;
  border-bottom: 1px solid rgba(230, 230, 230, 1);
`;

export const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 1);
  margin: 0;
`;

export const ModalClose = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: rgba(130, 130, 130, 1);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background-color: rgba(240, 240, 240, 1);
    color: rgba(0, 0, 0, 1);
  }
`;

export const ModalBody = styled.div`
  padding: 20px 24px 24px 24px;
`;

export const ModalText = styled.p`
  font-size: 16px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 1);
  margin: 0 0 24px 0;
  text-align: center;

  strong {
    color: rgba(220, 53, 69, 1);
    font-weight: 600;
  }
`;

export const ConfirmButtonContainer = styled.div`
  margin-bottom: 16px;
`;

export const ConfirmButton = styled.button`
  position: relative;
  border-radius: 8px;
  background-color: rgba(220, 53, 69, 1);
  display: flex;
  min-height: 56px;
  width: 100%;
  align-items: center;
  color: rgba(255, 255, 255, 1);
  font-weight: 600;
  justify-content: center;
  padding: 0 16px;
  border: none;
  font-size: 16px;
  font-family: inherit;
  cursor: pointer;
  overflow: hidden;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;

  &:hover:not(:disabled) {
    background-color: rgba(200, 35, 51, 1);
  }

  &:disabled {
    background-color: rgba(150, 150, 150, 1);
    cursor: not-allowed;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const ConfirmProgress = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  width: ${props => props.progress}%;
  transition: width 0.1s ease-out;
  border-radius: 8px 0 0 8px;
`;

export const ConfirmText = styled.span`
  position: relative;
  z-index: 2;
`;

export const CancelButton = styled.button`
  border-radius: 8px;
  background-color: rgba(130, 130, 130, 1);
  display: flex;
  min-height: 48px;
  width: 100%;
  align-items: center;
  color: rgba(255, 255, 255, 1);
  font-weight: 600;
  justify-content: center;
  padding: 0 16px;
  border: none;
  font-size: 16px;
  font-family: inherit;
  cursor: pointer;

  &:hover:not(:disabled) {
    background-color: rgba(100, 100, 100, 1);
  }

  &:disabled {
    background-color: rgba(180, 180, 180, 1);
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  background-color: rgba(255, 240, 240, 1);
  border: 1px solid rgba(255, 200, 200, 1);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: rgba(200, 0, 0, 1);
  font-size: 14px;
  text-align: center;
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
`;

export const SuccessMessage = styled.div`
  background-color: rgba(240, 255, 240, 1);
  border: 1px solid rgba(200, 255, 200, 1);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  color: rgba(0, 150, 0, 1);
  font-size: 14px;
  text-align: center;
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
`;

export const Links = styled.div`
  margin-top: 24px;
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

// Media Queries
export const MediaQueries = styled.div`
  @media (max-width: 480px) {
    ${Container} {
      padding: 10px;
    }

    ${Content} {
      padding: 0 16px;
    }

    ${Title} {
      font-size: 18px;
    }

    ${Subtitle} {
      font-size: 14px;
    }
  }
`;
