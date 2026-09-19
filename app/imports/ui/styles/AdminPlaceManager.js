import styled from "styled-components";

// Styled Components for AdminPlaceManager - extends PlaceManager styles
export const Container = styled.div`
  background-color: var(--cream-0);
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  font-family: var(--font-ui);
  margin: 0 auto;
  padding: 20px 0;
  min-height: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px 0;
  }
`;

export const Header = styled.div`
  display: flex;
  max-width: 100%;
  flex-direction: column;
  font-size: 28px;
  color: rgba(0, 0, 0, 1);
  font-weight: 700;
  text-align: center;
  letter-spacing: -0.5px;
  align-items: center;
  margin-bottom: 30px;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 20px;
  }
`;

export const Title = styled.h1`
  margin: 20px 0 8px 0;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const TitleIcon = styled.span`
  font-size: 24px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

export const AdminBadge = styled.span`
  background-color: rgba(255, 248, 220, 1);
  color: rgba(146, 64, 14, 1);
  border: 1px solid rgba(251, 191, 36, 1);
  padding: 4px 8px;
  border-radius: var(--r-sm);
  font-size: 12px;
  font-weight: 600;
  margin-left: 12px;
`;

export const AddButton = styled.button`
  background-color: rgba(0, 0, 0, 1);
  color: var(--cream-0);
  border: none;
  border-radius: var(--r-md);
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--ink-1);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
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

export const SearchContainer = styled.div`
  width: 100%;
  max-width: 600px;
  margin-bottom: 24px;
  position: relative;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 48px;
  border: 1px solid var(--cream-2);
  border-radius: var(--r-md);
  font-size: 16px;
  font-family: inherit;
  background-color: var(--cream-0);
  outline: none;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease,
    box-shadow 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: var(--ink-1);
    box-shadow: 0 0 0 4px var(--accent-soft);
  }

  &::placeholder {
    color: var(--ink-3);
  }

  @media (max-width: 768px) {
    font-size: 16px; /* Prevent zoom on iOS */
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: var(--ink-3);
  pointer-events: none;
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
  border-top-color: rgba(0, 0, 0, 1);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const LoadingText = styled.div`
  font-size: 16px;
  font-weight: 500;
`;

export const EmptyState = styled.div`
  background-color: var(--cream-1);
  border: 1px solid rgba(220, 230, 240, 1);
  border-radius: var(--r-md);
  padding: 40px 24px;
  text-align: center;
  max-width: 400px;
  width: 100%;
`;

export const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
`;

export const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
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
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const PlaceCard = styled.div`
  background-color: var(--cream-0);
  border: 1px solid var(--cream-2);
  border-radius: var(--r-md);
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
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
`;

export const PlaceName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.3;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

export const PlaceIcon = styled.span`
  font-size: 16px;
  color: var(--ink-3);
`;

export const PlaceCoordinates = styled.div`
  font-size: 14px;
  color: var(--ink-3);
  font-weight: 400;
  margin-bottom: 8px;
`;

export const PlaceDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

export const PlaceDetail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DetailLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const DetailValue = styled.span`
  font-size: 13px;
  color: rgba(0, 0, 0, 0.87);
  font-weight: 500;
`;

export const CreatorName = styled.span`
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
`;

export const UpdatedInfo = styled.div`
  font-size: 11px;
  color: var(--ink-3);
  margin-top: 2px;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

export const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid var(--cream-2);
  border-radius: var(--r-md);
  background-color: var(--cream-0);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease,
    box-shadow 0.2s ease;
  font-size: 14px;

  &:hover:not(:disabled) {
    background-color: ${(props) => {
      if (props.variant === "delete") return "rgba(255, 245, 245, 1)";
      return "rgba(245, 250, 255, 1)";
    }};
    border-color: ${(props) => {
      if (props.variant === "delete") return "var(--danger-soft)";
      return "rgba(200, 220, 255, 1)";
    }};
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.5;
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
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

export const ModalContent = styled.div`
  background-color: var(--cream-0);
  border-radius: var(--r-lg);
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.2s ease-out;

  @keyframes slideIn {
    from {
      transform: scale(0.9) translateY(20px);
      opacity: 0;
    }
    to {
      transform: scale(1) translateY(0);
      opacity: 1;
    }
  }
`;

export const ModalHeader = styled.div`
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid rgba(240, 240, 240, 1);

  @media (max-width: 768px) {
    padding: 20px 20px 0 20px;
  }
`;

export const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 18px;
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
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
`;

export const Input = styled.input`
  border-radius: var(--r-md);
  background-color: var(--cream-0);
  border: 1px solid var(--cream-2);
  padding: 12px 16px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
  font-family: inherit;
  outline: none;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease,
    box-shadow 0.2s ease;

  &:focus {
    border-color: var(--ink-1);
    box-shadow: 0 0 0 4px var(--accent-soft);
  }

  &:disabled {
    background-color: var(--cream-0);
    color: var(--ink-3);
  }

  &::placeholder {
    color: var(--ink-3);
  }
`;

export const ErrorText = styled.div`
  color: var(--danger-deep);
  font-size: 13px;
  margin-top: 4px;
`;

export const InfoBox = styled.div`
  background-color: rgba(240, 248, 255, 1);
  border: 1px solid rgba(191, 219, 254, 1);
  border-radius: var(--r-md);
  padding: 16px;
  margin-top: 16px;
`;

export const InfoTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: rgba(30, 64, 175, 1);
  margin-bottom: 8px;
`;

export const InfoText = styled.div`
  font-size: 14px;
  color: rgba(55, 65, 81, 1);
  line-height: 1.5;
`;

// Button Styles
export const Button = styled.button`
  border-radius: var(--r-md);
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  border: 1px solid;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease,
    box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;

  ${(props) => {
    if (props.variant === "primary") {
      return `
        background-color: rgba(0, 0, 0, 1);
        color: var(--cream-0);
        border-color: rgba(0, 0, 0, 1);

        &:hover:not(:disabled) {
          background-color: var(--ink-1);
          transform: translateY(-1px);
        }
      `;
    }
    if (props.variant === "danger") {
      return `
        background-color: var(--danger-deep);
        color: var(--cream-0);
        border-color: var(--danger-deep);

        &:hover:not(:disabled) {
          background-color: rgba(185, 28, 28, 1);
        }
      `;
    }
    return `
      background-color: var(--cream-0);
      color: rgba(0, 0, 0, 0.87);
      border-color: var(--cream-2);

      &:hover:not(:disabled) {
        background-color: var(--cream-0);
        border-color: var(--cream-3);
      }
    `;
  }}

  &:disabled {
    opacity: 0.6;
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
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
`;
