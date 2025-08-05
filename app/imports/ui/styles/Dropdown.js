import styled, { css } from "styled-components";

export const DropdownContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const DropdownLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #1C1C1E;
  margin-bottom: 8px;
  
  ${props => props.disabled && css`
    color: #8E8E93;
  `}
`;

export const RequiredIndicator = styled.span`
  color: #FF3B30;
  margin-left: 4px;
`;

export const DropdownTrigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  border: 2px solid transparent;
  border-radius: 8px;
  background-color: #F2F2F7;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: left;
  font-family: inherit;
  outline: none;

  /* Size variants */
  ${props => props.size === "small" && css`
    min-height: 36px;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 14px;
  `}

  ${props => props.size === "medium" && css`
    min-height: 44px;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 16px;
  `}

  ${props => props.size === "large" && css`
    min-height: 52px;
    padding: 16px 20px;
    border-radius: 10px;
    font-size: 18px;
  `}

  /* Variant styles */
  ${props => props.variant === "outline" && css`
    background-color: transparent;
    border: 2px solid #D1D1D6;
  `}

  ${props => props.variant === "filled" && css`
    background-color: #E5E5EA;
  `}

  /* Focus state */
  &:focus {
    border-color: #007AFF;
    box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.3);
  }

  /* Open state */
  ${props => props.isOpen && css`
    border-color: #007AFF;
    box-shadow: 0 0 0 1px rgba(0, 122, 255, 0.3);
  `}

  /* Error state */
  ${props => props.hasError && css`
    border-color: #FF3B30;
    background-color: rgba(255, 59, 48, 0.05);
    
    &:focus {
      box-shadow: 0 0 0 1px rgba(255, 59, 48, 0.3);
    }
  `}

  /* Disabled state */
  ${props => props.disabled && css`
    background-color: #F2F2F7;
    opacity: 0.6;
    cursor: not-allowed;
    
    &:focus {
      border-color: transparent;
      box-shadow: none;
    }
  `}

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    border-width: 2px;
    border-style: solid;
    border-color: #1C1C1E;
  }
`;

export const TriggerContent = styled.div`
  flex: 1;
  min-width: 0;
`;

export const TriggerValue = styled.span`
  color: #1C1C1E;
  font-weight: 500;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TriggerPlaceholder = styled.span`
  color: #8E8E93;
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const TriggerIcon = styled.span`
  color: #8E8E93;
  margin-left: 8px;
  transition: transform 0.2s ease-in-out;
  font-size: 12px;
  display: flex;
  align-items: center;
  
  ${props => props.isOpen && css`
    transform: rotate(180deg);
  `}
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 1000;
  background: white;
  border: 1px solid #D1D1D6;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  margin-top: 4px;
  overflow: hidden;
  max-height: ${props => props.maxHeight};
  overflow-y: auto;

  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #F2F2F7;
  }

  &::-webkit-scrollbar-thumb {
    background: #D1D1D6;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #AEAEB2;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  border: none;
  border-bottom: 1px solid #E5E5EA;
  padding: 12px 16px;
  font-size: 16px;
  font-family: inherit;
  outline: none;
  background: #F9F9F9;

  &::placeholder {
    color: #8E8E93;
  }

  &:focus {
    background: white;
    border-bottom-color: #007AFF;
  }
`;

export const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  color: #1C1C1E;
  font-size: 16px;
  border: none;
  text-align: left;
  width: 100%;

  &:hover {
    background-color: #F2F2F7;
  }

  ${props => props.isFocused && css`
    background-color: #F2F2F7;
  `}

  ${props => props.isSelected && css`
    background-color: #E3F2FD;
    color: #007AFF;
    font-weight: 600;
  `}

  ${props => props.disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
    
    &:hover {
      background-color: transparent;
    }
  `}

  /* Active state */
  &:active:not(:disabled) {
    background-color: #E5E5EA;
  }
`;

export const MenuItemIcon = styled.span`
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  min-width: 20px;
`;

export const MenuItemText = styled.span`
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const NoResults = styled.div`
  padding: 16px;
  text-align: center;
  color: #8E8E93;
  font-style: italic;
`;

export const ErrorMessage = styled.div`
  font-size: 14px;
  color: #FF3B30;
  margin-top: 4px;
  font-weight: 500;
  display: flex;
  align-items: flex-start;
  
  &:before {
    content: "⚠️";
    margin-right: 4px;
    font-size: 12px;
  }
`;

export const HelperText = styled.div`
  font-size: 14px;
  color: #8E8E93;
  margin-top: 4px;
  line-height: 1.4;
`;
