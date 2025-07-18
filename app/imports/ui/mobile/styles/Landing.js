import styled from "styled-components";
import { Link } from "react-router-dom";

// Styled Components for Landing
export const Container = styled.div`
  background-color: rgba(255, 255, 255, 1);
  width: 100%;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  overflow-x: hidden;
`;

export const Hero = styled.div`
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(40, 40, 40, 0.8) 100%
  );
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;

  @media (max-width: 480px) {
    padding: 40px 20px;
  }
`;

export const HeroContent = styled.div`
  text-align: center;
  color: white;
  max-width: 400px;
  width: 100%;
`;

export const LogoSection = styled.div`
  margin-bottom: 40px;
`;

export const AppIcon = styled.div`
  font-size: 60px;
  margin-bottom: 16px;
`;

export const AppName = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
  color: rgba(255, 255, 255, 1) !important;

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

export const CtaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const CtaPrimary = styled(Link)`
  background-color: rgba(255, 255, 255, 1);
  color: rgba(0, 0, 0, 1);
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(240, 240, 240, 1);
    color: rgba(0, 0, 0, 1);
    transform: translateY(-1px);
  }
`;

export const CtaSecondary = styled(Link)`
  color: rgba(255, 255, 255, 1);
  padding: 14px 24px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.5);
    color: rgba(255, 255, 255, 1);
  }
`;

export const Features = styled.div`
  padding: 60px 20px;
  background-color: rgba(250, 250, 250, 1);
`;

export const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

export const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;

  &::selection {
    background-color: rgba(0, 0, 0, 0.1);
    color: inherit;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const SectionSubtitle = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: rgba(100, 100, 100, 1);
  margin: 0;
  line-height: 1.4;
`;

export const Content = styled.div`
  max-width: 400px;
  margin: 0 auto;
  padding: 0 20px;
`;

export const Paragraph = styled.p`
  font-size: 16px;
  font-weight: 400;
  color: rgba(60, 60, 60, 1);
  margin: 0 0 20px 0;
  line-height: 1.6;
  text-align: left;
`;

export const HowItWorks = styled.div`
  padding: 60px 20px;
  background-color: rgba(255, 255, 255, 1);
`;

export const FinalCta = styled.div`
  padding: 60px 20px;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.9) 0%,
    rgba(40, 40, 40, 0.8) 100%
  );
  text-align: center;
`;

export const CtaContent = styled.div`
  color: rgba(255, 255, 255, 1);
  max-width: 400px;
  margin: 0 auto;
`;

export const CtaTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;
  color: rgba(255, 255, 255, 1) !important;
  padding-bottom: 16px;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const CtaSubtitle = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.8);
  margin: 0 0 32px 0;
  line-height: 1.4;
`;

export const CtaButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
