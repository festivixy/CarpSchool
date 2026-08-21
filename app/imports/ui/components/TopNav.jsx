import React from "react";
import PropTypes from "prop-types";
import Logo from "./Logo";
import Icon from "./Icon";
import Avatar from "./Avatar";
import {
  Bar,
  Brand,
  Divider,
  NavItems,
  NavItem,
  IconBtn,
  OfferBtn,
} from "../styles/TopNav";

const DEFAULT_ITEMS = [
  { id: "home", label: "Home" },
  { id: "find", label: "Find a ride" },
  { id: "rides", label: "My rides" },
  { id: "inbox", label: "Inbox" },
];

/**
 * Floating glass pill nav for customer-facing screens. Presentational only:
 * pass `onNav`/`onOffer` to wire navigation. `glass={false}` swaps the blur
 * for a solid surface on pages without a map underneath.
 */
const TopNav = ({ active, items, onNav, onOffer, glass, user }) => (
  <Bar $glass={glass}>
    <Brand>
      <Logo size={22} />
    </Brand>
    <Divider />
    <NavItems>
      {items.map(it => (
        <NavItem
          key={it.id}
          type="button"
          $active={active === it.id}
          onClick={() => onNav && onNav(it.id)}
        >
          {it.label}
        </NavItem>
      ))}
    </NavItems>
    <IconBtn type="button" aria-label="Notifications">
      <Icon name="bell" size={18} />
    </IconBtn>
    <OfferBtn type="button" onClick={onOffer}>
      <Icon name="plus" size={16} />
      Offer ride
    </OfferBtn>
    <Avatar user={user} size={32} ring="rgba(255, 255, 255, 0.6)" />
  </Bar>
);

TopNav.propTypes = {
  active: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
  })),
  onNav: PropTypes.func,
  onOffer: PropTypes.func,
  glass: PropTypes.bool,
  user: PropTypes.object,
};

TopNav.defaultProps = {
  active: "home",
  items: DEFAULT_ITEMS,
  onNav: undefined,
  onOffer: undefined,
  glass: true,
  user: null,
};

export default TopNav;
