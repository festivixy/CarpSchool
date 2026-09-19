import React from "react";
import PropTypes from "prop-types";
import {
  FooterContainer,
  FooterContent,
  FooterGrid,
  FooterSection,
  SectionTitle,
  FooterLinksList,
  FooterLinkItem,
  FooterLink,
  CompanyInfo,
  CompanyHeader,
  CompanyName,
  CompanyDescription,
  ContactInfo,
  ContactItem,
  ContactLink,
  FooterBottom,
  Copyright,
  LegalLinks,
  LegalLink,
  LegalLinkExternal,
} from "../styles/FooterVerbose";
import Logo from "../../components/Logo";

/**
 * Comprehensive Footer component with enhanced features
 * Desktop-only component for detailed footer navigation
 */
function FooterVerbose({
  companyName = "CarpSchool",
  description = "Making transportation easier, greener, and more connected for everyone. Join us, share rides to save money and reduce their environmental impact. Built for school communities.",
  email = "contact@carpschool.com",
  onLinkClick,
  className,
  ...props
}) {

  const handleLinkClick = (link, e) => {
    if (onLinkClick) {
      onLinkClick(link, e);
    }
  };

  const supportLinks = [
    { label: "Guide", key: "guide", to: "/guide" },
    { label: "Help Center", key: "help", to: "/help" },
    { label: "Contact Us", key: "contact", to: "/contact" },
    { label: "FAQ", key: "faq", to: "/faq" },
  ];

  const companyLinks = [
    { label: "About Us", key: "about", to: "/about" },
  ];

  return (
    <FooterContainer className={className} {...props}>
      <FooterContent>
        <FooterGrid>
          {/* Company Info Section */}
          <FooterSection>
            <CompanyInfo>
              <CompanyHeader>
                <Logo size={30} wordmark={false} color="var(--cream-0)" />
                <CompanyName>{companyName}</CompanyName>
              </CompanyHeader>
              <CompanyDescription>{description}</CompanyDescription>
              <ContactInfo>
                <ContactItem>
                  <ContactLink href={`mailto:${email}`}>
                    {email}
                  </ContactLink>
                </ContactItem>
              </ContactInfo>
            </CompanyInfo>
          </FooterSection>

          {/* Support Links */}
          <FooterSection>
            <SectionTitle>Support</SectionTitle>
            <FooterLinksList>
              {supportLinks.map((link) => (
                <FooterLinkItem key={link.key}>
                  <FooterLink
                    to={link.to}
                    onClick={(e) => handleLinkClick(link.key, e)}
                  >
                    {link.label}
                  </FooterLink>
                </FooterLinkItem>
              ))}
            </FooterLinksList>
          </FooterSection>

          {/* Company Links */}
          <FooterSection>
            <SectionTitle>Us</SectionTitle>
            <FooterLinksList>
              {companyLinks.map((link) => (
                <FooterLinkItem key={link.key}>
                  <FooterLink
                    to={link.to}
                    onClick={(e) => handleLinkClick(link.key, e)}
                  >
                    {link.label}
                  </FooterLink>
                </FooterLinkItem>
              ))}
            </FooterLinksList>
          </FooterSection>

        </FooterGrid>

        <FooterBottom>
          <Copyright>
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </Copyright>
          <LegalLinks>
            <LegalLink to="/privacy" onClick={(e) => handleLinkClick("privacy", e)}>
              Privacy Policy
            </LegalLink>
            <LegalLink to="/terms" onClick={(e) => handleLinkClick("terms", e)}>
              Terms of Service
            </LegalLink>
            <LegalLinkExternal
              href={`mailto:${email}`}
              onClick={(e) => handleLinkClick("legal-contact", e)}
            >
              Legal
            </LegalLinkExternal>
          </LegalLinks>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
}

FooterVerbose.propTypes = {
  companyName: PropTypes.string,
  description: PropTypes.string,
  email: PropTypes.string,
  onLinkClick: PropTypes.func,
  className: PropTypes.string,
};

export default FooterVerbose;
