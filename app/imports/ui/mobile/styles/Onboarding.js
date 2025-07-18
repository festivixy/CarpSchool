import styled from "styled-components";

// Styled Components for Onboarding
export const Container = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  color: white;
`;

export const Header = styled.div`
  padding: 40px 24px 20px 24px;
  text-align: center;

  @media (max-width: 480px) {
    padding: 20px 16px 16px 16px;
  }
`;

export const AppName = styled.div`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

export const ProgressContainer = styled.div`
  max-width: 300px;
  margin: 0 auto;
`;

export const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

export const ProgressFill = styled.div`
  height: 100%;
  background-color: white;
  border-radius: 4px;
  transition: width 0.3s ease;
  width: ${(props) => props.progress}%;
`;

export const ProgressText = styled.div`
  font-size: 14px;
  opacity: 0.9;
`;

export const Content = styled.div`
  flex: 1;
  background-color: white;
  color: #333;
  border-radius: 24px 24px 0 0;
  padding: 32px 24px 24px 24px;
  margin-top: 20px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 24px 16px 16px 16px;
    border-radius: 16px 16px 0 0;
  }
`;

export const Step = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

export const StepIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    font-size: 48px;
  }
`;

export const StepTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 12px;
  color: #333;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const StepSubtitle = styled.p`
  font-size: 16px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 32px;
`;

export const InputGroup = styled.div`
  margin-bottom: 24px;
  text-align: left;
`;

export const Label = styled.label`
  display: block;
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 16px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  font-family: inherit;
  transition: border-color 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

export const InputHint = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 4px;
`;

export const UserTypeOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

export const UserTypeOption = styled.div`
  border: 2px solid #e1e5e9;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  border-color: ${(props) => (props.selected ? "#667eea" : "#e1e5e9")};
  background-color: ${(props) => (props.selected ? "#667eea" : "transparent")};
  color: ${(props) => (props.selected ? "white" : "inherit")};

  &:hover {
    border-color: #667eea;
    background-color: ${(props) => (props.selected ? "#667eea" : "#f8f9ff")};
  }

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const UserTypeIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

export const UserTypeTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
`;

export const UserTypeDesc = styled.div`
  font-size: 14px;
  opacity: 0.8;
`;

export const ContactSection = styled.div`
  background-color: #f8f9fa;
  border-radius: 16px;
  padding: 24px;
  text-align: left;

  h3 {
    margin: 0 0 20px 0;
    color: #333;
    font-size: 18px;
  }
`;

export const PhotoSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 20px;
`;

export const PhotoSection = styled.div`
  text-align: left;

  h3 {
    margin: 0 0 16px 0;
    color: #333;
    font-size: 18px;
  }
`;

export const PhotoPreview = styled.div`
  margin-bottom: 16px;
  text-align: center;
`;

export const PreviewImg = styled.img`
  max-width: 150px;
  max-height: 150px;
  border-radius: 12px;
  border: 2px solid #e1e5e9;
  object-fit: cover;
`;

export const FileInput = styled.input`
  display: none;
`;

export const FileLabel = styled.label`
  display: inline-block;
  padding: 12px 24px;
  background-color: #667eea;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #5a6fd8;
  }
`;

export const FileInfo = styled.div`
  font-size: 12px;
  color: #888;
  text-align: center;
`;

export const CaptchaContainer = styled.div`
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  background-color: #f9f9f9;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  position: relative;
`;

export const CaptchaLoading = styled.div`
  color: #888;
  font-size: 14px;
`;

export const CaptchaDisplay = styled.div`
  line-height: 1;
`;

export const CaptchaRefresh = styled.button`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(200, 200, 200, 1);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;

  img {
    width: 16px;
    height: 16px;
    opacity: 0.7;
  }

  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 1);
    border-color: #667eea;
    transform: scale(1.05);

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
  margin-top: 16px;
  padding: 16px;
  background-color: rgba(240, 248, 255, 0.8);
  border-radius: 12px;
  border: 2px solid rgba(200, 220, 240, 0.5);
`;

export const UploadButton = styled.button`
  border-radius: 8px;
  background-color: #5a6fd8;
  color: white;
  padding: 12px 20px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  margin-top: 12px;
  transition: background-color 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #4a5fc8;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

export const Summary = styled.div`
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  text-align: left;
  margin-bottom: 24px;

  h3 {
    margin: 0 0 16px 0;
    color: #333;
  }
`;

export const SummaryItem = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
`;

export const ErrorMessage = styled.div`
  background-color: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  color: #c00;
  text-align: center;
  font-size: 14px;
`;

export const SuccessMessage = styled.div`
  background-color: #efe;
  border: 1px solid #cfc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  color: #060;
  text-align: center;
  font-size: 14px;
`;

export const Navigation = styled.div`
  display: flex;
  gap: 16px;
  justify-content: ${(props) => (props.hasBackButton ? "space-between" : "flex-end")};
  margin-top: 32px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

export const Button = styled.button`
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  flex: 1;
  max-width: 200px;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    max-width: none;
  }
`;

export const PrimaryButton = styled(Button)`
  background-color: #667eea;
  color: white;

  &:hover:not(:disabled) {
    background-color: #5a6fd8;
  }
`;

export const SecondaryButton = styled(Button)`
  background-color: #f8f9fa;
  color: #333;
  border: 2px solid #e1e5e9;

  &:hover:not(:disabled) {
    background-color: #e9ecef;
  }
`;
