import React from "react";
import PropTypes from "prop-types";
import {
  SkeletonContainer,
  SkeletonHeader,
  SkeletonTitle,
  SkeletonTitleIcon,
  SkeletonTitleText,
  SkeletonAddButton,
  SkeletonContent,
  SkeletonPlacesGrid,
  SkeletonPlaceCard,
  SkeletonPlaceHeader,
  SkeletonPlaceInfo,
  SkeletonPlaceName,
  SkeletonPlaceIcon,
  SkeletonPlaceNameText,
  SkeletonPlaceCoordinates,
  SkeletonPlaceDate,
  SkeletonPlaceCreator,
  SkeletonActionButtons,
  SkeletonActionButton,
  SkeletonPulse,
} from "../styles/PlaceManagerSkeleton";

/**
 * Skeleton loading component for PlaceManager page
 * Mimics the structure and layout of the actual PlaceManager component
 * with header, add button, and grid of place cards
 */
const PlaceManagerSkeleton = ({ numberOfPlaces = 6 }) => (
  <SkeletonContainer>
    {/* Header Skeleton */}
    <SkeletonHeader>
      <SkeletonTitle>
        <SkeletonTitleIcon>
          <SkeletonPulse />
        </SkeletonTitleIcon>
        <SkeletonTitleText>
          <SkeletonPulse />
        </SkeletonTitleText>
      </SkeletonTitle>
      <SkeletonAddButton>
        <SkeletonPulse />
      </SkeletonAddButton>
    </SkeletonHeader>

    {/* Content Skeleton */}
    <SkeletonContent>
      <SkeletonPlacesGrid>
        {Array.from({ length: numberOfPlaces }, (_, index) => (
          <SkeletonPlaceCard key={index}>
            <SkeletonPlaceHeader>
              <SkeletonPlaceInfo>
                {/* Place Name */}
                <SkeletonPlaceName>
                  <SkeletonPlaceIcon>
                    <SkeletonPulse />
                  </SkeletonPlaceIcon>
                  <SkeletonPlaceNameText>
                    <SkeletonPulse />
                  </SkeletonPlaceNameText>
                </SkeletonPlaceName>

                {/* Place Coordinates */}
                <SkeletonPlaceCoordinates>
                  <SkeletonPulse />
                </SkeletonPlaceCoordinates>

                {/* Place Date */}
                <SkeletonPlaceDate>
                  <SkeletonPulse />
                </SkeletonPlaceDate>

                {/* Place Creator */}
                <SkeletonPlaceCreator>
                  <SkeletonPulse />
                </SkeletonPlaceCreator>
              </SkeletonPlaceInfo>

              {/* Action Buttons */}
              <SkeletonActionButtons>
                <SkeletonActionButton>
                  <SkeletonPulse />
                </SkeletonActionButton>
                <SkeletonActionButton>
                  <SkeletonPulse />
                </SkeletonActionButton>
              </SkeletonActionButtons>
            </SkeletonPlaceHeader>
          </SkeletonPlaceCard>
        ))}
      </SkeletonPlacesGrid>
    </SkeletonContent>
  </SkeletonContainer>
);

PlaceManagerSkeleton.propTypes = {
  numberOfPlaces: PropTypes.number,
};

export default PlaceManagerSkeleton;
