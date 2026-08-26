import React from "react";
import PropTypes from "prop-types";
import Avatar from "./Avatar";
import Icon from "./Icon";
import { formatDuration, formatDistance } from "../../api/ride/routeEstimate";
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
  DriverMeta,
  RouteMeta,
} from "../styles/RideCard";

const WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/* Whole days between two instants, counted from local midnight so a ride at
 * 11pm tonight and one at 1am tomorrow do not both read "TODAY". */
const daysFromToday = (d) => {
  const startOfDay = x => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  return Math.round((startOfDay(d) - startOfDay(new Date())) / MS_PER_DAY);
};

const dayLabel = (d) => {
  const offset = daysFromToday(d);
  if (offset === 0) return "TODAY";
  if (offset === 1) return "TOMORROW";
  return WEEKDAYS[d.getDay()];
};

const formatWhen = (date) => {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "";
  const time = d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  return `${dayLabel(d)} · ${time}`;
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
const RideCard = ({ ride, driverName, driverYear, driverDept, compact, active, onClick, onRequest }) => {
  const seatsLeft = Math.max(0, (ride.seats || 0) - (ride.riders ? ride.riders.length : 0));
  const from = ride.originText || ride.origin || "Unknown";
  const to = ride.destinationText || ride.destination || "Unknown";
  const name = driverName || "Driver";
  const driverUser = { name, hue: hueFor(ride.driver || name) };
  const subLine = [driverYear, driverDept].filter(Boolean).join(" · ");
  const routeMeta = [formatDuration(ride.durationMin), formatDistance(ride.distanceMi)]
    .filter(Boolean)
    .join(" · ");

  const hasFare = Number.isFinite(ride.fare);

  const handleRequest = (e) => {
    e.stopPropagation();
    if (onRequest) onRequest(ride);
  };

  const handleClick = () => onClick && onClick(ride);

  // The card is the primary selection control on the discovery screen, so it
  // has to be reachable and operable from the keyboard when it is clickable.
  const handleKeyDown = (e) => {
    if (!onClick) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(ride);
    }
  };

  return (
    <Card
      $compact={compact}
      $active={active}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-current={active ? "true" : undefined}
    >
      <Top>
        <RouteCol>
          <TimeLabel>{formatWhen(ride.date)}</TimeLabel>
          <Place $compact={compact}>{from}</Place>
          <ToRow>
            <Icon name="arrowDown" size={13} />
            <Place as="span" $compact={compact}>{to}</Place>
          </ToRow>
        </RouteCol>
        {hasFare ? (
          <Fare>
            <FareValue>{ride.fare > 0 ? `$${ride.fare}` : "Free"}</FareValue>
            {ride.fare > 0 ? <FareUnit>PER SEAT</FareUnit> : null}
          </Fare>
        ) : null}
      </Top>

      <Rule />

      <Bottom>
        <DriverRow>
          <Avatar user={driverUser} size={32} />
          <div>
            <DriverName>{name}</DriverName>
            {subLine ? <DriverMeta>{subLine}</DriverMeta> : null}
          </div>
        </DriverRow>
        <SeatRow>
          {routeMeta ? <RouteMeta>{routeMeta}</RouteMeta> : null}
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
    distanceMi: PropTypes.number,
    durationMin: PropTypes.number,
  }).isRequired,
  driverName: PropTypes.string,
  driverYear: PropTypes.string,
  driverDept: PropTypes.string,
  compact: PropTypes.bool,
  active: PropTypes.bool,
  onClick: PropTypes.func,
  onRequest: PropTypes.func,
};

RideCard.defaultProps = {
  driverName: "",
  driverYear: "",
  driverDept: "",
  compact: false,
  active: false,
  onClick: undefined,
  onRequest: undefined,
};

export default RideCard;
