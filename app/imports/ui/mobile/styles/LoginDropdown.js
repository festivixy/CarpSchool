import styled from "styled-components";

export const DropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

export const DropdownButton = styled.button`
  background-color: rgba(255, 255, 255, 1);
  color: rgba(0, 0, 0, 1);
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background-color: rgba(240, 240, 240, 1);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const DropdownArrow = styled.span`
  font-size: 12px;
  transition: transform 0.2s ease;
  transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

export const DropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  z-index: 1000;
  border: 1px solid rgba(0, 0, 0, 0.1);
`;

export const DropdownItem = styled.a`
  display: flex;
  align-items: center;
  padding: 14px 20px;
  color: rgba(0, 0, 0, 0.87);
  text-decoration: none;
  font-size: 15px;
  font-weight: 500;
  transition: background-color 0.15s ease;
  cursor: pointer;
  gap: 10px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &:active {
    background-color: rgba(0, 0, 0, 0.1);
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
`;

export const DropdownItemIcon = styled.span`
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const DropdownItemText = styled.span`
  flex: 1;
`;
