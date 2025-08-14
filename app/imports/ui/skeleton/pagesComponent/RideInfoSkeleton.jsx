import React from "react";
import PropTypes from "prop-types";
import {
  SkeletonContainer,
  SkeletonMapSection,
  SkeletonMapPlaceholder,
  SkeletonRideInfoSection,
  SkeletonRideInfoContainer,
  SkeletonBackButton,
  SkeletonRideHeader,
  SkeletonRouteDisplay,
  SkeletonRouteItem,
  SkeletonRouteLabel,
  SkeletonRouteLocation,
  SkeletonRouteArrow,
  SkeletonStatusBadge,
  SkeletonRideDetails,
  SkeletonDetailRow,
  SkeletonDetailLabel,
  SkeletonDetailValue,
  SkeletonNotesSection,
  SkeletonNotesLabel,
  SkeletonNotesText,
  SkeletonNavbarClearance,
  SkeletonPulse,
} from "../styles/RideInfoSkeleton";

/**
 * Skeleton loading component for RideInfo page
 * Mimics the structure: 50% map, 40% ride info, 10% navbar clearance
 */
const RideInfoSkeleton = ({ showBackButton = true }) => (
    <SkeletonContainer>
      {/* Back Button */}
      {showBackButton && (
        <SkeletonBackButton>
          <SkeletonPulse />
        </SkeletonBackButton>
      )}

      {/* Map Section - 50% */}
      <SkeletonMapSection>
        <SkeletonMapPlaceholder>
          <SkeletonPulse />
        </SkeletonMapPlaceholder>
      </SkeletonMapSection>

      {/* Ride Info Section - 40% */}
      <SkeletonRideInfoSection>
        <SkeletonRideInfoContainer>
          {/* Route Header */}
          <SkeletonRideHeader>
            <SkeletonRouteDisplay>
              <SkeletonRouteItem>
                <SkeletonRouteLabel>
                  <SkeletonPulse />
                </SkeletonRouteLabel>
                <SkeletonRouteLocation>
                  <SkeletonPulse />
                </SkeletonRouteLocation>
              </SkeletonRouteItem>

              <SkeletonRouteArrow>
                <SkeletonPulse />
              </SkeletonRouteArrow>

              <SkeletonRouteItem>
                <SkeletonRouteLabel>
                  <SkeletonPulse />
                </SkeletonRouteLabel>
                <SkeletonRouteLocation>
                  <SkeletonPulse />
                </SkeletonRouteLocation>
              </SkeletonRouteItem>
            </SkeletonRouteDisplay>

            <SkeletonStatusBadge>
              <SkeletonPulse />
            </SkeletonStatusBadge>
          </SkeletonRideHeader>

          {/* Ride Details */}
          <SkeletonRideDetails>
            <SkeletonDetailRow>
              <SkeletonDetailLabel>
                <SkeletonPulse />
              </SkeletonDetailLabel>
              <SkeletonDetailValue>
                <SkeletonPulse />
              </SkeletonDetailValue>
            </SkeletonDetailRow>

            <SkeletonDetailRow>
              <SkeletonDetailLabel>
                <SkeletonPulse />
              </SkeletonDetailLabel>
              <SkeletonDetailValue>
                <SkeletonPulse />
              </SkeletonDetailValue>
            </SkeletonDetailRow>

            <SkeletonDetailRow>
              <SkeletonDetailLabel>
                <SkeletonPulse />
              </SkeletonDetailLabel>
              <SkeletonDetailValue>
                <SkeletonPulse />
              </SkeletonDetailValue>
            </SkeletonDetailRow>

            <SkeletonDetailRow>
              <SkeletonDetailLabel>
                <SkeletonPulse />
              </SkeletonDetailLabel>
              <SkeletonDetailValue>
                <SkeletonPulse />
              </SkeletonDetailValue>
            </SkeletonDetailRow>
          </SkeletonRideDetails>

          {/* Notes Section */}
          <SkeletonNotesSection>
            <SkeletonNotesLabel>
              <SkeletonPulse />
            </SkeletonNotesLabel>
            <SkeletonNotesText>
              <SkeletonPulse />
            </SkeletonNotesText>
          </SkeletonNotesSection>
        </SkeletonRideInfoContainer>
      </SkeletonRideInfoSection>

      {/* Navbar Clearance - 10% */}
      <SkeletonNavbarClearance>
        <SkeletonPulse />
      </SkeletonNavbarClearance>
    </SkeletonContainer>
  );

RideInfoSkeleton.propTypes = {
  showBackButton: PropTypes.bool,
};

export default RideInfoSkeleton;
