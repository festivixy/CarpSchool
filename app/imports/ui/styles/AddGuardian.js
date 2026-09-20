import styled from "styled-components";
import { btnBase, btnPrimary, inputBase } from "./tokens";

export const GuardianForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px 16px;
`;

export const GuardianNote = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-3);
`;

export const GuardianRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: stretch;

  @media (max-width: 420px) {
    flex-direction: column;
  }
`;

export const GuardianInput = styled.input`
  ${inputBase}
  flex: 1 1 auto;
  min-width: 0;
`;

export const GuardianButton = styled.button`
  ${btnBase}
  ${btnPrimary}
  flex: 0 0 auto;
`;

export const GuardianError = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--danger);
`;

export const GuardianDone = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--leaf);
`;
