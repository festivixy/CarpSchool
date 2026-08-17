import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import { btnBase, btnPrimary, btnGhost } from "../../styles/tokens";

// Keyframe animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const wave = keyframes`
  0%, 100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  75% {
    transform: rotate(10deg);
  }
`;

// Styled Components for Signout
export const Container = styled.div`
  background: var(--cream-1);
  min-height: 100vh;
  font-family: var(--font-ui);
  color: var(--ink-1);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

export const Content = styled.div`
  background: var(--cream-0);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-xl);
  padding: 40px 24px;
  box-shadow: var(--glass-shadow);
  text-align: center;
  max-width: 400px;
  width: 100%;

  @media (max-width: 480px) {
    padding: 32px 20px;
  }
`;

export const LoadingSection = styled.div`
  animation: ${fadeIn} 0.3s ease-out;
`;

export const SuccessSection = styled.div`
  animation: ${slideUp} 0.4s ease-out;
`;

export const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 3px solid var(--cream-2);
  border-top: 3px solid var(--signal-yellow);
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
  margin: 0 auto 24px;
`;

export const Icon = styled.div`
  font-size: 52px;
  margin-bottom: 22px;
  animation: ${wave} 0.6s ease-out;

  @media (max-width: 480px) {
    font-size: 46px;
  }
`;

const headingStyles = `
  font-family: var(--font-display);
  font-size: 25px;
  font-weight: 700;
  color: var(--ink-1);
  margin: 0 0 12px 0;
  letter-spacing: -0.02em;

  @media (max-width: 480px) {
    font-size: 21px;
  }
`;

export const LoadingTitle = styled.h2`
  ${headingStyles}
`;

export const Title = styled.h2`
  ${headingStyles}
`;

export const LoadingMessage = styled.p`
  font-size: 15px;
  color: var(--ink-3);
  line-height: 1.5;
  letter-spacing: -0.005em;
  margin: 0 0 28px 0;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const ButtonPrimary = styled(Link)`
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

export const ButtonSecondary = styled(Link)`
  ${btnBase}
  ${btnGhost}
  padding: 14px 24px;
  font-size: 15px;
  text-decoration: none;

  &:hover {
    color: var(--ink-1);
    text-decoration: none;
  }
`;
