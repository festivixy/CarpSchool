import React from "react";
import PropTypes from "prop-types";
import LiquidGlassIconButton from "../../liquidGlass/components/IconButton";
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
  ContactIcon,
  ContactLink,
  SocialLinks,
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
  logo = "/staticimages/carp.school.png",
  companyName = "carp.school",
  description = "Making transportation easier, greener, and more connected for everyone. " +
    "Join thousands of users who are already sharing rides to save money and reduce their environmental impact.",
  email = "contact@carp.school",
  phone = "+1 (555) 123-4567",
  address = "123 Green Street, Eco City, EC 12345",
  onLinkClick,
  className,
  ...props
}) {

  const handleLinkClick = (link, e) => {
    if (onLinkClick) {
      onLinkClick(link, e);
    }
  };

  const navigationLinks = [
    { label: "Find Rides", key: "find-rides", to: "/rides" },
    { label: "Create Ride", key: "create-ride", to: "/create" },
    { label: "My Rides", key: "my-rides", to: "/my-rides" },
    { label: "How it Works", key: "how-it-works", to: "/how-it-works" },
    { label: "Safety", key: "safety", to: "/safety" },
  ];

  const supportLinks = [
    { label: "Help Center", key: "help", to: "/help" },
    { label: "Contact Us", key: "contact", to: "/contact" },
    { label: "FAQ", key: "faq", to: "/faq" },
    { label: "Community Guidelines", key: "guidelines", to: "/guidelines" },
    { label: "Trust & Safety", key: "trust-safety", to: "/trust" },
  ];

  const companyLinks = [
    { label: "About Us", key: "about", to: "/about" },
    { label: "Careers", key: "careers", to: "/careers" },
    { label: "Press", key: "press", to: "/press" },
    { label: "Blog", key: "blog", to: "/blog" },
    { label: "Sustainability", key: "sustainability", to: "/sustainability" },
  ];

  const socialLinks = [
    { platform: "Twitter", icon: "🐦", url: "https://twitter.com/carpschool" },
    { platform: "Facebook", icon: "📘", url: "https://facebook.com/carpschool" },
    { platform: "Instagram", icon: "📷", url: "https://instagram.com/carpschool" },
    { platform: "LinkedIn", icon: "💼", url: "https://linkedin.com/company/carpschool" },
    { platform: "YouTube", icon: "📺", url: "https://youtube.com/carpschool" },
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
                  <ContactIcon>📧</ContactIcon>
                  <ContactLink href={`mailto:${email}`}>
                    {email}
                  </ContactLink>
                </ContactItem>
                <ContactItem>
                  <ContactIcon>📞</ContactIcon>
                  <ContactLink href={`tel:${phone}`}>
                    {phone}
                  </ContactLink>
                </ContactItem>
                <ContactItem>
                  <ContactIcon>📍</ContactIcon>
                  {address}
                </ContactItem>
              </ContactInfo>
              <SocialLinks>
                {socialLinks.map((social) => (
                  <LiquidGlassIconButton
                    key={social.platform}
                    icon={social.icon}
                    title={social.platform}
                    onClick={() => window.open(social.url, "_blank", "noopener,noreferrer")}
                    size="small"
                    variant="default"
                  />
                ))}
              </SocialLinks>
            </CompanyInfo>
          </FooterSection>

          {/* Navigation Links */}
          <FooterSection>
            <SectionTitle>Navigation</SectionTitle>
            <FooterLinksList>
              {navigationLinks.map((link) => (
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
            <SectionTitle>Company</SectionTitle>
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
            <LegalLink to="/cookies" onClick={(e) => handleLinkClick("cookies", e)}>
              Cookie Policy
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
