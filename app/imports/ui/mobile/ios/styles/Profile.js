import styled from "styled-components";

export const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #f2f2f7;
  display: flex;
  flex-direction: column;
  padding-top: 44px; /* Account for native navbar */
`;

export const Content = styled.div`
  flex: 1;
  padding: 0;
`;

export const UserInfo = styled.div`
  background-color: #ffffff;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
`;

export const UserName = styled.div`
  font-size: 22px;
  font-weight: 600;
  color: #000000;
`;

export const UserEmail = styled.div`
  font-size: 16px;
  color: #8e8e93;
`;

export const Separator = styled.div`
  height: 20px;
  background-color: #f2f2f7;
`;

export const Section = styled.div`
  background-color: #ffffff;
  margin-bottom: 20px;
`;

export const SectionTitle = styled.div`
  font-size: 13px;
  font-weight: 400;
  color: #8e8e93;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 16px;
  background-color: #f2f2f7;
`;

export const MenuItem = styled.div`
  background-color: #ffffff;
  border-bottom: 1px solid #c6c6c8;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  cursor: pointer;
  min-height: 44px;

  &:last-child {
    border-bottom: none;
  }

  &:active {
    background-color: #e5e5ea;
  }

  ${props => props.$isDestructive && `
    color: #ff3b30;

    ${MenuItemText} {
      color: #ff3b30;
    }
  `}
`;

export const MenuItemIcon = styled.div`
  font-size: 20px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
`;

export const MenuItemText = styled.div`
  font-size: 17px;
  color: #000000;
  flex: 1;
`;

export const MenuItemChevron = styled.div`
  font-size: 18px;
  color: #c7c7cc;
  margin-left: 8px;
`;
