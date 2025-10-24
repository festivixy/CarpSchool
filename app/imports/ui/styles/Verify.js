import styled from "styled-components";

export const VerifyContainer = styled.div`
  background-color: rgba(255, 255, 255, 1);
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
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
  color: rgba(0, 0, 0, 1);
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
  color: rgba(0, 0, 0, 1);
  text-align: center;
  margin-bottom: 24px;
  line-height: 1.5;
`;

export const VerifyDescription = styled.div`
  font-size: 16px;
  font-weight: 400;
  color: rgba(100, 100, 100, 1);
  text-align: left;
  margin-bottom: 32px;
  line-height: 1.6;
  width: 100%;
  white-space: pre-line;
  background-color: rgba(248, 249, 250, 1);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(230, 230, 230, 1);
`;

export const VerifyButton = styled.button`
  border-radius: 8px;
  background-color: rgba(34, 197, 94, 1);
  display: flex;
  min-height: 56px;
  width: 100%;
  align-items: center;
  color: rgba(255, 255, 255, 1);
  font-weight: 600;
  justify-content: center;
  padding: 0 16px;
  border: none;
  font-size: 18px;
  font-family: inherit;
  cursor: pointer;
  margin-bottom: 24px;

  &:hover:not(:disabled) {
    background-color: rgba(22, 163, 74, 1);
  }

  &:disabled {
    background-color: rgba(150, 150, 150, 1);
    cursor: not-allowed;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const SuccessMessage = styled.div`
  background-color: rgba(240, 255, 240, 1);
  border: 1px solid rgba(34, 197, 94, 1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: rgba(22, 163, 74, 1);
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
`;

export const ErrorMessage = styled.div`
  background-color: rgba(255, 240, 240, 1);
  border: 1px solid rgba(220, 53, 69, 1);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: rgba(220, 53, 69, 1);
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  width: 100%;
  box-sizing: border-box;
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
