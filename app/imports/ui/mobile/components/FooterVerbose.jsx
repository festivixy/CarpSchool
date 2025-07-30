import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import styled from "styled-components";

// Styled Components for Verbose Footer
const FooterContainer = styled.footer`
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  color: white;
  padding: 60px 0 20px;
  margin-top: auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 40px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 30px;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #ffffff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FooterLinksList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLinkItem = styled.li`
  margin-bottom: 12px;
`;

const FooterLink = styled(Link)`
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

// FooterLinkExternal removed as it was unused

const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const CompanyHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const CompanyLogo = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 12px;
  border-radius: 8px;
`;

const CompanyName = styled.h3`
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  color: #ffffff;
`;

const CompanyDescription = styled.p`
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 20px;
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
`;

const ContactIcon = styled.span`
  margin-right: 8px;
  font-size: 16px;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 20px;
`;

const SocialIcon = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  text-decoration: none;
  font-size: 18px;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: #4a90e2;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  }
`;


const FooterBottom = styled.div`
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

const Copyright = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
`;

const LegalLinks = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
  }
`;

const LegalLink = styled(Link)`
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;

  &:hover {
    color: #4a90e2;
  }
`;

const LegalLinkExternal = styled.a`
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s ease;

  &:hover {
    color: #4a90e2;
  }
`;

/**
 * Comprehensive Footer component with enhanced features
 */
function FooterVerbose({
  logo = "/staticimages/Carpool.png",
  companyName = "Carpool",
  description = "Making transportation easier, greener, and more connected for everyone. " +
    "Join thousands of users who are already carpooling to save money and reduce their environmental impact.",
  email = "hello@carpool.com",
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
    { platform: "Twitter", icon: "🐦", url: "https://twitter.com/carpool" },
    { platform: "Facebook", icon: "📘", url: "https://facebook.com/carpool" },
    { platform: "Instagram", icon: "📷", url: "https://instagram.com/carpool" },
    { platform: "LinkedIn", icon: "💼", url: "https://linkedin.com/company/carpool" },
    { platform: "YouTube", icon: "📺", url: "https://youtube.com/carpool" },
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
                  <a href={`mailto:${email}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {email}
                  </a>
                </ContactItem>
                <ContactItem>
                  <ContactIcon>📞</ContactIcon>
                  <a href={`tel:${phone}`} style={{ color: "inherit", textDecoration: "none" }}>
                    {phone}
                  </a>
                </ContactItem>
                <ContactItem>
                  <ContactIcon>📍</ContactIcon>
                  {address}
                </ContactItem>
              </ContactInfo>
              <SocialLinks>
                {socialLinks.map((social) => (
                  <SocialIcon
                    key={social.platform}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={social.platform}
                  >
                    {social.icon}
                  </SocialIcon>
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
              href="mailto:legal@carpool.com"
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
