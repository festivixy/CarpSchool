import styled from "styled-components";
import {
  btnBase,
  btnCoral,
  btnGhost,
  eyebrow,
  inputBase,
} from "../../styles/tokens";

export const Container = styled.div`
  min-height: 100vh;
  background: var(--cream-0);
  color: var(--ink-1);
  font-family: var(--font-ui);
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 24px 20px 16px;
`;

export const AppName = styled.div`
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
`;

export const ProgressContainer = styled.div`
  margin-top: 16px;
`;

export const ProgressBar = styled.div`
  height: 6px;
  border-radius: var(--r-pill);
  background: var(--cream-2);
  overflow: hidden;
`;

export const ProgressFill = styled.div`
  height: 100%;
  width: ${props => props.progress || 0}%;
  background: var(--signal-yellow);
  transition: width 0.3s ease;
`;

export const ProgressText = styled.div`
  ${eyebrow}
  margin-top: 8px;
`;

export const Content = styled.div`
  flex: 1;
  width: 100%;
  max-width: 640px;
  margin: 0 auto;
  padding: 8px 20px 40px;
`;

export const Step = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const StepTitle = styled.h1`
  margin: 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

export const StepSubtitle = styled.p`
  margin: 0;
  color: var(--ink-3);
  font-size: 15px;
`;

export const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
`;

export const Label = styled.label`
  ${eyebrow}
`;

export const Input = styled.input`
  ${inputBase}
`;

export const InputHint = styled.div`
  font-size: 12px;
  color: var(--ink-4);
`;

export const UserTypeOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const UserTypeOption = styled.div`
  padding: 16px;
  border-radius: var(--r-lg);
  cursor: pointer;
  transition: all 0.15s;
  border: 1.5px solid ${props => (props.selected ? "var(--signal-yellow)" : "var(--glass-stroke)")};
  background: ${props => (props.selected ? "var(--signal-yellow-soft)" : "var(--cream-1)")};
`;

export const UserTypeTitle = styled.div`
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
`;

export const UserTypeDesc = styled.div`
  margin-top: 2px;
  font-size: 13px;
  color: var(--ink-3);
`;

export const ContactSection = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  h3 {
    margin: 8px 0 0;
    font-family: var(--font-display);
    font-size: 18px;
  }
`;

export const PhotoSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  h3 {
    margin: 0 0 8px;
    font-family: var(--font-display);
    font-size: 18px;
  }
`;

export const PhotoSection = styled.div`
  padding: 16px;
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);
`;

export const PhotoPreview = styled.div`
  margin-bottom: 12px;
`;

export const PreviewImg = styled.img`
  max-width: 100%;
  border-radius: var(--r-md);
`;

export const FileInput = styled.input`
  display: none;
`;

export const FileLabel = styled.label`
  ${btnBase}
  ${btnGhost}
  display: inline-flex;
  cursor: pointer;
`;

export const FileInfo = styled.div`
  margin-top: 8px;
  font-size: 12px;
  color: var(--ink-4);
`;

export const UploadSection = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const UploadButton = styled.button`
  ${btnBase}
  ${btnCoral}
`;

export const Summary = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);

  h3 {
    margin: 0 0 8px;
    font-family: var(--font-display);
    font-size: 18px;
  }
`;

export const SummaryItem = styled.div`
  padding: 3px 0;
  font-size: 14px;
  color: var(--ink-2);
`;

export const ErrorMessage = styled.div`
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: var(--r-md);
  background: rgba(176, 58, 110, 0.1);
  color: var(--plum);
  font-size: 14px;
`;

export const SuccessMessage = styled.div`
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: var(--r-md);
  background: rgba(31, 138, 91, 0.12);
  color: var(--leaf);
  font-size: 14px;
`;

export const Navigation = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: ${props => (props.hasBackButton ? "space-between" : "flex-end")};
`;

export const PrimaryButton = styled.button`
  ${btnBase}
  ${btnCoral}
  ${props => props.disabled && "opacity: 0.5; pointer-events: none;"}
`;

export const SecondaryButton = styled.button`
  ${btnBase}
  ${btnGhost}
`;
