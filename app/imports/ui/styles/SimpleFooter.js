import styled from "styled-components";
import { Link } from "react-router-dom";

// Styled Components for Footer
export const FooterContainer = styled.div`
  padding: 40px 20px 20px;
  background-color: rgba(0, 0, 0, 1);
`;

export const FooterContent = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 1);
`;

export const FooterLogo = styled.div`
  margin-bottom: 20px;
`;

export const AppName = styled.span`
  font-size: 18px;
  font-weight: 600;
`;

export const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 20px;
`;

export const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 400;
  text-decoration: none;

  &:hover {
    color: rgba(255, 255, 255, 1);
    text-decoration: underline;
  }
`;

export const FooterLinkExternal = styled.a`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 400;
  text-decoration: none;

  &:hover {
    color: rgba(255, 255, 255, 1);
    text-decoration: underline;
  }
`;

export const Copyright = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
`;
