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

export const ProfilePageContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f5f5f5;
  padding-top: 60px;
  padding-bottom: 100px; /* Space for bottom navbar */
  overflow-y: auto;
`;

export const FixedHeader = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
`;

export const HeaderTitle = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

export const ContentContainer = styled.div`
  padding: 20px;
`;

export const ProfileHeader = styled.div`
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const ProfileAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: #007AFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  font-size: 32px;
  font-weight: 600;
  color: white;
`;

export const ProfileName = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

export const ProfileEmail = styled.div`
  font-size: 16px;
  color: #666;
`;

export const LegalSection = styled.div`
  background-color: white;
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
`;

export const MenuIcon = styled.span`
  margin-right: 12px;
`;

export const MenuArrow = styled.span`
  margin-left: auto;
  color: #999;
`;

export const LogoutIcon = styled.span`
  margin-right: 8px;
`;
