import styled from "styled-components";

export const PrivacyContainer = styled.div`
  background-color: var(--cream-1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  border: 1px solid var(--cream-2);
`;

export const PrivacyTitle = styled.h4`
  margin: 0 0 16px 0;
  color: var(--ink-1);
  font-size: 16px;
  font-weight: 600;
`;

export const PrivacyOptions = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

export const PrivacyOption = styled.div`
  border: 2px solid var(--cream-2);
  border-radius: 12px;
  padding: 16px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  text-align: center;
  flex: 1;
  min-height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.disabled ? 0.6 : 1};
  border-color: ${(props) => (props.selected ? "var(--ink-2)" : "var(--cream-2)")};
  background-color: ${(props) => (props.selected ? "var(--ink-2)" : "white")};
  color: ${(props) => (props.selected ? "white" : "var(--ink-1)")};

  &:hover {
    border-color: ${props => props.disabled ? "var(--cream-2)" : "var(--ink-2)"};
    background-color: ${(props) => {
      if (props.disabled) return props.selected ? "var(--ink-2)" : "white";
      return props.selected ? "var(--ink-2)" : "var(--cream-1)";
    }};
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
  }

  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(0)'};
  }
`;

export const PrivacyIcon = styled.div`
  font-size: 28px;
  margin-bottom: 8px;
`;

export const PrivacyLabel = styled.div`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
`;

export const PrivacyDescription = styled.div`
  font-size: 12px;
  opacity: 0.9;
  line-height: 1.3;
`;

export const PrivacyNote = styled.div`
  font-size: 13px;
  color: var(--ink-3);
  line-height: 1.4;
  padding: 12px;
  background-color: rgba(102, 126, 234, 0.1);
  border-radius: 8px;
  border-left: 4px solid var(--ink-2);
`;
