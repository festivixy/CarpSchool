import styled from "styled-components";
import { Link } from "react-router-dom";
import { eyebrow } from "../../styles/tokens";

/* Note: this file previously carried sub-pixel paddings from a visual-builder
 * export (e.g. 100.5px / 19.609px / 152.82px). They are replaced with the
 * design system's spacing rhythm. */

// Styled Components for Verbose Footer
export const FooterContainer = styled.footer`
  background: var(--ink-1);
  color: var(--cream-0);
  padding: 56px 32px 24px;
  margin-top: auto;
  font-family: var(--font-ui);
`;

export const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

export const FooterGrid = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 48px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 32px;
  }
`;

export const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
`;

export const SectionTitle = styled.h4`
  ${eyebrow}
  color: var(--accent-on-dark);
  margin: 0;
`;

export const FooterLinksList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

export const FooterLinkItem = styled.li`
  margin: 0;
`;

export const FooterLink = styled(Link)`
  color: rgba(246, 245, 240, 0.72);
  text-decoration: none;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  letter-spacing: -0.005em;
  transition: color 0.12s ease, transform 0.12s ease;
  display: inline-block;

  &:hover {
    color: var(--accent-on-dark);
    transform: translateX(3px);
  }
`;

export const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  max-width: 280px;
`;

export const CompanyHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const CompanyName = styled.h3`
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin: 0;
  color: var(--cream-0);
`;

export const CompanyDescription = styled.p`
  font-size: 14px;
  font-weight: 400;
  line-height: 1.55;
  letter-spacing: -0.005em;
  color: rgba(246, 245, 240, 0.6);
  margin: 0;
`;

export const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  align-self: stretch;
`;

export const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.6;
  color: rgba(246, 245, 240, 0.72);
`;

export const ContactLink = styled.a`
  color: inherit;
  text-decoration: none;

  &:hover {
    color: var(--accent-on-dark);
  }
`;

export const FooterBottom = styled.div`
  border-top: 1px solid rgba(246, 245, 240, 0.12);
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
  font-family: var(--font-mono);
  font-size: 11.5px;
  letter-spacing: 0.04em;
  color: rgba(246, 245, 240, 0.5);
`;

export const LegalLinks = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const legalLinkStyles = `
  color: rgba(246, 245, 240, 0.5);
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;
  letter-spacing: -0.005em;
  transition: color 0.12s ease;

  &:hover {
    color: var(--accent-on-dark);
  }
`;

export const LegalLink = styled(Link)`
  ${legalLinkStyles}
`;

export const LegalLinkExternal = styled.a`
  ${legalLinkStyles}
`;
