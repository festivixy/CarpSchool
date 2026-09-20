import styled from "styled-components";

/**
 * The frame every admin screen sits in: the ink rail on the left, and the
 * pane its content scrolls in.
 *
 * These used to live in AdminOverview's style file, which is how the sidebar
 * came to exist on exactly one of the nine admin routes. They describe the
 * admin area, not the dashboard, so they live apart from both.
 */

export const Shell = styled.div`
  display: grid;
  grid-template-columns: 256px 1fr;
  min-height: calc(100vh - var(--nav-h));
  background: var(--cream-0);
  color: var(--ink-1);
  font-family: var(--font-ui);

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

export const Sidebar = styled.aside`
  position: sticky;
  top: 0;
  align-self: start;
  /* align-self: start sizes the rail to its own content, which left a dark
   * block hanging in the middle of the page. It fills the viewport instead --
   * less the nav above it, or the rail overhangs the bottom and takes the
   * account card with it. */
  height: calc(100vh - var(--nav-h));
  max-height: calc(100vh - var(--nav-h));
  overflow-y: auto;
  background: var(--ink-1);
  color: var(--cream-0);
  padding: 22px 14px;
  display: flex;
  flex-direction: column;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 820px) {
    position: static;
    height: auto;
    max-height: none;
    flex-direction: row;
    align-items: center;
    overflow-x: auto;
    padding: 12px;
  }
`;

export const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);

  @media (max-width: 820px) {
    padding: 0 12px 0 4px;
    border-bottom: 0;
    border-right: 1px solid rgba(255, 255, 255, 0.06);
  }
`;

export const Tag = styled.span`
  font-family: var(--font-mono);
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.18em;
  padding: 3px 7px;
  border-radius: var(--r-sm);
  background: var(--signal-yellow);
  color: var(--on-accent);
`;

export const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 14px;
  flex: 1;

  @media (max-width: 820px) {
    flex-direction: row;
    margin-top: 0;
    margin-left: 10px;
  }
`;

export const NavItem = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  width: 100%;
  text-align: left;
  padding: 9px 11px;
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 13.5px;
  font-weight: 500;
  white-space: nowrap;
  background: ${props => (props.$active ? "rgba(127, 176, 206, 0.14)" : "transparent")};
  color: ${props => (props.$active ? "var(--accent-on-dark)" : "rgba(226, 223, 213, 0.82)")};
  transition: background 0.12s ease, color 0.12s ease;

  &:hover {
    background: ${props => (props.$active ? "rgba(127, 176, 206, 0.22)" : "rgba(255, 255, 255, 0.06)")};
  }

  @media (max-width: 820px) {
    width: auto;
  }
`;

/* Yellow rail in the sidebar gutter, not a border on the item itself. */
export const Rail = styled.span`
  position: absolute;
  left: -14px;
  top: 8px;
  bottom: 8px;
  width: 3px;
  border-radius: 2px;
  background: var(--signal-yellow);

  @media (max-width: 820px) {
    display: none;
  }
`;

export const NavLabel = styled.span`
  flex: 1;
`;

export const Badge = styled.span`
  position: relative;
  font-family: var(--font-mono);
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: var(--r-pill);
  background: ${props => {
    if (props.$danger) return "var(--danger)";
    if (props.$pulse) return "var(--signal-yellow)";
    return "rgba(255, 255, 255, 0.08)";
  }};
  color: ${props => {
    if (props.$danger) return "#fff";
    if (props.$pulse) return "var(--ink-1)";
    return "rgba(200, 197, 187, 0.9)";
  }};
`;

export const BadgePulse = styled.span`
  position: absolute;
  inset: 0;
  border-radius: var(--r-pill);
  background: var(--accent-on-dark);
  color: var(--accent-on-dark);
  opacity: 0.4;
`;

export const AccountCard = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-radius: var(--r-md);
  background: rgba(255, 255, 255, 0.04);

  @media (max-width: 820px) {
    margin-left: auto;
    flex-shrink: 0;
  }
`;

export const AccountText = styled.div`
  flex: 1;
  min-width: 0;
`;

export const AccountName = styled.div`
  font-size: 12.5px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AccountSub = styled.div`
  font-size: 10.5px;
  color: rgba(200, 197, 187, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AccountBtn = styled.button`
  border: 0;
  background: transparent;
  color: rgba(200, 197, 187, 0.85);
  padding: 0;
  cursor: pointer;
  display: inline-flex;

  &:hover {
    color: var(--accent-on-dark);
  }
`;

export const Main = styled.main`
  min-width: 0;
  display: flex;
  flex-direction: column;
`;
