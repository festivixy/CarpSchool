import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import Logo from "./Logo";
import Icon from "./Icon";
import Avatar from "./Avatar";
import { adminNavFor, adminSectionFor } from "../utils/adminNav";
import { isSystemRole } from "../desktop/components/NavBarRoleUtils";
import { isInternalUsername, realEmailOf } from "../utils/userDisplay";
import { hueFor } from "../utils/avatarHue";
import {
  Sidebar,
  Brand,
  Tag,
  NavList,
  NavItem,
  Rail,
  NavLabel,
  Badge,
  BadgePulse,
  AccountCard,
  AccountText,
  AccountName,
  AccountSub,
  AccountBtn,
} from "../styles/AdminShell";

/**
 * The admin area's navigation rail.
 *
 * Which entry is current comes from the URL, not from whoever rendered this.
 * The dashboard used to hardcode `active = item.id === "overview"`, which was
 * invisible only because the dashboard was the one screen that had a sidebar.
 *
 * Counts are optional: the dashboard subscribes to the stats that produce them
 * and passes them down, every other screen renders the rail without them
 * rather than loading dashboard data it has no other use for.
 */
/* Never the clerk_<id> username: it is a join key, and the account card was
 * showing it where a person's name belongs. */
const displayNameFor = (user) => {
  if (user?.profile?.name) return user.profile.name;
  if (user?.username && !isInternalUsername(user.username)) return user.username;
  const email = realEmailOf(user);
  return email ? email.split("@")[0] : "admin";
};

const AdminSidebar = ({ history, location, counts }) => {
  const { name, userId, system } = useTracker(() => {
    const user = Meteor.user();
    return {
      name: displayNameFor(user),
      userId: user?._id || "",
      system: isSystemRole(user),
    };
  }, []);

  const section = adminSectionFor(location.pathname);
  const items = adminNavFor(system);

  return (
    <Sidebar>
      <Brand>
        <Logo size={22} wordmark={false} color="var(--cream-0)" />
        <Tag>ADMIN</Tag>
      </Brand>

      <NavList>
        {items.map((item) => {
          const active = item.id === section;
          /* Entries without a countKey -- the verification queue -- are keyed
           * by id instead, so they can still carry a badge. */
          const count = counts ? counts[item.countKey] ?? counts[item.id] : undefined;
          const pulse = item.id === "queue" && count > 0;
          return (
            <NavItem
              key={item.id}
              type="button"
              $active={active}
              aria-current={active ? "page" : undefined}
              onClick={() => history.push(item.path)}
            >
              {active && <Rail />}
              <Icon name={item.icon} size={16} color="currentColor" />
              <NavLabel>{item.label}</NavLabel>
              {typeof count === "number" && (
                <Badge $pulse={pulse} $danger={item.danger && count > 0}>
                  {count}
                  {pulse && <BadgePulse className="pulse" />}
                </Badge>
              )}
            </NavItem>
          );
        })}
      </NavList>

      <AccountCard>
        <Avatar user={{ name, hue: hueFor(userId) }} size={32} />
        <AccountText>
          <AccountName>{name}</AccountName>
          <AccountSub>{system ? "system admin" : "admin"}</AccountSub>
        </AccountText>
        {system && (
          <AccountBtn
            type="button"
            aria-label="System settings"
            onClick={() => history.push("/system")}
          >
            <Icon name="settings" size={14} color="currentColor" />
          </AccountBtn>
        )}
      </AccountCard>
    </Sidebar>
  );
};

AdminSidebar.propTypes = {
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  /** Optional per-section counts, keyed by the nav item's countKey. */
  counts: PropTypes.object,
};

AdminSidebar.defaultProps = {
  counts: null,
};

export default withRouter(AdminSidebar);
