import styled from "styled-components";
import { Link } from "react-router-dom";
import { btnBase, btnCoral, btnGhost } from "../../styles/tokens";

export const Container = styled.div`
  min-height: 100vh;
  background: var(--cream-0);
  color: var(--ink-1);
  font-family: var(--font-ui);
`;

export const Hero = styled.section`
  padding: 80px 20px 56px;
  display: flex;
  justify-content: center;
  text-align: center;
`;

export const HeroContent = styled.div`
  max-width: 720px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
`;

export const LogoSection = styled.div``;

export const AppName = styled.h1`
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(48px, 9vw, 84px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1;
`;

export const CtaSection = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

export const CtaPrimary = styled(Link)`
  ${btnBase}
  ${btnCoral}
  text-decoration: none;
`;

export const CtaSecondary = styled(Link)`
  ${btnBase}
  ${btnGhost}
  text-decoration: none;
`;

export const Features = styled.section`
  max-width: 880px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const SectionHeader = styled.div`
  margin-bottom: 16px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.02em;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const Paragraph = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 1.6;
  color: var(--ink-2);
`;

export const HowItWorks = styled.section`
  max-width: 880px;
  margin: 0 auto;
  padding: 40px 20px;
`;

export const FinalCta = styled.section`
  margin: 40px 20px 80px;
  padding: 48px 24px;
  background: var(--ink-1);
  color: var(--cream-0);
  border-radius: var(--r-xl);
  text-align: center;
`;

export const CtaContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

export const CtaTitle = styled.h2`
  margin: 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
`;

export const CtaButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;
