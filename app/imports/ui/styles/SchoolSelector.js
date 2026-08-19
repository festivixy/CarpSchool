import styled from "styled-components";

export const SelectorContainer = styled.div`
  background-color: var(--cream-0);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 480px) {
    padding: 20px;
    margin: 10px;
    border-radius: 8px;
  }
`;

export const SelectorHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

export const SelectorTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--ink-1);
  margin: 0 0 8px 0;

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

export const SelectorSubtitle = styled.p`
  font-size: 16px;
  color: var(--ink-3);
  margin: 0;
  line-height: 1.5;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid var(--cream-2);
  border-radius: 8px;
  font-size: 16px;
  margin-bottom: 16px;
  box-sizing: border-box;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--ink-2);
  }

  &::placeholder {
    color: var(--ink-4);
  }

  @media (max-width: 480px) {
    font-size: 16px; // Prevent zoom on iOS
  }
`;

export const SchoolsList = styled.div`
  max-height: 400px;
  overflow-y: auto;
  border: 1px solid var(--cream-2);
  border-radius: 8px;
  background-color: var(--cream-1);
`;

export const SchoolItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--cream-2);
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => (props.selected ? "var(--ink-2)" : "var(--cream-0)")};
  color: ${props => (props.selected ? "var(--cream-0)" : "var(--ink-1)")};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${props => (props.selected ? "var(--sky)" : "var(--cream-1)")};
    transform: translateY(-1px);
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

export const SchoolInfo = styled.div`
  flex: 1;
`;

export const SchoolName = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;

  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

export const SchoolLocation = styled.div`
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 2px;
`;

export const SchoolCode = styled.div`
  background-color: ${props => (props.theme?.selected ? "rgba(255, 255, 255, 0.2)" : "var(--cream-1)")};
  color: ${props => (props.theme?.selected ? "var(--cream-0)" : "var(--ink-3)")};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

export const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  font-size: 16px;
  color: var(--ink-3);
`;

export const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  text-align: center;
  font-size: 16px;
  color: var(--danger);
  background-color: var(--danger-soft);
  border-radius: 8px;
  border: 1px solid var(--danger-soft);
`;
