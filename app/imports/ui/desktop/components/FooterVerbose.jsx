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
  CompanyLogo,
  CompanyName,
  CompanyDescription,
  ContactInfo,
  ContactItem,
  ContactLink,
  SocialLinks,
  SocialIcon,
  FooterBottom,
  Copyright,
  LegalLinks,
  LegalLink,
  LegalLinkExternal,
} from "../styles/FooterVerbose";

/**
 * Comprehensive Footer component with enhanced features
 * Desktop-only component for detailed footer navigation
 */
function FooterVerbose({
  logo = "https://api.builder.io/api/v1/image/assets/TEMP/f4a021becb7f3cbf8e67cef5249b3fd0f05fd67b?width=80",
  companyName = "CarpSchool",
  description = "Making transportation easier, greener, and more connected for everyone. Join us, share rides to save money and reduce their environmental impact. Built for school communities.",
  email = "contact@carp.school",
  phone = "N/A",
  address = "kobosh city (placeholder)",
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
    { label: "Help Center", key: "help", to: "/help" },
    { label: "Contact Us", key: "contact", to: "/contact" },
    { label: "FAQ", key: "faq", to: "/faq" },
  ];

  const companyLinks = [
    { label: "About Us", key: "about", to: "/about" },
    { label: "Blog", key: "blog", to: "/blog" },
  ];

  return (
    <FooterContainer className={className} {...props}>
      <FooterContent>
        <FooterGrid>
          {/* Company Info Section */}
          <FooterSection>
            <CompanyInfo>
              <CompanyHeader>
                <CompanyLogo src={logo} alt={companyName} />
                <CompanyName>{companyName}</CompanyName>
              </CompanyHeader>
              <CompanyDescription>{description}</CompanyDescription>
              <ContactInfo>
                <ContactItem>
                  <ContactLink href={`mailto:${email}`}>
                    {email}
                  </ContactLink>
                </ContactItem>
                <ContactItem>
                  <ContactLink href={`tel:${phone}`}>
                    {phone}
                  </ContactLink>
                </ContactItem>
                <ContactItem>
                  {address}
                </ContactItem>
              </ContactInfo>
              <SocialLinks>
                <SocialIcon />
                <SocialIcon />
                <SocialIcon />
                <SocialIcon />
                <SocialIcon />
              </SocialLinks>
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
            © {new Date().getFullYear()} {companyName} . All rights reserved.
          </Copyright>
          <LegalLinks>
            <LegalLink to="/privacy" onClick={(e) => handleLinkClick("privacy", e)}>
              Privacy Policy
            </LegalLink>
            <LegalLink to="/terms" onClick={(e) => handleLinkClick("terms", e)}>
              Terms of Service
            </LegalLink>
            <LegalLinkExternal
              href="mailto:contact@carp.school"
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
  logo: PropTypes.string,
  companyName: PropTypes.string,
  description: PropTypes.string,
  email: PropTypes.string,
  phone: PropTypes.string,
  address: PropTypes.string,
  onLinkClick: PropTypes.func,
  className: PropTypes.string,
};

export default FooterVerbose;
