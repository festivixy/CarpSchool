import styled from "styled-components";

export const FooterContainer = styled.footer`
  position: relative;
  margin-top: auto;
  padding: 48px 0 0;
  backdrop-filter: blur(15px);
  overflow: hidden;
`;

export const FooterBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`;

export const BlurLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.08);
  border-top: 1px solid rgba(255, 255, 255, 0.12);

  /* Single subtle glass effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.08) 0%,
      transparent 50%,
      rgba(255, 255, 255, 0.04) 100%
    );
    mix-blend-mode: overlay;
    opacity: 0.3;
    pointer-events: none;
  }
`;

export const GlassLayer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.06) 0%,
    rgba(255, 255, 255, 0.03) 50%,
    rgba(255, 255, 255, 0.05) 100%
  );
  box-shadow:
    /* RGB channel shifts for chromatic aberration */
    inset 3px 0 6px rgba(255, 0, 0, 0.06),
    inset -2px 0 6px rgba(0, 255, 255, 0.06),
    inset 0 3px 6px rgba(0, 255, 0, 0.05),
    inset 0 -2px 6px rgba(255, 0, 255, 0.05),
    inset 2px 2px 6px rgba(0, 0, 255, 0.06),
    inset -3px -3px 6px rgba(255, 255, 0, 0.06),
    /* Subtle refraction highlights */ inset 0 1px 2px
      rgba(255, 255, 255, 0.08),
    inset 0 -1px 1px rgba(0, 0, 0, 0.02);
  filter: contrast(1.03) brightness(1.01);

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: hue-rotate(2deg) saturate(1.04);
    mix-blend-mode: color-dodge;
    opacity: 0.1;
    pointer-events: none;
    z-index: 1;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    backdrop-filter: hue-rotate(-2deg) saturate(1.08) contrast(1.01);
    mix-blend-mode: soft-light;
    opacity: 0.08;
    pointer-events: none;
    z-index: 1;
  }
`;

export const FooterContent = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
  gap: 48px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 24px;
  z-index: 10;

  @media (max-width: 1024px) {
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 32px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    padding: 24px 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 20px;
    padding: 20px 12px;
    text-align: center;
  }

  @media (max-width: 360px) {
    gap: 16px;
    padding: 16px 8px;
  }
`;

export const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const SectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding-bottom: 8px;
`;

export const SectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const FooterLink = styled.a`
  font-size: 14px;
  color: #000;
  text-decoration: underline;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px 0;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);

  &:hover {
    color: #333;
    transform: translateX(4px);
    text-shadow: 0 1px 3px rgba(255, 255, 255, 0.9);
    text-decoration: underline;
  }

  &:active {
    transform: translateX(2px);
  }
`;

export const CompanyInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 480px) {
    align-items: center;
  }
`;

export const CompanyLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  img {
    height: 40px;
    width: auto;
    border-radius: 8px;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  }
`;

export const CompanyName = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 0;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
`;

export const CompanyDescription = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
  max-width: 280px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);

  @media (max-width: 480px) {
    text-align: center;
    max-width: none;
  }
`;

export const SocialLinks = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 480px) {
    justify-content: center;
  }
`;

export const SocialIcon = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

export const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #555;

  span:first-child {
    font-size: 16px;
    line-height: 1;
  }

  a {
    color: #555;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: #333;
    }
  }

  @media (max-width: 480px) {
    justify-content: center;
  }
`;

export const NewsletterSection = styled.div`
  form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

export const NewsletterButton = styled.div`
  display: flex;
  justify-content: center;
`;

export const FooterBottom = styled.div`
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 10;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    text-align: center;
    padding: 20px 16px;
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
    gap: 10px;
  }

  @media (max-width: 360px) {
    padding: 12px 8px;
  }
`;

export const Copyright = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);
`;

export const LegalLinks = styled.div`
  display: flex;
  gap: 24px;

  @media (max-width: 768px) {
    gap: 16px;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 8px;
  }
`;

export const LegalLink = styled.a`
  font-size: 14px;
  color: #000;
  text-decoration: underline;
  cursor: pointer;
  transition: all 0.2s ease;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.6);

  &:hover {
    color: #333;
    text-shadow: 0 1px 3px rgba(255, 255, 255, 0.8);
    text-decoration: underline;
  }
`;
