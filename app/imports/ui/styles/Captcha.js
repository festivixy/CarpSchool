import styled from "styled-components";
import { inputBase } from "./tokens";

// Styled Components for Captcha
export const CaptchaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-family: var(--font-ui);
`;

export const CaptchaLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: var(--ink-1);
  margin-bottom: 4px;
`;

export const CaptchaContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--cream-1);
  border-radius: var(--r-md);
  border: 1px solid var(--glass-stroke);
`;

export const CaptchaDisplay = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream-0);
  border-radius: var(--r-sm);
  padding: 8px;
  min-height: 50px;
  border: 1px solid var(--glass-stroke);

  svg {
    max-width: 100%;
    height: auto;
  }
`;

export const CaptchaLoading = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream-1);
  border-radius: var(--r-sm);
  padding: 16px;
  color: var(--ink-4);
  font-size: 13px;
  min-height: 50px;
  border: 1px solid var(--glass-stroke);
`;

export const CaptchaRefreshButton = styled.button`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: var(--ink-1);
  color: var(--cream-0);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.12s ease, transform 0.12s ease;

  &:hover:not(:disabled) {
    background: #000;
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }

  img {
    width: 20px;
    height: 20px;
    filter: invert(1);
  }
`;

export const CaptchaInput = styled.input`
  ${inputBase}
  font-family: var(--font-mono);
  letter-spacing: 0.16em;

  &:disabled {
    background: var(--cream-1);
    cursor: not-allowed;
  }
`;

export const ErrorMessage = styled.div`
  color: var(--danger);
  font-size: 12px;
  margin-top: 4px;
`;
