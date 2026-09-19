import styled from "styled-components";

export const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--cream-1);
  min-height: 100vh;
`;

export const Header = styled.div`
  margin-bottom: 32px;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--ink-1);
`;

export const Section = styled.div`
  background: white;
  border-radius: var(--r-md);
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

export const SectionTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ink-1);
  display: flex;
  align-items: center;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

export const StatCard = styled.div`
  background: linear-gradient(135deg, var(--ink-2) 0%, var(--ink-1) 100%);
  color: white;
  padding: 20px;
  border-radius: var(--r-md);
  text-align: center;
`;

export const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
`;

export const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const FormSection = styled.div`
  border: 1px solid var(--cream-2);
  border-radius: var(--r-md);
  padding: 20px;
  background-color: var(--cream-1);
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--ink-1);
  font-size: 14px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--cream-3);
  border-radius: var(--r-sm);
  font-size: 14px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--sky);
    box-shadow: 0 0 0 4px var(--accent-soft);
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--cream-3);
  border-radius: var(--r-sm);
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--sky);
    box-shadow: 0 0 0 4px var(--accent-soft);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--cream-3);
  border-radius: var(--r-sm);
  font-size: 14px;
  background-color: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--sky);
    box-shadow: 0 0 0 4px var(--accent-soft);
  }
`;

export const Button = styled.button`
  background-color: var(--sky);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: var(--r-sm);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover:not(:disabled) {
    background-color: var(--sky);
    transform: translateY(-1px);
  }

  &:disabled {
    background-color: var(--cream-3);
    cursor: not-allowed;
    transform: none;
  }
`;

export const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const NotificationList = styled.div`
  border: 1px solid var(--cream-2);
  border-radius: var(--r-md);
  overflow: hidden;
`;

export const NotificationItem = styled.div`
  border-bottom: 1px solid var(--cream-2);
  
  &:last-child {
    border-bottom: none;
  }
`;

export const NotificationContent = styled.div`
  padding: 16px;
  
  &:hover {
    background-color: var(--cream-1);
  }
`;

export const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: var(--r-sm);
  font-size: 11px;
  font-weight: 500;
  text-transform: uppercase;
  color: white;
  background-color: ${props => props.color || "var(--ink-4)"};
`;

export const ErrorMessage = styled.div`
  background-color: var(--signal-yellow-soft);
  border: 1px solid var(--amber);
  color: var(--amber);
  padding: 12px 16px;
  border-radius: var(--r-sm);
  margin-bottom: 20px;
  font-size: 14px;
`;

export const SuccessMessage = styled.div`
  background-color: var(--leaf-soft);
  border: 1px solid var(--leaf);
  color: var(--leaf);
  padding: 12px 16px;
  border-radius: var(--r-sm);
  margin-bottom: 20px;
  font-size: 14px;
`;
