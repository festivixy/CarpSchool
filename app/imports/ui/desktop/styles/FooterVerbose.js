import styled from "styled-components";
import { Link } from "react-router-dom";

// Styled Components for Verbose Footer
export const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #1E64CD 44.53%, #77AAF6 70.71%);
  color: white;
  padding: 60px 100.5px 19.609px 100.5px;
  margin-top: auto;
  font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;
`;

export const FooterContent = styled.div`
  max-width: 1405px;
  margin: 0 auto;
  padding: 0 19.5px 0.391px 20px;
`;

export const FooterGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;
  align-self: stretch;
  margin-bottom: 39.609px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 30px;
  }
`;

export const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 19.464px;
  padding-bottom: 152.82px;
`;

export const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  line-height: 20.571px;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`;

export const FooterLinksList = styled.ul`
  list-style: none;
  padding: 0.43px 96.5px 11.57px 0.5px;
  margin: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 12px;
  align-self: stretch;
`;

export const FooterLinkItem = styled.li`
  margin: 0;
`;

export const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  transition: all 0.2s ease;
  display: inline-block;
  font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;

  &:hover {
    color: rgba(255, 255, 255, 1);
    transform: translateX(4px);
  }
`;

export const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 19.464px;
  width: 248px;
`;

export const CompanyHeader = styled.div`
  display: flex;
  padding: 0 76.5px 0 0.5px;
  align-items: center;
  gap: 12px;
  align-self: stretch;
`;

export const CompanyLogo = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
`;

export const CompanyName = styled.h3`
  font-size: 24px;
  font-weight: 700;
  line-height: 30.857px;
  margin: 0;
  color: #ffffff;
  font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;
`;

export const CompanyDescription = styled.p`
  width: 248px;
  font-size: 16px;
  font-weight: 400;
  line-height: 22.4px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;
`;

export const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
`;

export const ContactItem = styled.div`
  display: flex;
  padding: 0 81.5px 0.391px 0.5px;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: rgba(255, 255, 255, 0.8);
  font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;

  &:nth-child(2) {
    padding: 0 98.5px 0.391px 0.5px;
  }

  &:nth-child(3) {
    padding: 2.609px 16.5px 2.391px 0.5px;
    align-items: center;
  }
`;

export const ContactLink = styled.a`
  color: inherit;
  text-decoration: none;
  font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;
`;

export const SocialLinks = styled.div`
  display: flex;
  padding: 0 35.5px 0.391px 0.5px;
  justify-content: center;
  align-items: flex-start;
  gap: 16px;
  align-self: stretch;
`;

export const SocialIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 70.71%, rgba(255, 255, 255, 0.15) 0%);
  box-shadow: -1px -1px 2px 0 rgba(0, 0, 0, 0.05), 1px 1px 2px 0 rgba(255, 255, 255, 0.20), 0 1px 3px 0 rgba(0, 0, 0, 0.03);
  backdrop-filter: blur(3px);
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: -2px -2px 4px 0 rgba(0, 0, 0, 0.08), 2px 2px 4px 0 rgba(255, 255, 255, 0.25), 0 2px 6px 0 rgba(0, 0, 0, 0.05);
  }
`;

export const FooterBottom = styled.div`
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 21px 0.5px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  align-self: stretch;
  flex-wrap: wrap;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

export const Copyright = styled.div`
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  color: rgba(255, 255, 255, 0.6);
  font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;
`;

export const LegalLinks = styled.div`
  display: flex;
  padding-bottom: 0.391px;
  justify-content: flex-end;
  align-items: flex-start;
  gap: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

export const LegalLink = styled(Link)`
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;
  transition: color 0.2s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

export const LegalLinkExternal = styled.a`
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 16px;
  font-weight: 400;
  line-height: 24px;
  font-family: Roboto, -apple-system, Roboto, Helvetica, sans-serif;
  transition: color 0.2s ease;

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;
