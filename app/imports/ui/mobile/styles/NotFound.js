import styled from "styled-components";
import { Link } from "react-router-dom";

// Styled Components for NotFound
export const Container = styled.div`
  background: linear-gradient(
    135deg,
    rgba(250, 250, 250, 1) 0%,
    rgba(240, 240, 240, 1) 100%
  );
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  padding: 20px;
  box-sizing: border-box;

  @media (max-width: 480px) {
    padding: 40px 20px;
  }
`;

export const Content = styled.div`
  background-color: rgba(255, 255, 255, 1);
  border-radius: 20px;
  padding: 40px 30px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(230, 230, 230, 0.5);

  @media (max-width: 480px) {
    padding: 32px 24px;
    border-radius: 16px;
  }
`;

export const IllustrationContainer = styled.div`
  margin-bottom: 32px;
  position: relative;
`;

export const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 12px;
  line-height: 1;

  @media (max-width: 480px) {
    font-size: 40px;
  }
`;

export const StatusCode = styled.div`
  font-size: 72px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.1);
  line-height: 1;
  letter-spacing: -2px;
  margin: 0;

  @media (max-width: 480px) {
    font-size: 64px;
  }
`;

export const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  margin: 0 0 8px 0;
  letter-spacing: -0.3px;

  @media (max-width: 480px) {
    font-size: 22px;
  }
`;

export const Subtitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: rgba(100, 100, 100, 1);
  margin: 0 0 16px 0;
  letter-spacing: -0.2px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const Description = styled.p`
  font-size: 16px;
  font-weight: 400;
  color: rgba(120, 120, 120, 1);
  margin: 0 0 32px 0;
  line-height: 1.5;

  @media (max-width: 480px) {
    font-size: 15px;
    margin-bottom: 28px;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

export const PrimaryButton = styled(Link)`
  background-color: rgba(0, 0, 0, 1);
  color: rgba(255, 255, 255, 1);
  padding: 14px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  display: inline-block;

  &:hover {
    background-color: rgba(40, 40, 40, 1);
    color: rgba(255, 255, 255, 1);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const SecondaryButton = styled.button`
  background-color: transparent;
  color: rgba(0, 0, 0, 0.7);
  padding: 14px 24px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.2);
    color: rgba(0, 0, 0, 0.87);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;
