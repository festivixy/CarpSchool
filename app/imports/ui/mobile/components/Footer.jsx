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
          <AppName>Carpool</AppName>
        </FooterLogo>
        <FooterLinks>
          <FooterLink to="/tos">Terms</FooterLink>
          <FooterLink to="/privacy">Privacy</FooterLink>
          <FooterLinkExternal href="mailto:support@carpool.edu">
            Support
          </FooterLinkExternal>
        </FooterLinks>
        <Copyright>© 2025 Carpool. All rights reserved.</Copyright>
      </FooterContent>
    </FooterContainer>
  );
}
