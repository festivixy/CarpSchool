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
  UserWrap,
  AvatarBtn,
  UserMenu,
  UserMenuItem,
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
 *
 * The avatar opens a user menu. The handoff draws the avatar as a bare mark,
 * but this is the only nav on signed-in desktop routes, so without a menu
 * there is no route to the profile, saved places, ride history, admin or
 * sign-out.
 */
const TopNav = ({
  active, items, onNav, onOffer, glass, user, menuItems, onMenuSelect,
}) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    if (!menuOpen) return undefined;
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setMenuOpen(false);
    };
    const onEsc = e => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen]);

  const pick = (id) => {
    setMenuOpen(false);
    if (onMenuSelect) onMenuSelect(id);
  };

  return (
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
      <IconBtn
        type="button"
        aria-label="Notifications"
        onClick={() => onNav && onNav("inbox")}
      >
        <Icon name="bell" size={18} />
      </IconBtn>
      <OfferBtn type="button" onClick={onOffer}>
        <Icon name="plus" size={16} />
        Offer ride
      </OfferBtn>
      <UserWrap ref={wrapRef}>
        <AvatarBtn
          type="button"
          aria-label="Account menu"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          onClick={() => setMenuOpen(open => !open)}
        >
          <Avatar user={user} size={32} ring="rgba(255, 255, 255, 0.6)" />
        </AvatarBtn>
        {menuOpen && menuItems.length > 0 && (
          <UserMenu role="menu">
            {menuItems.map(item => (
              <UserMenuItem
                key={item.id}
                type="button"
                role="menuitem"
                $danger={item.danger}
                onClick={() => pick(item.id)}
              >
                {item.icon && <Icon name={item.icon} size={15} />}
                {item.label}
              </UserMenuItem>
            ))}
          </UserMenu>
        )}
      </UserWrap>
    </Bar>
  );
};

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
  menuItems: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    label: PropTypes.string,
    icon: PropTypes.string,
    danger: PropTypes.bool,
  })),
  onMenuSelect: PropTypes.func,
};

TopNav.defaultProps = {
  active: "home",
  items: DEFAULT_ITEMS,
  onNav: undefined,
  onOffer: undefined,
  glass: true,
  user: null,
  menuItems: [],
  onMenuSelect: undefined,
};

export default TopNav;
