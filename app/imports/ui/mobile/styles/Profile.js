import styled from "styled-components";
import { eyebrow, btnBase } from "../../styles/tokens";

export const Page = styled.div`
  min-height: 100vh;
  background: var(--cream-0);
  color: var(--ink-1);
  font-family: var(--font-ui);
  padding-bottom: 96px;
`;

export const Banner = styled.div`
  position: relative;
  background: var(--ink-1);
  color: var(--cream-0);
  padding: 44px 20px 28px;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 4px;
    background: var(--signal-yellow);
  }
`;

export const BannerInner = styled.div`
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const Identity = styled.div`
  min-width: 0;
`;

export const Name = styled.h1`
  margin: 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.02em;
`;

export const Email = styled.div`
  margin-top: 2px;
  font-size: 14px;
  color: rgba(246, 245, 240, 0.7);
`;

export const VerifiedChip = styled.span`
  ${eyebrow}
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  background: var(--leaf);
  color: #fff;
`;

export const Body = styled.div`
  max-width: 760px;
  margin: 0 auto;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const SectionTitle = styled.div`
  ${eyebrow}
  color: ${props => (props.$danger ? "var(--plum)" : "var(--ink-3)")};
`;

export const MenuList = styled.div`
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);
  overflow: hidden;
`;

export const MenuItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  border: 0;
  border-bottom: 1px solid var(--glass-stroke);
  background: transparent;
  cursor: pointer;
  text-align: left;
  font-family: var(--font-ui);
  font-size: 15px;
  color: ${props => (props.$danger ? "var(--plum)" : "var(--ink-1)")};

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }
`;

export const MenuItemIcon = styled.span`
  width: 22px;
  text-align: center;
  font-size: 18px;
`;

export const MenuItemLabel = styled.span`
  flex: 1;
`;

export const MenuArrow = styled.span`
  color: var(--ink-4);
  font-size: 18px;
`;

export const SignOutBtn = styled.button`
  ${btnBase}
  width: 100%;
  background: var(--ink-1);
  color: var(--cream-0);

  &:hover {
    background: #000;
  }
`;

export const Loading = styled.div`
  padding: 48px 20px;
  text-align: center;
  color: var(--ink-3);
`;
