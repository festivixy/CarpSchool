import styled from "styled-components";

/* Fills its parent. This was a fixed 376x272 box, which meant the map could
 * never fill a full-bleed pane; callers that want a fixed size set it
 * themselves. Leaflet requires a container with a resolved height. */
export const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  min-height: 240px;
  flex-shrink: 0;
  background: var(--cream-1);
  position: relative;
  overflow: hidden;

  /* Leaflet's internal panes run to z-index 800 (markers 600, popups 700,
   * controls 800), which paints straight over the floating nav and the glass
   * overlays. Making this a stacking context traps those values inside the
   * map, so any sibling with z-index >= 1 still sits on top. */
  z-index: 0;
  isolation: isolate;

  /* Absolute, not height:100%. The wrapper often gets its size from
   * min-height, leaving its computed height auto — a percentage height then
   * resolves against an indefinite value and collapses the map to 0. */
  .leaflet-container {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: var(--map-bg);
  }
`;

export const MapImage = styled.img`
  width: 376px;
  height: 320px;
  flex-shrink: 0;
  position: absolute;
  left: 0px;
  top: 0px;
  object-fit: cover;
`;

export const PriceChip = styled.div`
  display: inline-flex;
  min-height: 28px;
  padding: 8px 12px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  border-radius: 24px;
  position: absolute;

  ${(props) => (props.selected
      ? `
    background: rgba(0, 0, 0, 0.8999999761581421);
  `
      : `
    background: var(--cream-0);
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.08);
  `)}
`;

export const PriceText = styled.div`
  text-align: center;
  font-family: var(--font-ui);
  font-size: 13px;
  font-style: normal;
  font-weight: 400;
  line-height: 135%;
  position: relative;

  ${(props) => (props.selected
      ? `
    color: #FFF;
  `
      : `
    color: var(--ink-1);
  `)}
`;
