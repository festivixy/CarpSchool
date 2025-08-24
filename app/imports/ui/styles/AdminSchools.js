import styled from "styled-components";

// Styled Components for AdminSchools
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
  padding: 20px 0;
  min-height: 100vh;
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

  @media (max-width: 768px) {
    font-size: 22px;
    text-align: center;
  }
`;

export const TitleIcon = styled.span`
  font-size: 1.2em;
`;

export const Subtitle = styled.p`
  margin: 0;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 400;
`;

export const Content = styled.div`
  width: 100%;
  max-width: 1200px;
  padding: 0 20px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 0 16px;
  }
`;

export const TopActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  max-width: 400px;

  @media (max-width: 768px) {
    max-width: none;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 16px;
  background-color: rgba(248, 250, 252, 1);
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    background-color: white;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }
`;

export const SearchIcon = styled.span`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: rgba(0, 0, 0, 0.4);
`;

export const CreateButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

export const SearchResultsCount = styled.div`
  margin-bottom: 16px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

export const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top: 3px solid rgba(59, 130, 246, 1);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.p`
  margin: 0;
  color: rgba(0, 0, 0, 0.6);
  font-size: 16px;
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

export const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.6;
`;

export const EmptyStateTitle = styled.h3`
  margin: 0 0 12px 0;
  color: rgba(0, 0, 0, 0.8);
  font-size: 24px;
  font-weight: 600;
`;

export const EmptyStateText = styled.p`
  margin: 0;
  color: rgba(0, 0, 0, 0.5);
  font-size: 16px;
  max-width: 400px;
  line-height: 1.5;
`;

export const SchoolsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-top: 8px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (max-width: 450px) {
    grid-template-columns: 1fr;
  }
`;

export const SchoolCard = styled.div`
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: rgba(59, 130, 246, 0.2);
  }

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

export const SchoolHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;
`;

export const SchoolInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const SchoolName = styled.h3`
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.9);
  line-height: 1.3;
  word-wrap: break-word;
`;

export const SchoolCode = styled.p`
  margin: 0 0 8px 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

export const ActionButton = styled.button`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  background: ${props => {
    switch (props.variant) {
      case "edit": return "rgba(59, 130, 246, 0.1)";
      case "deactivate": return "rgba(239, 68, 68, 0.1)";
      case "activate": return "rgba(34, 197, 94, 0.1)";
      default: return "rgba(0, 0, 0, 0.05)";
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case "edit": return "rgba(59, 130, 246, 1)";
      case "deactivate": return "rgba(239, 68, 68, 1)";
      case "activate": return "rgba(34, 197, 94, 1)";
      default: return "rgba(0, 0, 0, 0.7)";
    }
  }};

  &:hover {
    transform: scale(1.05);
    background: ${props => {
      switch (props.variant) {
        case "edit": return "rgba(59, 130, 246, 0.2)";
        case "deactivate": return "rgba(239, 68, 68, 0.2)";
        case "activate": return "rgba(34, 197, 94, 0.2)";
        default: return "rgba(0, 0, 0, 0.1)";
      }
    }};
  }

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SchoolDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DetailLabel = styled.span`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.5);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const DetailValue = styled.span`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.8);
  font-weight: 500;
  word-wrap: break-word;
`;

export const BadgeContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

export const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => (props.isActive ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)")};
  color: ${props => (props.isActive ? "rgba(34, 197, 94, 1)" : "rgba(239, 68, 68, 1)")};
`;

export const UserCountBadge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(99, 102, 241, 0.1);
  color: rgba(99, 102, 241, 1);
`;

export const DomainBadge = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(168, 85, 247, 0.1);
  color: rgba(168, 85, 247, 1);
`;

// Modal Components
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  backdrop-filter: blur(4px);
`;

export const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

export const ModalHeader = styled.div`
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

export const ModalTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 24px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.9);
`;

export const ModalBody = styled.div`
  padding: 0 24px 24px 24px;
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 16px 24px 24px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

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

export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.8);
`;

export const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.2s ease;
  background-color: white;

  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background-color: rgba(0, 0, 0, 0.05);
    color: rgba(0, 0, 0, 0.5);
  }

  &::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }
`;

export const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  min-height: 80px;
  resize: vertical;
  transition: all 0.2s ease;
  background-color: white;

  &:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &:disabled {
    background-color: rgba(0, 0, 0, 0.05);
    color: rgba(0, 0, 0, 0.5);
  }

  &::placeholder {
    color: rgba(0, 0, 0, 0.4);
  }
`;

export const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const SwitchLabel = styled.span`
  font-size: 14px;
  color: rgba(0, 0, 0, 0.7);
`;

export const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  cursor: ${props => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${props => (props.disabled ? 0.5 : 1)};
`;

export const SwitchInput = styled.input.attrs({ type: "checkbox" })`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: rgba(59, 130, 246, 1);
  }

  &:checked + span:before {
    transform: translateX(20px);
  }
`;

export const SwitchSlider = styled.span`
  position: absolute;
  cursor: inherit;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.3s;
    border-radius: 50%;
  }
`;

export const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;

  ${props => {
    switch (props.variant) {
      case "primary":
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
        `;
      case "danger":
        return `
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
          }
        `;
      default:
        return `
          background: rgba(0, 0, 0, 0.05);
          color: rgba(0, 0, 0, 0.7);
          border: 1px solid rgba(0, 0, 0, 0.1);
          
          &:hover {
            background: rgba(0, 0, 0, 0.1);
          }
        `;
    }
  }}

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  color: rgba(239, 68, 68, 1);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

export const StatusMessage = styled.div`
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;

  ${props => (props.type === "success" ? `
    background: rgba(34, 197, 94, 0.1);
    color: rgba(34, 197, 94, 1);
    border: 1px solid rgba(34, 197, 94, 0.2);
  ` : `
    background: rgba(239, 68, 68, 0.1);
    color: rgba(239, 68, 68, 1);
    border: 1px solid rgba(239, 68, 68, 0.2);
  `)}
`;
