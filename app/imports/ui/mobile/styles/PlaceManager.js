import styled, { keyframes, css } from "styled-components";
import { btnBase, btnPrimary, btnGhost, btnCoral, eyebrow, inputBase } from "../../styles/tokens";

/* Keep styled-only props off the DOM. */
const block = (...names) => ({
  shouldForwardProp: (prop) => !names.includes(prop),
});

const spin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const slideIn = keyframes`
  from {
    transform: scale(0.96) translateY(16px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
`;

// Styled Components for PlaceManager
export const Container = styled.div`
  background: var(--cream-0);
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  font-family: var(--font-ui);
  color: var(--ink-1);
  margin: 0 auto;
  padding: 20px 0 96px;
  min-height: 100vh;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 12px 0 96px;
  }
`;

export const Header = styled.div`
  display: flex;
  max-width: 100%;
  flex-direction: column;
  text-align: center;
  align-items: center;
  margin-bottom: 28px;

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

export const Title = styled.h1`
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 20px 0 8px 0;
  color: var(--ink-1);
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 27px;
  }
`;

export const TitleIcon = styled.span`
  font-size: 24px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const AddButton = styled.button`
  ${btnBase}
  ${btnCoral}
  padding: 10px 18px;
  font-size: 13px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const Content = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 0 24px;
  max-width: 1200px;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--ink-3);
  gap: 16px;
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid var(--cream-2);
  border-top-color: var(--signal-yellow);
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
`;

export const LoadingText = styled.div`
  font-size: 15px;
  font-weight: 500;
`;

export const EmptyState = styled.div`
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);
  padding: 40px 24px;
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

export const EmptyStateIcon = styled.div`
  font-size: 44px;
  margin-bottom: 16px;
  opacity: 0.4;
`;

export const EmptyStateTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--ink-1);
  margin: 0 0 8px 0;
`;

export const EmptyStateText = styled.p`
  font-size: 14px;
  color: var(--ink-3);
  margin: 0;
  line-height: 1.5;
`;

export const PlacesGrid = styled.div`
  width: 100%;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const PlaceCard = styled.div`
  background: var(--cream-0);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);
  padding: 20px;
  transition: box-shadow 0.12s ease, transform 0.12s ease;

  &:hover {
    box-shadow: var(--glass-shadow);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const PlaceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
`;

export const PlaceInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const PlaceName = styled.div`
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--ink-1);
  line-height: 1.25;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

export const PlaceIcon = styled.span`
  font-size: 16px;
  color: var(--ink-3);
`;

export const PlaceCoordinates = styled.div`
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-3);
  margin-bottom: 8px;
`;

export const PlaceDate = styled.div`
  ${eyebrow}
  font-size: 10px;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

export const ActionButton = styled.button.withConfig(block("variant"))`
  width: 36px;
  height: 36px;
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-md);
  background: var(--cream-0);
  color: var(--ink-2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s ease, border-color 0.12s ease, transform 0.12s ease;
  font-size: 14px;

  &:hover:not(:disabled) {
    background: ${props => (props.variant === "delete" ? "var(--danger-soft)" : "var(--signal-yellow-soft)")};
    border-color: ${props => (props.variant === "delete" ? "var(--danger)" : "var(--signal-yellow-deep)")};
    color: ${props => (props.variant === "delete" ? "var(--danger-deep)" : "var(--ink-1)")};
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }
`;

// Modal Styles
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(12, 12, 10, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background: var(--cream-0);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-xl);
  box-shadow: var(--glass-shadow);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: ${slideIn} 0.22s cubic-bezier(0.2, 0.7, 0.3, 1);
`;

export const ModalHeader = styled.div`
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid var(--glass-stroke);

  @media (max-width: 768px) {
    padding: 20px 20px 0 20px;
  }
`;

export const ModalTitle = styled.h2`
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--ink-1);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 19px;
  }
`;

export const ModalBody = styled.div`
  padding: 24px;

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const ModalActions = styled.div`
  padding: 0 24px 24px 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;

  @media (max-width: 768px) {
    padding: 0 20px 20px 20px;
    flex-direction: column-reverse;
  }
`;

// Form Styles
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

export const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--ink-1);
`;

export const Input = styled.input`
  ${inputBase}

  &:disabled {
    background: var(--cream-1);
    color: var(--ink-4);
  }
`;

export const ErrorText = styled.div`
  color: var(--danger);
  font-size: 12.5px;
  margin-top: 4px;
`;

export const InfoBox = styled.div`
  background: var(--signal-yellow-soft);
  border: 1px solid var(--signal-yellow-deep);
  border-radius: var(--r-md);
  padding: 16px;
  margin-top: 16px;
`;

export const InfoTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.005em;
  color: var(--ink-1);
  margin-bottom: 6px;
`;

export const InfoText = styled.div`
  font-size: 13.5px;
  color: var(--ink-2);
  line-height: 1.5;
`;

// Button Styles
export const Button = styled.button.withConfig(block("variant"))`
  ${btnBase}
  padding: 12px 20px;
  font-size: 13.5px;
  min-height: 44px;

  ${props => {
    if (props.variant === "primary") {
      return css`${btnPrimary}`;
    }
    if (props.variant === "danger") {
      return css`
        background: var(--danger);
        color: var(--cream-0);

        &:hover:not(:disabled) {
          background: var(--danger-deep);
        }
      `;
    }
    return css`${btnGhost}`;
  }}

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const LoadingButton = styled(Button)`
  position: relative;

  &:disabled {
    color: transparent;
  }

  &:disabled::after {
    content: "";
    position: absolute;
    width: 16px;
    height: 16px;
    top: 50%;
    left: 50%;
    margin-left: -8px;
    margin-top: -8px;
    border: 2px solid transparent;
    border-top-color: var(--ink-1);
    border-radius: 50%;
    animation: ${spin} 0.9s linear infinite;
  }
`;

// Creator name skeleton loading state
export const CreatorNameSkeleton = styled.div`
  width: 80px;
  height: 14px;
  border-radius: var(--r-sm);
  background: var(--cream-2);
  overflow: hidden;
  display: inline-block;
`;
