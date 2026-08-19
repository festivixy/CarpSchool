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

/* Design handoff: stat strip under the identity block. The handoff shows five
 * cards; RATING and STREAK are omitted because the app has no ratings or
 * streak data model to back them, and inventing numbers here would be worse
 * than leaving them out. */
export const StatStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
  margin-bottom: 8px;

  @media (max-width: 560px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
`;

export const StatCard = styled.div`
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-lg);
  padding: 14px;
`;

export const StatLabel = styled.div`
  ${eyebrow}
`;

export const StatValue = styled.div`
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  margin-top: 4px;
  color: ${props => props.$accent || "var(--ink-1)"};

  @media (max-width: 560px) {
    font-size: 22px;
  }
`;

export const StatUnit = styled.div`
  font-size: 11.5px;
  color: var(--ink-3);
`;

/* Verified checklist */
export const CheckRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
`;

export const CheckMark = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--cream-0);
  background: ${props => (props.$ok ? "var(--leaf)" : "var(--cream-2)")};
`;

export const CheckLabel = styled.div`
  font-size: 13.5px;
  font-weight: 500;
  flex: 1;
`;

export const CheckNote = styled.div`
  font-size: 11.5px;
  color: ${props => (props.$ok ? "var(--ink-3)" : "var(--signal-yellow-deep)")};
`;
