import styled, { css } from "styled-components";

export const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background: #FAFAFA;
  border-radius: 12px;
  border: 1px solid #E5E5EA;
  margin: 20px;
  min-height: 200px;

  /* Variant styles */
  ${props => props.variant === "minimal" && css`
    padding: 20px;
    min-height: auto;
    background: transparent;
    border: none;
    margin: 0;
  `}

  ${props => props.variant === "detailed" && css`
    padding: 60px 40px;
    max-width: 600px;
    margin: 40px auto;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  `}

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    background: #1C1C1E;
    border-color: #2C2C2E;
    color: #F2F2F7;
  }
`;

export const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;

  ${ErrorContainer}[data-variant="minimal"] & {
    font-size: 24px;
    margin-bottom: 8px;
  }
`;

export const ErrorTitle = styled.h2`
  color: #1C1C1E;
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 16px 0;
  line-height: 1.3;

  ${ErrorContainer}[data-variant="minimal"] & {
    font-size: 18px;
    margin: 0 0 8px 0;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    color: #F2F2F7;
  }
`;

export const ErrorMessage = styled.p`
  color: #666;
  font-size: 16px;
  line-height: 1.5;
  margin: 0 0 24px 0;
  max-width: 400px;

  ${ErrorContainer}[data-variant="minimal"] & {
    font-size: 14px;
    margin: 0 0 16px 0;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    color: #AEAEB2;
  }
`;

export const ErrorDetails = styled.details`
  margin: 16px 0 24px 0;
  padding: 16px;
  background: #F2F2F7;
  border-radius: 8px;
  text-align: left;
  max-width: 100%;
  overflow: auto;

  summary {
    cursor: pointer;
    font-weight: 600;
    color: #007AFF;
    margin-bottom: 12px;
    outline: none;

    &:hover {
      text-decoration: underline;
    }

    &:focus {
      outline: 2px solid #007AFF;
      outline-offset: 2px;
      border-radius: 4px;
    }
  }

  pre {
    font-family: 'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.4;
    color: #666;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
    padding: 0;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    background: #2C2C2E;

    pre {
      color: #AEAEB2;
    }
  }
`;

export const ErrorActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 16px;

  ${ErrorContainer}[data-variant="minimal"] & {
    margin-bottom: 8px;
  }
`;

export const RetryButton = styled.button`
  background: #007AFF;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;

  &:hover {
    background: #0051D0;
    transform: translateY(-1px);
  }

  &:active {
    background: #003999;
    transform: translateY(0);
  }

  &:focus {
    outline: 2px solid #007AFF;
    outline-offset: 2px;
  }

  ${ErrorContainer}[data-variant="minimal"] & {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

export const ReportButton = styled.button`
  background: transparent;
  color: #007AFF;
  border: 2px solid #007AFF;
  border-radius: 8px;
  padding: 10px 22px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;

  &:hover {
    background: #007AFF;
    color: white;
    transform: translateY(-1px);
  }

  &:active {
    background: #0051D0;
    border-color: #0051D0;
    transform: translateY(0);
  }

  &:focus {
    outline: 2px solid #007AFF;
    outline-offset: 2px;
  }

  ${ErrorContainer}[data-variant="minimal"] & {
    padding: 6px 14px;
    font-size: 14px;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    color: #0A84FF;
    border-color: #0A84FF;

    &:hover {
      background: #0A84FF;
      color: #000;
    }
  }
`;

export const ErrorCode = styled.div`
  font-family: 'SF Mono', 'Monaco', 'Consolas', 'Courier New', monospace;
  font-size: 12px;
  color: #8E8E93;
  background: #F2F2F7;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #E5E5EA;
  user-select: all;
  cursor: text;

  ${ErrorContainer}[data-variant="minimal"] & {
    font-size: 11px;
    padding: 4px 8px;
  }

  small {
    font-size: 10px;
    color: #999;
    display: block;
    margin-top: 4px;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    background: #2C2C2E;
    border-color: #3A3A3C;
    color: #AEAEB2;

    small {
      color: #8E8E93;
    }
  }
`;

export const ReportStatus = styled.div`
  font-size: 14px;
  padding: 8px 12px;
  border-radius: 6px;
  text-align: center;
  margin: 12px 0;

  ${props => {
    switch (props.status) {
      case "reporting":
        return `
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        `;
      case "success":
        return `
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case "failed":
        return `
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      default:
        return `
          background-color: #e2e3e5;
          color: #6c757d;
          border: 1px solid #d6d8db;
        `;
    }
  }}

  ${ErrorContainer}[data-variant="minimal"] & {
    font-size: 12px;
    padding: 6px 10px;
    margin: 8px 0;
  }

  /* Dark mode support */
  @media (prefers-color-scheme: dark) {
    ${props => {
      switch (props.status) {
        case "reporting":
          return `
            background-color: #3d3a00;
            color: #f9e79f;
            border-color: #b7a612;
          `;
        case "success":
          return `
            background-color: #1b3a1f;
            color: #a9d3ab;
            border-color: #28a745;
          `;
        case "failed":
          return `
            background-color: #3a1b1f;
            color: #f5c6cb;
            border-color: #dc3545;
          `;
        default:
          return `
            background-color: #2c2c2e;
            color: #aeaeb2;
            border-color: #3a3a3c;
          `;
      }
    }}
  }
`;
