import React from "react";
import {
  FooterContainer,
  FooterContent,
  FooterLogo,
  AppName,
  FooterLinks,
  FooterLink,
  FooterLinkExternal,
  Copyright,
} from "../styles/SimpleFooter";

/**
 * Simple Footer component with modern design
 * Desktop-only component for footer navigation
 */
export default function SimpleFooter() {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterLogo>
          <AppName>CarpSchool</AppName>
        </FooterLogo>
        <FooterLinks>
          <FooterLink to="/terms">Terms</FooterLink>
          <FooterLink to="/privacy">Privacy</FooterLink>
          <FooterLink to="/credits">Credits</FooterLink>
          <FooterLinkExternal href="mailto:contact@carp.school">
            Support
          </FooterLinkExternal>
        </FooterLinks>
        <Copyright>© 2025 CarpSchool. All rights reserved.</Copyright>
      </FooterContent>
    </FooterContainer>
  );
}
