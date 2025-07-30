import styled from "styled-components";
import { Link } from "react-router-dom";

// Styled Components for Verbose Footer
export const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  padding: 60px 0 20px;
  margin-top: auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

export const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

export const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

export const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const FooterLinksList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

export const FooterLinkItem = styled.li`
  margin-bottom: 12px;
`;

export const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s ease;
  display: inline-block;

  &:hover {
    color: #4a90e2;
    transform: translateX(4px);
  }
`;

export const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CompanyHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

export const CompanyLogo = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 12px;
  border-radius: 8px;
`;

export const CompanyName = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
`;

export const CompanyDescription = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
`;

export const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ContactItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

export const ContactIcon = styled.span`
  margin-right: 8px;
  font-size: 16px;
`;

export const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
`;



export const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

export const Copyright = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
`;

export const LegalLinks = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const LegalLink = styled(Link)`
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;

  &:hover {
    color: #4a90e2;
  }
`;

export const LegalLinkExternal = styled.a`
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;

  &:hover {
    color: #4a90e2;
  }
`;
