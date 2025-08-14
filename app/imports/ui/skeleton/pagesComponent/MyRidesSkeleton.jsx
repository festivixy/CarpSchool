import React from "react";
import PropTypes from "prop-types";
import {
  SkeletonContainer,
  SkeletonHeader,
  SkeletonTitle,
  SkeletonSubtitle,
  SkeletonTabsContainer,
  SkeletonTab,
  SkeletonSearchSection,
  SkeletonSearchContainer,
  SkeletonSearchInput,
  SkeletonTabContent,
  SkeletonSummary,
  SkeletonRidesContainer,
  SkeletonRideCard,
  SkeletonRideHeader,
  SkeletonRoute,
  SkeletonRouteItem,
  SkeletonRouteLocation,
  SkeletonRouteArrow,
  SkeletonStatus,
  SkeletonDetails,
  SkeletonDetailItem,
  SkeletonDetailIcon,
  SkeletonDetailText,
  SkeletonActions,
  SkeletonActionButton,
  SkeletonPulse,
} from "../styles/MyRidesSkeleton";

/**
 * Skeleton loading component for MyRides page
 * Mimics the structure and layout of the actual MyRides component
 */
const MyRidesSkeleton = ({ numberOfRides = 3 }) => (
    <SkeletonContainer>
      {/* Header Skeleton */}
      <SkeletonHeader>
        <SkeletonTitle>
          <SkeletonPulse />
        </SkeletonTitle>
        <SkeletonSubtitle>
          <SkeletonPulse />
        </SkeletonSubtitle>
      </SkeletonHeader>

      {/* Tabs Skeleton */}
      <SkeletonTabsContainer>
        <SkeletonTab active>
          <SkeletonPulse />
        </SkeletonTab>
        <SkeletonTab>
          <SkeletonPulse />
        </SkeletonTab>
      </SkeletonTabsContainer>

      {/* Search Section Skeleton */}
      <SkeletonSearchSection>
        <SkeletonSearchContainer>
          <SkeletonSearchInput>
            <SkeletonPulse />
          </SkeletonSearchInput>
        </SkeletonSearchContainer>
      </SkeletonSearchSection>

      {/* Tab Content Skeleton */}
      <SkeletonTabContent>
        {/* Summary Skeleton */}
        <SkeletonSummary>
          <SkeletonPulse />
        </SkeletonSummary>

        {/* Rides Container Skeleton */}
        <SkeletonRidesContainer>
          {Array.from({ length: numberOfRides }).map((_, index) => (
            <SkeletonRideCard key={index}>
              {/* Ride Header */}
              <SkeletonRideHeader>
                <SkeletonPulse />
              </SkeletonRideHeader>

              {/* Route Section */}
              <SkeletonRoute>
                <SkeletonRouteItem>
                  <SkeletonRouteLocation>
                    <SkeletonPulse />
                  </SkeletonRouteLocation>
                </SkeletonRouteItem>
                <SkeletonRouteArrow>
                  <SkeletonPulse />
                </SkeletonRouteArrow>
                <SkeletonRouteItem>
                  <SkeletonRouteLocation>
                    <SkeletonPulse />
                  </SkeletonRouteLocation>
                </SkeletonRouteItem>
              </SkeletonRoute>

              {/* Status */}
              <SkeletonStatus>
                <SkeletonPulse />
              </SkeletonStatus>

              {/* Details Section */}
              <SkeletonDetails>
                <SkeletonDetailItem>
                  <SkeletonDetailIcon>
                    <SkeletonPulse />
                  </SkeletonDetailIcon>
                  <SkeletonDetailText>
                    <SkeletonPulse />
                  </SkeletonDetailText>
                </SkeletonDetailItem>
                <SkeletonDetailItem>
                  <SkeletonDetailIcon>
                    <SkeletonPulse />
                  </SkeletonDetailIcon>
                  <SkeletonDetailText>
                    <SkeletonPulse />
                  </SkeletonDetailText>
                </SkeletonDetailItem>
                <SkeletonDetailItem>
                  <SkeletonDetailIcon>
                    <SkeletonPulse />
                  </SkeletonDetailIcon>
                  <SkeletonDetailText>
                    <SkeletonPulse />
                  </SkeletonDetailText>
                </SkeletonDetailItem>
              </SkeletonDetails>

              {/* Actions */}
              <SkeletonActions>
                <SkeletonActionButton>
                  <SkeletonPulse />
                </SkeletonActionButton>
                <SkeletonActionButton>
                  <SkeletonPulse />
                </SkeletonActionButton>
                <SkeletonActionButton>
                  <SkeletonPulse />
                </SkeletonActionButton>
              </SkeletonActions>
            </SkeletonRideCard>
          ))}
        </SkeletonRidesContainer>
      </SkeletonTabContent>
    </SkeletonContainer>
  );

MyRidesSkeleton.propTypes = {
  numberOfRides: PropTypes.number,
};

export default MyRidesSkeleton;
