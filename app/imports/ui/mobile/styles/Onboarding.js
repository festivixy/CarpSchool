import styled from "styled-components";

// Styled Components for Onboarding
export const Container = styled.div`
  background: linear-gradient(135deg, rgba(0, 123, 255, 0.20) 70.71%, #1E64CD 0%);
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
  padding: 40px 0 20px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;

  @media (max-width: 480px) {
    padding: 20px 0 16px 0;
  }
`;

export const AppName = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #FFF;
  line-height: 42px;

  @media (max-width: 480px) {
    font-size: 24px;
  }
`;

export const ProgressContainer = styled.div`
  display: flex;
  padding-left: 0.5px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
`;

export const ProgressBar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.30);
  padding-right: ${(props) => `${300 - props.progress * 3}px`};
`;

export const ProgressFill = styled.div`
  width: ${(props) => `${props.progress * 75}px`};
  height: 8px;
  border-radius: 4px;
  background: #FFF;
`;

export const ProgressText = styled.div`
  display: flex;
  padding: 0 112px 0 111px;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  opacity: 0.9;
  color: #FFF;
  text-align: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
`;

export const Content = styled.div`
  display: flex;
  padding: 32px 24px 96px 24px;
  flex-direction: column;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 32px;
  border-radius: 24px 24px 0 0;
  background: #FFF;
  flex: 1;
  max-width: 986px;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 24px 16px 48px 16px;
    border-radius: 16px 16px 0 0;
  }
`;

export const Step = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 22px;
  align-self: stretch;
  text-align: center;
`;

export const StepIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;

  @media (max-width: 480px) {
    font-size: 48px;
  }
`;

export const StepTitle = styled.h2`
  color: #333;
  text-align: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 30.857px;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const StepSubtitle = styled.p`
  color: #666;
  text-align: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  margin: 0;
`;

export const InputGroup = styled.div`
  width: 552px;
  height: 100.398px;
  position: relative;
  margin-bottom: 24px;
`;

export const Label = styled.label`
  color: #333;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  position: absolute;
  left: 1px;
  top: 0px;
  width: 189px;
  height: 24px;
`;

export const Input = styled.input`
  width: 552px;
  height: 54px;
  flex-shrink: 0;
  border-radius: 12px;
  border: 2px solid #E1E5E9;
  background: #FFF;
  position: absolute;
  left: 1px;
  top: 24px;
  padding: 0 16px;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #1E64CD;
  }

  &::placeholder {
    color: #999;
    font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
    font-size: 16px;
    font-weight: 400;
  }
`;

export const InputHint = styled.div`
  color: #888;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  position: absolute;
  left: 1px;
  top: 83px;
  width: 338px;
  height: 18px;
`;

export const UserTypeOptions = styled.div`
  display: flex;
  padding: 0 0 0.43px 0.5px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
`;

export const UserTypeOption = styled.div`
  display: flex;
  padding: 22px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 6px;
  align-self: stretch;
  border-radius: 16px;
  border: 2px solid ${(props) => (props.selected ? "#1E64CD" : "#E1E5E9")};
  background: ${(props) => (props.selected ? "#1E64CD" : "transparent")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #1E64CD;
    background-color: ${(props) => (props.selected ? "#1E64CD" : "#f8f9ff")};
  }
`;

export const UserTypeIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
`;

export const UserTypeTitle = styled.div`
  color: ${(props) => (props.selected ? "#FFF" : "#333")};
  text-align: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 27px;
`;

export const UserTypeDesc = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  align-self: stretch;
  opacity: 0.8;
  color: ${(props) => (props.selected ? "#FFF" : "#333")};
  text-align: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  padding: 0 20px;
`;

export const ContactSection = styled.div`
  display: flex;
  padding: 24px 24.5px 47.633px 23.5px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 22.285px;
  align-self: stretch;
  border-radius: 16px;
  background: #F8F9FA;

  h3 {
    color: #333;
    font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
    font-size: 18px;
    font-weight: 700;
    line-height: 23.143px;
    margin: 0;
  }
`;

export const PhotoSections = styled.div`
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 24px;
  width: 562px;
  height: 202px;
`;

export const PhotoSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 17px;
  align-self: stretch;
  text-align: left;

  h3 {
    color: #333;
    font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
    font-size: 18px;
    font-weight: 700;
    line-height: 23.143px;
    margin: 0;
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
  display: flex;
  padding: 11px 24px 13px 24px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 8px;
  background: #1E64CD;
  color: #FFF;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #1a5bb8;
  }
`;

export const FileInfo = styled.div`
  color: #888;
  text-align: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  width: 291px;
  height: 18px;
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
  display: inline-flex;
  padding: 19px 20.5px 28.148px 19.5px;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 10.951px;
  border-radius: 12px;
  background: #F8F9FA;
  width: 552px;
  height: 176px;

  h3 {
    color: #333;
    font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
    font-size: 18px;
    font-weight: 700;
    line-height: 23.143px;
    margin: 0;
  }
`;

export const SummaryItem = styled.div`
  display: flex;
  width: 512px;
  align-items: flex-start;
  gap: 5.833px;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: #333;

  strong {
    font-weight: 700;
  }
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

export const Navigation = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "hasBackButton",
})`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 152px;
  align-self: stretch;

  @media (max-width: 480px) {
    gap: 16px;
    flex-direction: column;
  }
`;

export const Button = styled.button`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 12px;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 18.4px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PrimaryButton = styled(Button)`
  padding: 15px 55px 16px 55px;
  background: #1E64CD;
  color: #FFF;
  text-align: center;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};

  &:hover:not(:disabled) {
    background-color: #1a5bb8;
  }
`;

export const SecondaryButton = styled(Button)`
  padding: 17px 71px 18px 70px;
  border: 2px solid #E1E5E9;
  background: #F8F9FA;
  color: #333;
  text-align: center;

  &:hover:not(:disabled) {
    background-color: #e9ecef;
  }
`;

// New styled components for school selector
export const SchoolSelectorContainer = styled.div`
  width: 500px;
  height: 402px;
  border-radius: 12px;
  background: #FFF;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.10);
  position: relative;
`;

export const SchoolSelectorHeader = styled.div`
  display: inline-flex;
  padding: 0 22.5px 2.289px 23.5px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 11px;
  position: absolute;
  left: 24px;
  top: 24px;
  width: 452px;
  height: 92px;
`;

export const SchoolSelectorTitle = styled.div`
  color: #2C3E50;
  text-align: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 24px;
  font-weight: 700;
  line-height: 30.857px;
`;

export const SchoolSelectorSubtitle = styled.div`
  width: 406px;
  color: #666;
  text-align: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
`;

export const AutoDetectedSchool = styled.div`
  display: inline-flex;
  padding: 15.685px 33px 10px 44.615px;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 0.385px;
  border-radius: 8px;
  border: 1px solid #4CAF50;
  background: #E8F5E8;
  position: absolute;
  left: 24px;
  top: 135px;
  width: 452px;
  height: 74px;
`;

export const AutoDetectedLabel = styled.div`
  color: #333;
  text-align: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  position: absolute;
  left: 45px;
  top: 16px;
  width: 121px;
  height: 24px;
`;

export const AutoDetectedSchoolName = styled.div`
  width: 253px;
  color: #333;
  text-align: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  position: absolute;
  left: 166px;
  top: 16px;
  height: 48px;
`;

export const SchoolSearchInput = styled.input`
  width: 452px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 8px;
  border: 2px solid #E0E0E0;
  background: #FFF;
  position: absolute;
  left: 24px;
  top: 225px;
  padding: 0 16px;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  font-weight: 400;
  box-sizing: border-box;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #1E64CD;
  }
`;

export const SelectedSchoolContainer = styled.div`
  display: inline-flex;
  padding: 1px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 8px;
  border: 1px solid #E0E0E0;
  background: #FAFAFA;
  position: absolute;
  left: 24px;
  top: 288px;
  width: 449px;
  height: 77px;
`;

export const SelectedSchoolContent = styled.div`
  display: flex;
  width: 447px;
  height: 75px;
  padding: 15.688px 16px 16.313px 15.5px;
  justify-content: flex-end;
  align-items: center;
  gap: 0.172px;
  background: #1E64CD;
  position: relative;
`;

export const SelectedSchoolName = styled.div`
  color: #FFF;
  text-align: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 18px;
  font-weight: 600;
  line-height: 27px;
`;

export const SchoolBadge = styled.div`
  display: flex;
  padding: 4px 8px;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 4px;
  background: #F0F0F0;
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
`;

export const SchoolBadgeText = styled.div`
  color: #666;
  text-align: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 12px;
  font-weight: 600;
  line-height: 18px;
  letter-spacing: 0.5px;
`;
