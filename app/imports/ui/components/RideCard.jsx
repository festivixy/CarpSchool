import React from "react";
import PropTypes from "prop-types";
import Avatar from "./Avatar";
import Icon from "./Icon";
import {
  Card,
  Top,
  RouteCol,
  TimeLabel,
  Place,
  ToRow,
  Fare,
  FareValue,
  FareUnit,
  Rule,
  Bottom,
  DriverRow,
  DriverName,
  SeatRow,
  SeatPill,
  RequestBtn,
} from "../styles/RideCard";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const formatWhen = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const day = WEEKDAYS[d.getDay()];
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${day} · ${time}`;
};

// Deterministic pastel hue from a seed (driver id / name).
const hueFor = (seed) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) % 360;
  }
  return h;
};

/**
 * Discovery / list ride card. Maps a real Rides document (place names
 * resolved server-side, driver name resolved via profiles.displayNames).
 */
const RideCard = ({ ride, driverName, compact, active, onClick, onRequest }) => {
  const seatsLeft = Math.max(0, (ride.seats || 0) - (ride.riders ? ride.riders.length : 0));
  const from = ride.originText || ride.origin || "Unknown";
  const to = ride.destinationText || ride.destination || "Unknown";
  const name = driverName || "Driver";
  const driverUser = { name, hue: hueFor(ride.driver || name) };

  const handleRequest = (e) => {
    e.stopPropagation();
    if (onRequest) onRequest(ride);
  };

  return (
    <Card $compact={compact} $active={active} onClick={() => onClick && onClick(ride)}>
      <Top>
        <RouteCol>
          <TimeLabel>{formatWhen(ride.date)}</TimeLabel>
          <Place $compact={compact}>{from}</Place>
          <ToRow>
            <Icon name="arrowDown" size={13} />
            <Place as="span" $compact={compact}>{to}</Place>
          </ToRow>
        </RouteCol>
        {ride.fare ? (
          <Fare>
            <FareValue>{`$${ride.fare}`}</FareValue>
            <FareUnit>PER SEAT</FareUnit>
          </Fare>
        ) : null}
      </Top>

      <Rule />

      <Bottom>
        <DriverRow>
          <Avatar user={driverUser} size={32} />
          <DriverName>{name}</DriverName>
        </DriverRow>
        <SeatRow>
          <SeatPill $open={seatsLeft > 0}>
            <Icon name="seat" size={12} />
            {`${seatsLeft} left`}
          </SeatPill>
          {onRequest && (
            <RequestBtn type="button" onClick={handleRequest}>
              View
            </RequestBtn>
          )}
        </SeatRow>
      </Bottom>
    </Card>
  );
};

RideCard.propTypes = {
  ride: PropTypes.shape({
    _id: PropTypes.string,
    origin: PropTypes.string,
    destination: PropTypes.string,
    originText: PropTypes.string,
    destinationText: PropTypes.string,
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    seats: PropTypes.number,
    riders: PropTypes.arrayOf(PropTypes.string),
    fare: PropTypes.number,
    driver: PropTypes.string,
  }).isRequired,
  driverName: PropTypes.string,
  compact: PropTypes.bool,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  onRequest: PropTypes.func,
};

RideCard.defaultProps = {
  driverName: "",
  compact: false,
  active: false,
  onClick: undefined,
  onRequest: undefined,
};

export default RideCard;
