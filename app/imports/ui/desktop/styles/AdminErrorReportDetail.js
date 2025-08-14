import styled from "styled-components";

// Base container and layout
export const Container = styled.div`
  background-color: rgba(255, 255, 255, 1);
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  margin: 0 auto;
  padding: 20px 0;
  min-height: 100vh;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 10px 0;
  }
`;

export const Header = styled.div`
  display: flex;
  max-width: 100%;
  flex-direction: column;
  font-size: 28px;
  color: rgba(0, 0, 0, 1);
  font-weight: 700;
  text-align: center;
  letter-spacing: -0.5px;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  width: 100%;

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 20px;
  }
`;

export const BackButtonWrapper = styled.div`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);

  @media (max-width: 768px) {
    left: 15px;
  }
`;

export const Title = styled.h1`
  margin: 20px 0 8px 0;
  color: rgba(0, 0, 0, 0.87);
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const TitleIcon = styled.span`
  font-size: 32px;
`;

export const Content = styled.div`
  max-width: 1000px;
  width: 100%;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 15px;
  }
`;

// Loading and error states
export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
`;

export const LoadingSpinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid rgba(225, 229, 233, 1);
  border-top: 4px solid rgba(102, 126, 234, 1);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.div`
  font-size: 16px;
  color: rgba(130, 130, 130, 1);
`;

export const NotFoundContainer = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: rgba(130, 130, 130, 1);
`;

export const NotFoundIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
`;

export const NotFoundTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: rgba(51, 51, 51, 1);
  margin: 0 0 16px 0;
`;

export const NotFoundText = styled.p`
  font-size: 16px;
  margin: 0 0 32px 0;
  line-height: 1.5;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

// Main content
export const ErrorReportContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Section = styled.div`
  background-color: white;
  border: 2px solid rgba(225, 229, 233, 1);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: rgba(51, 51, 51, 1);
  margin: 0;
  padding: 16px 20px;
  background-color: rgba(248, 249, 250, 1);
  border-bottom: 1px solid rgba(225, 229, 233, 1);
`;

export const SectionContent = styled.div`
  padding: 20px;
`;

export const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

export const MetadataGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
`;

export const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const InfoLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: rgba(130, 130, 130, 1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const InfoValue = styled.span`
  font-size: 14px;
  color: rgba(51, 51, 51, 1);
  word-break: break-word;
  line-height: 1.4;
  user-select: text;
  cursor: text;
`;

export const CodeBlock = styled.code`
  font-family: "SF Mono", "Monaco", "Consolas", monospace;
  background-color: rgba(248, 249, 250, 1);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid rgba(225, 229, 233, 1);
  font-size: 13px;
  user-select: text;
  cursor: text;
`;

export const BadgeContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const SeverityBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${props => props.color};
  color: white;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const CategoryBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  background-color: ${props => props.color};
  color: white;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ResolvedBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #28a745;
  color: white;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const ActionButton = styled.button`
  padding: 10px 20px;
  border: 2px solid ${props => props.color || "#6c757d"};
  border-radius: 8px;
  background-color: ${props => props.color || "#6c757d"};
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    opacity: 0.8;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Stack traces
export const StackTrace = styled.div`
  background-color: rgba(248, 249, 250, 1);
  border: 1px solid rgba(225, 229, 233, 1);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;

  pre {
    margin: 0;
    font-family: "SF Mono", "Monaco", "Consolas", monospace;
    font-size: 12px;
    line-height: 1.5;
    color: rgba(51, 51, 51, 1);
    white-space: pre-wrap;
    word-break: break-word;
    user-select: text;
    cursor: text;
  }
`;

export const ComponentStack = styled.div`
  background-color: rgba(248, 249, 250, 1);
  border: 1px solid rgba(225, 229, 233, 1);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;

  pre {
    margin: 0;
    font-family: "SF Mono", "Monaco", "Consolas", monospace;
    font-size: 12px;
    line-height: 1.5;
    color: rgba(51, 51, 51, 1);
    white-space: pre-wrap;
    word-break: break-word;
    user-select: text;
    cursor: text;
  }
`;

// JSON viewer
export const JsonViewer = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const JsonLabel = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: rgba(51, 51, 51, 1);
  margin: 0 0 8px 0;
`;

export const JsonContent = styled.div`
  background-color: rgba(248, 249, 250, 1);
  border: 1px solid rgba(225, 229, 233, 1);
  border-radius: 8px;
  padding: 16px;
  overflow-x: auto;

  pre {
    margin: 0;
    font-family: "SF Mono", "Monaco", "Consolas", monospace;
    font-size: 12px;
    line-height: 1.5;
    color: rgba(51, 51, 51, 1);
    white-space: pre-wrap;
    word-break: break-word;
    user-select: text;
    cursor: text;
  }
`;

// Admin notes
export const AdminNotes = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const NotesTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(225, 229, 233, 1);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: rgba(102, 126, 234, 1);
  }

  &::placeholder {
    color: rgba(130, 130, 130, 1);
  }
`;

export const SaveButton = styled.button`
  align-self: flex-start;
  padding: 8px 16px;
  border: 2px solid #28a745;
  border-radius: 6px;
  background-color: #28a745;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #218838;
    border-color: #218838;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;
