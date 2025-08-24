import React, { memo, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import Ride from "./Ride";
import { isAdminRole } from "../desktop/components/NavBarRoleUtils";

/**
 * Optimized Ride Card wrapper component with memoization
 * Prevents unnecessary re-renders when ride data hasn't changed
 */
const OptimizedRideCard = memo(({
  ride,
  rideSession,
  currentUser,
  onAction,
  places,
  users,
  ...props
}) => {
  // Memoize ride status calculation
  const rideStatus = useMemo(() => {
    const now = new Date();
    const rideDate = new Date(ride.date);

    if (rideSession) {
      return {
        type: 'session',
        status: rideSession.status,
        isActive: rideSession.status === 'active',
        isCompleted: rideSession.status === 'completed',
      };
    }

    if (rideDate < now) {
      return {
        type: 'past',
        status: 'missed',
        isActive: false,
        isCompleted: false,
      };
    }

    return {
      type: 'upcoming',
      status: 'scheduled',
      isActive: false,
      isCompleted: false,
    };
  }, [ride.date, rideSession]);

  // Memoize user role
  const userRole = useMemo(() => ({
    isDriver: ride.driver === currentUser?._id,
    isRider: ride.riders?.includes(currentUser?._id),
    isAdmin: isAdminRole(currentUser),
  }), [ride.driver, ride.riders, currentUser]);

  // Memoize action callback to prevent child re-renders
  const handleAction = useCallback((action, data) => {
    if (onAction) {
      onAction(ride._id, action, data);
    }
  }, [onAction, ride._id]);

  // Memoize places data
  const ridePlaces = useMemo(() => {
    if (!places) return null;

    const originPlace = places.find(place => place._id === ride.origin);
    const destinationPlace = places.find(place => place._id === ride.destination);

    return {
      origin: originPlace,
      destination: destinationPlace,
    };
  }, [places, ride.origin, ride.destination]);

  return (
    <Ride
      ride={ride}
      rideSession={rideSession}
      currentUser={currentUser}
      places={places}
      users={users}
      rideStatus={rideStatus}
      userRole={userRole}
      ridePlaces={ridePlaces}
      onAction={handleAction}
      {...props}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison for optimal memoization
  const rideChanged = (
    prevProps.ride._id !== nextProps.ride._id ||
    prevProps.ride.date !== nextProps.ride.date ||
    prevProps.ride.riders?.length !== nextProps.ride.riders?.length ||
    prevProps.ride.driver !== nextProps.ride.driver
  );

  const sessionChanged = (
    prevProps.rideSession?._id !== nextProps.rideSession?._id ||
    prevProps.rideSession?.status !== nextProps.rideSession?.status
  );

  const userChanged = (
    prevProps.currentUser?._id !== nextProps.currentUser?._id
  );

  const placesChanged = (
    prevProps.places?.length !== nextProps.places?.length
  );

  // Only re-render if something meaningful changed
  return !rideChanged && !sessionChanged && !userChanged && !placesChanged;
});

OptimizedRideCard.propTypes = {
  ride: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    driver: PropTypes.string.isRequired,
    riders: PropTypes.array,
    date: PropTypes.instanceOf(Date).isRequired,
    origin: PropTypes.string.isRequired,
    destination: PropTypes.string.isRequired,
  }).isRequired,
  rideSession: PropTypes.object,
  currentUser: PropTypes.object,
  onAction: PropTypes.func,
  places: PropTypes.array,
  users: PropTypes.array,
};

OptimizedRideCard.displayName = 'OptimizedRideCard';

export default OptimizedRideCard;
