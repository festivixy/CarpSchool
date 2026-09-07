import styled, { css } from "styled-components";

export const MapShell = styled.div`
  position: relative;
  overflow: hidden;
  background: var(--cream-1, #f0ece3);

  /* $fill: take the height of whatever contains it, and drop the card framing,
   * for hosts like discovery whose pane is already a definite full-height box.
   * Without this the map keeps its own fixed height and leaves the rest of the
   * pane blank. */
  ${props => (props.$fill
    ? css`
        height: 100%;
        display: flex;
        flex-direction: column;
      `
    : css`
        border-radius: var(--r-lg, 14px);
        border: 1px solid var(--cream-3, #ddd6c8);
      `)}
`;

/*
 * Leaflet needs a resolved height on its container. A percentage would compute
 * to zero here, because the shell's height comes from this element rather than
 * the other way round, so the height is set explicitly.
 */
export const MapCanvas = styled.div`
  position: relative;
  width: 100%;

  ${props => (props.$fill
    ? css`
        flex: 1;
        min-height: 0;
      `
    : css`
        height: ${props.$height || 340}px;
      `)}

  /* Leaflet's own panes sit at z-index 400-800 and would otherwise paint over
   * the page's navigation. */
  z-index: 0;
  isolation: isolate;

  /* Absolute, not height:100%. When this box takes its height from a flex
   * parent its computed height can still read as auto, against which a
   * percentage height resolves to zero and collapses the map. */
  .leaflet-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: var(--cream-1, #f0ece3);
    font-family: var(--font-ui, inherit);
    cursor: default;
  }

  /* Only in add-waypoint mode does clicking the map do anything; the cursor
   * says so. */
  &[data-add-mode="true"] .leaflet-container {
    cursor: crosshair;
  }

  /* Markers stay a pointer: only empty map creates a waypoint. */
  .leaflet-marker-icon {
    cursor: pointer;
  }
`;

export const Bar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  background: var(--cream-0, #faf7f0);
  border-bottom: 1px solid var(--cream-3, #ddd6c8);
  font-size: 13px;
  color: var(--ink-2, #5b5750);
`;

export const BarHint = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const Count = styled.strong`
  color: var(--ink-1, #1a1815);
  font-weight: 600;
`;

export const BarButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: var(--r-pill, 999px);
  border: 1px solid var(--cream-3, #ddd6c8);
  background: ${props => (props.$active ? "var(--ink-1, #1a1815)" : "var(--cream-0, #faf7f0)")};
  color: ${props => (props.$active ? "var(--cream-0, #faf7f0)" : "var(--ink-1, #1a1815)")};
  font-size: 12.5px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    border-color: var(--ink-3, #8a857c);
  }
`;

export const EmptyNote = styled.div`
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  z-index: 500;
  padding: 8px 14px;
  border-radius: var(--r-pill, 999px);
  background: var(--ink-1, #1a1815);
  color: var(--cream-0, #faf7f0);
  font-size: 12.5px;
  font-weight: 500;
  pointer-events: none;
  white-space: nowrap;
`;
