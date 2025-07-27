import React from "react";
import PropTypes from "prop-types";
import LiquidGlassButton from "./Button";
import LiquidGlassTextInput from "./TextInput";
import {
  FooterContainer,
  FooterBackground,
  BlurLayer,
  GlassLayer,
  FooterContent,
  FooterSection,
  SectionTitle,
  SectionContent,
  FooterLink,
  SocialLinks,
  SocialIcon,
  CompanyInfo,
  CompanyLogo,
  CompanyName,
  CompanyDescription,
  FooterBottom,
  Copyright,
  LegalLinks,
  LegalLink,
  ContactInfo,
  ContactItem,
  NewsletterSection,
  NewsletterButton,
} from "../styles/Footer";

/**
 * LiquidGlass Footer component with glass morphism effect
 */
function LiquidGlassFooter({
  logo = "/staticimages/Carpool.png",
  companyName = "Carpool",
  description = "Making transportation easier, greener, and more connected for everyone.",
  email = "hello@carpool.com",
  phone = "+1 (555) 123-4567",
  address = "123 Green Street, Eco City, EC 12345",
  onNewsletterSubmit,
  onLinkClick,
  className,
  ...props
}) {
  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    const emailValue = e.target.email.value;
    if (onNewsletterSubmit) {
      onNewsletterSubmit(emailValue);
    }
  };

  const handleLinkClick = (link, e) => {
    if (onLinkClick) {
      onLinkClick(link, e);
    }
  };

  const navigationLinks = [
    { label: "Find Rides", key: "find-rides" },
    { label: "Create Ride", key: "create-ride" },
    { label: "My Rides", key: "my-rides" },
    { label: "How it Works", key: "how-it-works" },
    { label: "Safety", key: "safety" },
  ];

  const supportLinks = [
    { label: "Help Center", key: "help" },
    { label: "Contact Us", key: "contact" },
    { label: "FAQ", key: "faq" },
    { label: "Community Guidelines", key: "guidelines" },
    { label: "Trust & Safety", key: "trust-safety" },
  ];

  const companyLinks = [
    { label: "About Us", key: "about" },
    { label: "Careers", key: "careers" },
    { label: "Press", key: "press" },
    { label: "Blog", key: "blog" },
    { label: "Sustainability", key: "sustainability" },
  ];

  const socialLinks = [
    { platform: "Twitter", icon: "🐦", url: "https://twitter.com" },
    { platform: "Facebook", icon: "📘", url: "https://facebook.com" },
    { platform: "Instagram", icon: "📷", url: "https://instagram.com" },
    { platform: "LinkedIn", icon: "💼", url: "https://linkedin.com" },
  ];

  return (
    <FooterContainer className={className} {...props}>
      <FooterBackground>
        <BlurLayer />
        <GlassLayer />
      </FooterBackground>

      <FooterContent>
        {/* Company Info Section */}
        <CompanyInfo>
          <CompanyLogo>
            {logo && <img src={logo} alt={companyName} />}
            <CompanyName>{companyName}</CompanyName>
          </CompanyLogo>
          <CompanyDescription>{description}</CompanyDescription>

          <SocialLinks>
            {socialLinks.map((social) => (
              <SocialIcon
                key={social.platform}
                onClick={() => handleLinkClick(social.url)}
                title={social.platform}
              >
                {social.icon}
              </SocialIcon>
            ))}
          </SocialLinks>
        </CompanyInfo>

        {/* Navigation Links */}
        <FooterSection>
          <SectionTitle>Rides</SectionTitle>
          <SectionContent>
            {navigationLinks.map((link) => (
              <FooterLink
                key={link.key}
                onClick={() => handleLinkClick(link.key)}
              >
                {link.label}
              </FooterLink>
            ))}
          </SectionContent>
        </FooterSection>

        {/* Support Links */}
        <FooterSection>
          <SectionTitle>Support</SectionTitle>
          <SectionContent>
            {supportLinks.map((link) => (
              <FooterLink
                key={link.key}
                onClick={() => handleLinkClick(link.key)}
              >
                {link.label}
              </FooterLink>
            ))}
          </SectionContent>
        </FooterSection>

        {/* Company Links */}
        <FooterSection>
          <SectionTitle>Company</SectionTitle>
          <SectionContent>
            {companyLinks.map((link) => (
              <FooterLink
                key={link.key}
                onClick={() => handleLinkClick(link.key)}
              >
                {link.label}
              </FooterLink>
            ))}
          </SectionContent>
        </FooterSection>

        {/* Contact & Newsletter */}
        <FooterSection>
          <SectionTitle>Stay Connected</SectionTitle>
          <SectionContent>
            <ContactInfo>
              <ContactItem>
                <span>📧</span>
                <a href={`mailto:${email}`}>{email}</a>
              </ContactItem>
              <ContactItem>
                <span>📞</span>
                <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
              </ContactItem>
              <ContactItem>
                <span>📍</span>
                <span>{address}</span>
              </ContactItem>
            </ContactInfo>

            <NewsletterSection>
              <form onSubmit={handleNewsletterSubmit}>
                <LiquidGlassTextInput
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  icon="📧"
                  iconPosition="left"
                  required
                />
                <NewsletterButton type="submit">
                  <LiquidGlassButton label="Subscribe" />
                </NewsletterButton>
              </form>
            </NewsletterSection>
          </SectionContent>
        </FooterSection>
      </FooterContent>

      {/* Footer Bottom */}
      <FooterBottom>
        <Copyright>
          © {new Date().getFullYear()} {companyName}. All rights reserved.
        </Copyright>
        <LegalLinks>
          <LegalLink onClick={() => handleLinkClick("privacy")}>
            Privacy Policy
          </LegalLink>
          <LegalLink onClick={() => handleLinkClick("terms")}>
            Terms of Service
          </LegalLink>
          <LegalLink onClick={() => handleLinkClick("credits")}>
            Credits
          </LegalLink>
        </LegalLinks>
      </FooterBottom>
    </FooterContainer>
  );
}

LiquidGlassFooter.propTypes = {
  logo: PropTypes.string,
  companyName: PropTypes.string,
  description: PropTypes.string,
  email: PropTypes.string,
  phone: PropTypes.string,
  address: PropTypes.string,
  onNewsletterSubmit: PropTypes.func,
  onLinkClick: PropTypes.func,
  className: PropTypes.string,
};

export default LiquidGlassFooter;
