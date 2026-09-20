import styled from "styled-components";

export const VerifyContainer = styled.div`
  background-color: var(--cream-0);
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  font-family: var(--font-ui);
  margin: 0 auto;
  padding: 10px 0;
  min-height: 100vh;
  box-sizing: border-box;
`;

export const VerifyHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 75px;
  margin-bottom: 40px;
`;

export const VerifyIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
`;

export const VerifyTitle = styled.h1`
  font-size: 24px;
  color: var(--ink-1);
  font-weight: 600;
  text-align: center;
  letter-spacing: -0.24px;
  margin: 0;
`;

export const VerifyContent = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: start;
  padding: 0 24px;
  max-width: 500px;
`;

export const VerifyText = styled.div`
  font-size: 18px;
  font-weight: 500;
  color: var(--ink-1);
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.5;
`;

export const VerifyDescription = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: var(--ink-3);
  text-align: left;
  margin-bottom: 32px;
  line-height: 1.6;
  width: 100%;
  white-space: pre-line;
  background-color: var(--cream-1);
  padding: 20px;
  border-radius: var(--r-md);
  border: 1px solid var(--cream-2);
`;

export const VerifyButton = styled.button`
  border-radius: var(--r-md);
  background-color: var(--accent);
  display: flex;
  min-height: 56px;
  width: 100%;
  align-items: center;
  color: var(--on-accent);
  font-weight: 600;
  justify-content: center;
  padding: 0 16px;
  border: none;
  font-size: 18px;
  font-family: inherit;
  cursor: pointer;
  margin-bottom: 24px;

  &:hover:not(:disabled) {
    background-color: var(--accent-deep);
  }

  &:disabled {
    background-color: var(--cream-3);
    cursor: not-allowed;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const SuccessMessage = styled.div`
  background-color: var(--leaf-soft);
  border: 1px solid var(--leaf);
  border-radius: var(--r-md);
  padding: 16px;
  margin-bottom: 24px;
  color: var(--leaf);
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
`;

export const ErrorMessage = styled.div`
  background-color: rgba(255, 240, 240, 1);
  border: 1px solid rgba(220, 53, 69, 1);
  border-radius: var(--r-md);
  padding: 16px;
  margin-bottom: 24px;
  color: rgba(220, 53, 69, 1);
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
`;

export const SchoolEmailSection = styled.div`
  background-color: var(--cream-1);
  border-radius: var(--r-md);
  padding: 24px;
  margin: 24px 0;
  border: 1px solid var(--cream-2);
  width: 100%;
  box-sizing: border-box;
`;

export const EmailStepContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const StepTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: var(--ink-1);
  text-align: center;
  margin: 0 0 12px 0;
`;

export const StepDescription = styled.p`
  font-size: 16px;
  font-weight: 400;
  color: var(--ink-3);
  text-align: center;
  margin: 0 0 24px 0;
  line-height: 1.5;
`;

export const EmailInput = styled.input`
  border-radius: var(--r-md);
  background-color: var(--cream-0);
  width: 100%;
  min-height: 48px;
  color: var(--ink-1);
  font-weight: 400;
  padding: 12px 16px;
  border: 2px solid rgba(224, 224, 224, 1);
  font-size: 16px;
  font-family: inherit;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 20px;

  &:focus {
    border-color: var(--leaf);
  }

  &::placeholder {
    color: rgba(130, 130, 130, 1);
  }

  &:disabled {
    background-color: rgba(245, 245, 245, 1);
    cursor: not-allowed;
  }
`;

export const CodeInput = styled.input`
  border-radius: var(--r-md);
  background-color: var(--cream-0);
  width: 100%;
  min-height: 56px;
  color: var(--ink-1);
  font-weight: 600;
  padding: 12px 16px;
  border: 2px solid rgba(224, 224, 224, 1);
  font-size: 24px;
  font-family: monospace;
  text-align: center;
  letter-spacing: 8px;
  outline: none;
  box-sizing: border-box;
  margin-bottom: 20px;

  &:focus {
    border-color: var(--leaf);
  }

  &::placeholder {
    color: rgba(130, 130, 130, 1);
    letter-spacing: 4px;
  }

  &:disabled {
    background-color: rgba(245, 245, 245, 1);
    cursor: not-allowed;
  }
`;

// Media Queries for responsive design
export const MediaQueries = styled.div`
  @media (max-width: 480px) {
    ${VerifyContainer} {
      padding: 10px;
    }

    ${VerifyContent} {
      padding: 0 16px;
    }

    ${VerifyIcon} {
      font-size: 48px;
    }

    ${VerifyTitle} {
      font-size: 20px;
    }

    ${VerifyText} {
      font-size: 16px;
    }

    ${VerifyDescription} {
      font-size: 14px;
      padding: 16px;
    }

    ${VerifyButton} {
      font-size: 16px;
      min-height: 48px;
    }
  }
`;
