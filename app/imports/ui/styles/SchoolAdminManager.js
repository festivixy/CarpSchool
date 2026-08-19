import styled from "styled-components";

export const Container = styled.div`
  background: var(--cream-0);
  border-radius: 16px;
  padding: 24px;
  margin-top: 32px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--cream-2);
`;

export const Header = styled.div`
  margin-bottom: 24px;
`;

export const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--ink-1);
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;

  &::before {
    content: "👑";
    font-size: 28px;
  }
`;

export const Subtitle = styled.p`
  color: var(--ink-3);
  font-size: 16px;
  margin: 0;
  line-height: 1.5;
`;

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const SearchSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid var(--cream-3);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--leaf);
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }

  &::placeholder {
    color: var(--ink-4);
  }
`;

export const SearchButton = styled.button`
  background: var(--leaf);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: var(--leaf);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const SchoolSelector = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    font-weight: 600;
    color: var(--ink-1);
  }

  select {
    padding: 12px 16px;
    border: 1px solid var(--cream-3);
    border-radius: 8px;
    font-size: 16px;
    background: white;
    cursor: pointer;

    &:focus {
      outline: none;
      border-color: var(--leaf);
      box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
    }
  }
`;

export const SchoolOption = styled.option`
  padding: 8px;
`;

export const FilterSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 20px;
  background: var(--cream-1);
  border-radius: 12px;
  border: 1px solid var(--cream-2);
`;

export const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const FilterLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid var(--cream-3);
  border-radius: 6px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--leaf);
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
  }

  &:hover {
    border-color: var(--cream-3);
  }
`;

export const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const UserCard = styled.div`
  background: var(--cream-1);
  border: 1px solid var(--cream-2);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

export const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const UserEmail = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-1);
  font-family: monospace;
`;

export const UserSchool = styled.div`
  font-size: 14px;
  color: var(--ink-3);
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const UserRoles = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  span {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;

    &.system-admin {
      background: var(--signal-yellow-soft);
      color: var(--ink-2);
    }

    &.school-admin {
      background: var(--signal-yellow-soft);
      color: var(--ink-2);
    }

    &.regular-user {
      background: var(--cream-2);
      color: var(--ink-2);
    }
  }
`;

export const Actions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

export const AddAdminButton = styled.button`
  background: var(--leaf);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: var(--leaf);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const RemoveAdminButton = styled.button`
  background: var(--danger);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: var(--danger-deep);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

export const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  color: var(--ink-3);
  font-size: 16px;

  div {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  &::before {
    content: "";
    width: 20px;
    height: 20px;
    border: 2px solid var(--cream-2);
    border-top: 2px solid var(--leaf);
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--ink-3);

  div {
    font-size: 48px;
    margin-bottom: 16px;
  }

  h3 {
    color: var(--ink-1);
    font-size: 20px;
    margin: 0 0 8px 0;
  }

  p {
    font-size: 16px;
    margin: 0;
    line-height: 1.5;
  }
`;

export const ErrorMessage = styled.div`
  background: var(--danger-soft);
  color: var(--danger-deep);
  border: 1px solid var(--danger-soft);
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  border-left: 4px solid var(--danger);
`;

export const SuccessMessage = styled.div`
  background: var(--leaf-soft);
  color: var(--leaf);
  border: 1px solid var(--leaf-soft);
  border-radius: 8px;
  padding: 16px;
  font-size: 14px;
  border-left: 4px solid var(--leaf);
`;
