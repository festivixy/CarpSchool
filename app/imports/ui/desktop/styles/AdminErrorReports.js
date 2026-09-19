import styled from "styled-components";

// Base container and layout
export const Container = styled.div`
  background-color: var(--cream-0);
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  font-family: var(--font-ui);
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

  @media (max-width: 768px) {
    font-size: 24px;
    margin-bottom: 20px;
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
  max-width: 1200px;
  width: 100%;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 768px) {
    padding: 0 15px;
    gap: 15px;
  }
`;

// Stats container
export const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

export const StatCard = styled.div`
  background: linear-gradient(135deg, var(--ink-2) 0%, var(--ink-1) 100%);
  border-radius: var(--r-md);
  padding: 20px;
  text-align: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

export const StatNumber = styled.div`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
`;

export const StatLabel = styled.div`
  font-size: 14px;
  opacity: 0.9;
  font-weight: 500;
`;

// Filters
export const FiltersContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
`;

export const FilterButton = styled.button`
  padding: 8px 16px;
  border: 2px solid ${props => (props.active ? "var(--ink-2)" : "var(--cream-2)")};
  border-radius: var(--r-md);
  background-color: ${props => (props.active ? "var(--ink-2)" : "white")};
  color: ${props => (props.active ? "white" : "var(--ink-1)")};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: var(--ink-2);
    background-color: ${props => (props.active ? "var(--sky)" : "var(--cream-1)")};
  }
`;

// Search
export const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 2px solid var(--cream-2);
  border-radius: var(--r-md);
  font-size: 16px;
  background-color: var(--cream-0);
  box-sizing: border-box;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--accent);
  }

  &::placeholder {
    color: var(--ink-3);
  }
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: var(--ink-3);
`;

export const SearchResultsCount = styled.div`
  text-align: center;
  font-size: 14px;
  color: var(--ink-3);
  margin: 10px 0 20px 0;
`;

// Loading states
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
  border: 4px solid var(--cream-2);
  border-top: 4px solid var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingText = styled.div`
  font-size: 16px;
  color: var(--ink-3);
`;

// Empty state
export const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--ink-3);
`;

export const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

export const EmptyStateTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: var(--ink-1);
  margin: 0 0 8px 0;
`;

export const EmptyStateText = styled.p`
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

// Error reports grid
export const ErrorReportsGrid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;

  @media (min-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

export const ErrorReportCard = styled.div`
  background-color: white;
  border: 2px solid ${props => (props.resolved ? "var(--leaf-soft)" : "var(--cream-2)")};
  border-radius: var(--r-md);
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  opacity: ${props => (props.resolved ? 0.7 : 1)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

export const ErrorReportHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

export const ErrorReportInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ErrorReportTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-1);
  margin: 0 0 8px 0;
  line-height: 1.4;
  word-break: break-word;
`;

export const ErrorReportId = styled.div`
  font-size: 12px;
  color: var(--ink-3);
  font-family: var(--font-mono);
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

export const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid ${props => props.color || "var(--ink-3)"};
  border-radius: var(--r-sm);
  background-color: ${props => props.color || "var(--ink-3)"};
  color: white;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease,
    box-shadow 0.2s ease;
  white-space: nowrap;

  &:hover {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ViewButton = styled.button`
  padding: 6px 12px;
  border: 2px solid var(--sky);
  border-radius: var(--r-sm);
  background-color: white;
  color: var(--sky);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease,
    box-shadow 0.2s ease;
  white-space: nowrap;

  &:hover {
    background-color: var(--sky);
    color: white;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const ErrorReportDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DetailLabel = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const DetailValue = styled.span`
  font-size: 14px;
  color: var(--ink-1);
  word-break: break-word;
`;

export const BadgeContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const SeverityBadge = styled.span`
  padding: 4px 8px;
  border-radius: var(--r-sm);
  background-color: ${props => props.color};
  color: white;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const CategoryBadge = styled.span`
  padding: 4px 8px;
  border-radius: var(--r-sm);
  background-color: ${props => props.color};
  color: white;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ResolvedBadge = styled.span`
  padding: 4px 8px;
  border-radius: var(--r-sm);
  background-color: var(--leaf);
  color: white;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;
