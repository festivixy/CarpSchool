import React from "react";
import PropTypes from "prop-types";
import { MapWrap } from "../styles/MapBg";

/**
 * Decorative stylized street map (no live tiles). Used as a placeholder
 * backdrop behind pins/routes until the real tileserver map is wired in.
 */
const W = 1280;
const H = 800;

const buildLanes = () => {
  const lanes = [];
  [120, 220, 330, 460, 570, 680].forEach((y, i) => {
    lanes.push({
      d: `M -20 ${y} Q 320 ${y - 10 - i * 4} 640 ${y + (i % 2 ? 14 : -8)} T ${W + 20} ${y + i}`,
      w: i === 2 || i === 4 ? 9 : 4,
    });
  });
  [180, 360, 540, 720, 900, 1100].forEach((x, i) => {
    lanes.push({
      d: `M ${x} -20 Q ${x + (i % 2 ? 20 : -14)} 280 ${x + (i % 2 ? -30 : 18)} 520 T ${x} ${H + 20}`,
      w: i === 1 || i === 4 ? 8 : 3.5,
    });
  });
  lanes.push({ d: `M -40 720 Q 320 580 720 480 T ${W + 40} 280`, w: 14, hi: true });
  return lanes;
};

const buildings = Array.from({ length: 18 }).map((unused, i) => {
  const x = 40 + ((i * 137) % (W - 120));
  const y = 60 + ((i * 211) % 420);
  return {
    x,
    y,
    w: 30 + ((i * 17) % 50),
    h: 22 + ((i * 13) % 40),
    hidden: x > 160 && x < 420 && y > 160 && y < 360,
  };
});

const MapBg = ({ className, children }) => {
  const lanes = buildLanes();
  return (
    <MapWrap className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="map-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.8" fill="rgba(60, 40, 20, 0.07)" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="var(--map-land)" />
        <rect width={W} height={H} fill="url(#map-dots)" />
        <path
          d="M -40 540 C 200 480 480 620 760 540 S 1240 460 1320 520 L 1320 820 L -40 820 Z"
          fill="var(--map-water)"
          opacity="0.85"
        />
        <rect x="180" y="180" width="220" height="160" rx="22" fill="var(--map-park)" opacity="0.85" />
        <rect x="820" y="120" width="180" height="120" rx="18" fill="var(--map-park)" opacity="0.7" />
        <circle cx="1050" cy="380" r="80" fill="var(--map-park)" opacity="0.6" />
        {buildings.map((b, i) => (b.hidden ? null : (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} rx="3" fill="rgba(60, 40, 20, 0.07)" />
        )))}
        {lanes.map((l, i) => (
          <g key={i}>
            <path
              d={l.d}
              stroke="var(--map-stroke)"
              strokeWidth={l.w + 1.5}
              fill="none"
              strokeLinecap="round"
              opacity={l.hi ? 0.8 : 0.5}
            />
            <path d={l.d} stroke="var(--map-road)" strokeWidth={l.w} fill="none" strokeLinecap="round" />
          </g>
        ))}
      </svg>
      {children}
    </MapWrap>
  );
};

MapBg.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

MapBg.defaultProps = {
  className: undefined,
  children: null,
};

export default MapBg;
