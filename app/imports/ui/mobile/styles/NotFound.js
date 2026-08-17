import styled from "styled-components";
import { Link } from "react-router-dom";
import { btnBase, btnPrimary, btnGhost } from "../../styles/tokens";

// Styled Components for NotFound
export const Container = styled.div`
  background: var(--cream-1);
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-ui);
  color: var(--ink-1);
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 40px 20px;
  }
`;

export const Content = styled.div`
  background: var(--cream-0);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-xl);
  padding: 40px 30px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow: var(--glass-shadow);

  @media (max-width: 480px) {
    padding: 32px 24px;
    border-radius: var(--r-lg);
  }
`;

export const IllustrationContainer = styled.div`
  margin-bottom: 28px;
  position: relative;
`;

export const ErrorIcon = styled.div`
  font-size: 44px;
  margin-bottom: 10px;
  line-height: 1;
  opacity: 0.4;

  @media (max-width: 480px) {
    font-size: 38px;
  }
`;

export const StatusCode = styled.div`
  font-family: var(--font-display);
  font-size: 76px;
  font-weight: 800;
  color: var(--cream-3);
  line-height: 1;
  letter-spacing: -0.04em;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 64px;
  }
`;

export const Title = styled.h1`
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 700;
  color: var(--ink-1);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;

  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

export const Subtitle = styled.h2`
  font-size: 17px;
  font-weight: 600;
  color: var(--ink-3);
  margin: 0 0 14px 0;
  letter-spacing: -0.01em;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const Description = styled.p`
  font-size: 15px;
  font-weight: 400;
  color: var(--ink-3);
  margin: 0 0 28px 0;
  line-height: 1.5;
  letter-spacing: -0.005em;

  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 24px;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
`;

export const PrimaryButton = styled(Link)`
  ${btnBase}
  ${btnPrimary}
  padding: 14px 24px;
  font-size: 15px;
  text-decoration: none;

  &:hover {
    color: var(--cream-0);
    text-decoration: none;
  }
`;

export const SecondaryButton = styled.button`
  ${btnBase}
  ${btnGhost}
  padding: 14px 24px;
  font-size: 15px;
`;
