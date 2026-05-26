import styled from "styled-components";
import { eyebrow, inputBase } from "../../styles/tokens";

const BREAK = "900px";

export const Screen = styled.div`
  display: grid;
  grid-template-columns: 1fr 440px;
  min-height: calc(100vh - 64px);
  background: var(--cream-0);

  @media (max-width: ${BREAK}) {
    grid-template-columns: 1fr;
  }
`;

export const MapPane = styled.div`
  position: relative;
  overflow: hidden;

  @media (max-width: ${BREAK}) {
    height: 240px;
  }
`;

export const ListPane = styled.div`
  display: flex;
  flex-direction: column;
  background: var(--cream-0);
  border-left: 1px solid var(--glass-stroke);

  @media (max-width: ${BREAK}) {
    border-left: 0;
  }
`;

export const SearchPanel = styled.div`
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 20;
  width: min(360px, calc(100% - 32px));
  padding: 10px;
  border-radius: var(--r-xl);
`;

export const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 6px;
`;

export const SearchInput = styled.input`
  ${inputBase}
  border: 0;
  background: transparent;
  padding: 6px 0;

  &:focus {
    box-shadow: none;
    background: transparent;
  }
`;

export const MapControls = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 6px;
  border-radius: var(--r-lg);
`;

export const ControlBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: var(--r-md);
  background: transparent;
  color: var(--ink-1);
  font-size: 18px;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.6);
  }
`;

export const ListHeader = styled.div`
  padding: 24px 24px 16px;
`;

export const Eyebrow = styled.div`
  ${eyebrow}
`;

export const TitleRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 4px;
  gap: 12px;
`;

export const ListTitle = styled.h2`
  margin: 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

export const SortBtn = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-1);
`;

export const RidesScroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 24px 32px;
  overflow-y: auto;
`;

export const EmptyState = styled.div`
  padding: 32px 24px;
  color: var(--ink-3);
  font-size: 14px;
  line-height: 1.5;
`;
