import styled from "styled-components";
import {
  btnBase,
  btnGhost,
  btnPrimary,
  chip,
  chipCoral,
  eyebrow,
} from "../../styles/tokens";

/* Profile — design handoff "ProfilePage".
 * Ink banner with a decorative map, an oversized overlapping avatar, a
 * five-card stat strip, then a 1.5fr / 1fr card grid. The account/admin/legal
 * menus below the grid are app-specific: this page is the only account hub
 * mobile users have, so they are kept rather than dropped for the design. */

export const Page = styled.div`
  min-height: 100vh;
  background: var(--cream-0);
  color: var(--ink-1);
  font-family: var(--font-ui);
  padding-bottom: 96px;
`;

export const Banner = styled.div`
  position: relative;
  height: 220px;
  background: var(--ink-1);
  overflow: hidden;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 14px;
    background: var(--signal-yellow);
  }

  @media (max-width: 720px) {
    height: 160px;
  }
`;

/* The stylized street map reads as an engraving on the ink field rather than
 * a picture: knocked back and inverted so light roads become dark lines. */
export const BannerMap = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0.25;
  filter: invert(0.9);
`;

export const Inner = styled.div`
  position: relative;
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 48px 40px;

  @media (max-width: 720px) {
    padding: 0 16px 24px;
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 22px;
  margin-top: -56px;
  margin-bottom: 28px;

  @media (max-width: 720px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    margin-top: -44px;
    margin-bottom: 22px;
  }
`;

/* 120px avatar + 6px paper border = the 132px disc in the design. */
export const AvatarFrame = styled.div`
  flex-shrink: 0;
  line-height: 0;
  border: 6px solid var(--cream-0);
  border-radius: 50%;
  box-shadow: 0 8px 24px -8px rgba(60, 40, 20, 0.18);
`;

export const HeaderMain = styled.div`
  flex: 1;
  min-width: 0;
  padding-bottom: 8px;
`;

export const NameRow = styled.div`
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 4px;
`;

export const Name = styled.h1`
  margin: 0;
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 700;
  letter-spacing: -0.015em;
  line-height: 1.1;

  @media (max-width: 720px) {
    font-size: 32px;
  }
`;

export const VerifiedChip = styled.span`
  ${chip}
  background: var(--leaf);
  color: #fff;
  border-color: transparent;
  cursor: default;

  &:hover {
    background: var(--leaf);
  }
`;

export const VerifyChip = styled.button`
  ${chip}
  ${chipCoral}
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 14px;
  font-size: 14px;
  color: var(--ink-3);
`;

export const MetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
`;

export const MetaSep = styled.span`
  color: var(--ink-4);
`;

export const Bio = styled.p`
  margin: 8px 0 0;
  max-width: 580px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-2);
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 720px) {
    width: 100%;
  }
`;

export const GhostBtn = styled.button`
  ${btnBase}
  ${btnGhost}
`;

export const PrimaryBtn = styled.button`
  ${btnBase}
  ${btnPrimary}
`;

export const StatStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
  margin-bottom: 32px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }

  @media (max-width: 560px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
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
  margin-top: 4px;
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  color: var(--ink-1);

  @media (max-width: 560px) {
    font-size: 22px;
  }
`;

export const StatUnit = styled.div`
  font-size: 11.5px;
  color: var(--ink-3);
`;

export const StatStar = styled.span`
  color: var(--amber);
`;

export const Columns = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 18px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Col = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const Card = styled.section`
  background: var(--cream-1);
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-xl);
  padding: 22px;

  @media (max-width: 720px) {
    padding: 18px;
  }
`;

export const CardHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 14px;
`;

export const CardTitle = styled.h3`
  margin: ${props => (props.$tight ? "0 0 6px" : "0 0 14px")};
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
  letter-spacing: -0.025em;

  ${CardHead} & {
    margin: 0;
  }
`;

export const CardFoot = styled.div`
  margin-top: 14px;
`;

export const LinkBtn = styled.button`
  padding: 0;
  border: 0;
  background: transparent;
  font-family: var(--font-ui);
  font-size: 12.5px;
  font-weight: 600;
  color: var(--signal-yellow-deep);
  cursor: pointer;

  &:hover {
    color: var(--ink-1);
  }
`;

export const PlaceGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const PlaceTile = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--glass-stroke);
  border-radius: 12px;
  background: #fff;
`;

export const PlaceIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: var(--r-md);
  background: var(--cream-2);
  color: ${props => props.$tint || "var(--ink-2)"};
`;

export const PlaceText = styled.div`
  min-width: 0;
`;

export const PlaceName = styled.div`
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

/* Places store a "lat,lng" pair and no street address, so the sub-line is
 * data — mono, per the type scale — not prose. */
export const PlaceSub = styled.div`
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const ReviewRow = styled.div`
  display: flex;
  gap: 12px;
`;

export const ReviewBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ReviewHead = styled.div`
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
`;

export const ReviewName = styled.div`
  font-size: 13.5px;
  font-weight: 600;
`;

export const Stars = styled.div`
  font-size: 11px;
  letter-spacing: 0.5px;
  color: var(--amber);
`;

export const Quote = styled.div`
  font-size: 13px;
  line-height: 1.4;
  color: var(--ink-2);
`;

export const PrefList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PrefRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13.5px;
`;

export const PrefLabel = styled.span`
  color: var(--ink-3);
`;

export const PrefValue = styled.span`
  font-weight: 500;
  text-align: right;
`;

/* Verified checklist */
export const CheckList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const CheckRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
`;

export const CheckMark = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => (props.$ok ? "var(--leaf)" : "var(--cream-2)")};
`;

export const CheckLabel = styled.div`
  font-size: 13.5px;
  font-weight: 500;
  flex: 1;
`;

export const CheckNote = styled.div`
  font-size: 11.5px;
  text-align: right;
  color: ${props => (props.$ok ? "var(--ink-3)" : "var(--signal-yellow-deep)")};
`;

export const Empty = styled.div`
  font-size: 13px;
  color: var(--ink-3);
`;

/* Account hub. Not in the design, but the only route to sign-out, delete
 * account, the admin links and the Persona identity flow on mobile. */
export const SettingsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 32px;
  scroll-margin-top: 92px;
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
  border-radius: var(--r-xl);
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

/* A fixed box so every label starts on the same vertical line, and the icon
 * inherits the row's ink rather than an emoji's own colour. */
export const MenuItemIcon = styled.span`
  width: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--ink-3);
`;

export const MenuItemLabel = styled.span`
  flex: 1;
`;

export const MenuArrow = styled.span`
  display: inline-flex;
  align-items: center;
  color: var(--ink-4);
`;

export const SignOutBtn = styled.button`
  ${btnBase}
  ${btnPrimary}
  width: 100%;
`;

export const Loading = styled.div`
  padding: 48px 20px;
  text-align: center;
  color: var(--ink-3);
`;
