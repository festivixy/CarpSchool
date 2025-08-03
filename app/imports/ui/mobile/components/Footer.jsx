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
} from "../styles/Footer";

/**
 * Mobile Footer component with modern design
 */
export default function MobileFooter() {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterLogo>
          <AppName>carp.school</AppName>
        </FooterLogo>
        <FooterLinks>
          <FooterLink to="/tos">Terms</FooterLink>
          <FooterLink to="/privacy">Privacy</FooterLink>
          <FooterLink to="/credits">Credits</FooterLink>
          <FooterLinkExternal href="mailto:contact@carp.school">
            Support
          </FooterLinkExternal>
        </FooterLinks>
        <Copyright>© 2025 carp.school. All rights reserved.</Copyright>
      </FooterContent>
    </FooterContainer>
  );
}
