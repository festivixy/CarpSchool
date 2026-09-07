import React from "react";
import PropTypes from "prop-types";
import { AvatarCircle, StackWrap, StackItem, StackMore } from "../styles/Avatar";

const initialsFromName = (name) => name
  .split(" ")
  .filter(Boolean)
  .map(part => part[0])
  .slice(0, 2)
  .join("")
  .toUpperCase();

const userShape = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  initials: PropTypes.string,
  name: PropTypes.string,
  hue: PropTypes.number,
});

/**
 * Hue-based pastel avatar showing the rider's initials.
 */
export const Avatar = ({
  user, size, ring, nameAdjacent,
}) => {
  if (!user) return null;
  const initials = user.initials || (user.name ? initialsFromName(user.name) : "?");
  const hue = typeof user.hue === "number" ? user.hue : 220;
  /* When the caller already renders the name as visible text next to this
   * avatar, the image is decorative to a screen reader (aria-hidden).
   * Otherwise it is the only label for the person, so it needs its own
   * accessible name (role="img" + aria-label). */
  const a11yProps = nameAdjacent
    ? { "aria-hidden": "true" }
    : { role: "img", "aria-label": user.name || initials };
  return (
    <AvatarCircle $size={size} $hue={hue} $ring={ring} {...a11yProps}>
      {initials}
    </AvatarCircle>
  );
};

Avatar.propTypes = {
  user: userShape,
  size: PropTypes.number,
  ring: PropTypes.string,
  nameAdjacent: PropTypes.bool,
};

Avatar.defaultProps = {
  user: null,
  size: 32,
  ring: null,
  nameAdjacent: false,
};

/**
 * Overlapping row of avatars with a "+N" overflow chip.
 */
export const AvatarStack = ({ users, max, size }) => {
  const shown = users.slice(0, max);
  const rest = users.length - shown.length;
  return (
    <StackWrap>
      {shown.map((u, i) => (
        <StackItem key={u.id || u.initials || i} $first={i === 0} $size={size}>
          <Avatar user={u} size={size} ring="var(--cream-0)" />
        </StackItem>
      ))}
      {rest > 0 && <StackMore $size={size}>{`+${rest}`}</StackMore>}
    </StackWrap>
  );
};

AvatarStack.propTypes = {
  users: PropTypes.arrayOf(userShape),
  max: PropTypes.number,
  size: PropTypes.number,
};

AvatarStack.defaultProps = {
  users: [],
  max: 4,
  size: 28,
};

export default Avatar;
