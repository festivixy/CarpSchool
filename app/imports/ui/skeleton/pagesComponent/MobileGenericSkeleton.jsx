import React from "react";
import PropTypes from "prop-types";
import {
  SkeletonContainer,
  SkeletonTopBar,
  SkeletonBackButton,
  SkeletonTitle,
  SkeletonContent,
  SkeletonLine,
  SkeletonPulse,
} from "../styles/MobileGenericSkeleton";

/**
 * Generic mobile skeleton with top bar, back button, and content lines
 * Useful for simple mobile pages with text content
 */
const MobileGenericSkeleton = ({
  numberOfLines = 8,
  showBackButton = true,
  lineVariations = "default" // "default", "paragraph", "list"
}) => {
  const getLineWidths = () => {
    if (lineVariations === "paragraph") {
      // Paragraph-like pattern: varying line lengths with some short lines at paragraph ends
      return ["95%", "88%", "92%", "45%", "90%", "94%", "87%", "60%", "96%", "89%", "40%"];
    } else if (lineVariations === "list") {
      // List-like pattern: consistent but slightly varying widths
      return ["85%", "88%", "82%", "90%", "86%", "84%", "91%", "87%", "83%", "89%"];
    } else {
      // Default pattern: random-ish widths for general content
      return ["90%", "75%", "95%", "60%", "85%", "80%", "70%", "92%", "55%", "88%", "65%", "78%"];
    }
  };

  const lineWidths = getLineWidths();

  return (
    <SkeletonContainer>
      {/* Top Bar */}
      <SkeletonTopBar>
        {showBackButton && (
          <SkeletonBackButton>
            <SkeletonPulse />
          </SkeletonBackButton>
        )}
        <SkeletonTitle showBackButton={showBackButton}>
          <SkeletonPulse />
        </SkeletonTitle>
      </SkeletonTopBar>

      {/* Content Lines */}
      <SkeletonContent>
        {Array.from({ length: numberOfLines }).map((_, index) => (
          <SkeletonLine key={index} width={lineWidths[index % lineWidths.length]}>
            <SkeletonPulse />
          </SkeletonLine>
        ))}
      </SkeletonContent>
    </SkeletonContainer>
  );
};

MobileGenericSkeleton.propTypes = {
  numberOfLines: PropTypes.number,
  showBackButton: PropTypes.bool,
  lineVariations: PropTypes.oneOf(["default", "paragraph", "list"]),
};

export default MobileGenericSkeleton;
