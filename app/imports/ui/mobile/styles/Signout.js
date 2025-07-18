import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";

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
  background: linear-gradient(
    135deg,
    rgba(248, 249, 250, 1) 0%,
    rgba(240, 242, 245, 1) 100%
  );
  min-height: 100vh;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
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
  background-color: rgba(255, 255, 255, 1);
  border-radius: 16px;
  padding: 40px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  text-align: center;
  max-width: 400px;
  width: 100%;
  border: 1px solid rgba(240, 240, 240, 1);

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
  border: 3px solid rgba(240, 240, 240, 1);
  border-top: 3px solid rgba(0, 0, 0, 1);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto 24px;
`;

export const Icon = styled.div`
  font-size: 56px;
  margin-bottom: 24px;
  animation: ${wave} 0.6s ease-out;

  @media (max-width: 480px) {
    font-size: 48px;
  }
`;

export const LoadingTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 12px 0;
  letter-spacing: -0.3px;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 12px 0;
  letter-spacing: -0.3px;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const LoadingMessage = styled.p`
  font-size: 16px;
  color: rgba(100, 100, 100, 1);
  line-height: 1.5;
  margin: 0 0 32px 0;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ButtonPrimary = styled(Link)`
  display: block;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  font-family: inherit;
  text-align: center;
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  &:hover {
    background-color: rgba(40, 40, 40, 1);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
    color: rgba(255, 255, 255, 1);
    text-decoration: none;
  }
`;

export const ButtonSecondary = styled(Link)`
  display: block;
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  font-family: inherit;
  text-align: center;
  background-color: rgba(248, 249, 250, 1);
  color: rgba(0, 0, 0, 0.87);
  border: 1px solid rgba(224, 224, 224, 1);

  &:hover {
    background-color: rgba(240, 240, 240, 1);
    transform: translateY(-1px);
    color: rgba(0, 0, 0, 0.87);
    text-decoration: none;
  }
`;
