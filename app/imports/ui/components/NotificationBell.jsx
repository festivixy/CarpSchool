import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { Notifications } from "../../api/notifications/Notifications";
import Icon from "./Icon";

/**
 * In-app notification list for every signed-in user.
 *
 * Until now only the admin dashboard consumed the notifications publication;
 * a rider had no way to see that a driver cancelled, or that someone joined
 * their ride, unless a push happened to arrive.
 */

const Wrap = styled.div`
  position: relative;
  display: inline-flex;
`;

const BellBtn = styled.button`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--ink-1, #1a1815);
  cursor: pointer;

  &:hover { background: rgba(0, 0, 0, 0.06); }
`;

const Count = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--signal-yellow, #ffd400);
  color: var(--ink-1, #1a1815);
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
`;

const Menu = styled.div`
  position: absolute;
  top: 46px;
  right: 0;
  width: 340px;
  max-width: calc(100vw - 24px);
  max-height: 420px;
  overflow-y: auto;
  z-index: 60;
  border-radius: 14px;
  background: var(--cream-0, #faf7f0);
  border: 1px solid var(--cream-3, #ddd6c8);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  font-family: var(--font-ui, inherit);
`;

const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--cream-3, #ddd6c8);
  font-size: 13px;
  font-weight: 700;
`;

const LinkBtn = styled.button`
  border: 0;
  background: transparent;
  color: var(--ink-2, #5b5750);
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
`;

const Item = styled.button`
  display: block;
  width: 100%;
  padding: 12px 14px;
  border: 0;
  border-bottom: 1px solid var(--cream-2, #ece7dc);
  background: ${props => (props.$unread ? "var(--signal-yellow-soft, #fff4b8)" : "transparent")};
  text-align: left;
  cursor: pointer;
  font-family: inherit;

  &:hover { background: var(--cream-1, #f0ece3); }
`;

const Title = styled.div`
  font-size: 13.5px;
  font-weight: 600;
  color: var(--ink-1, #1a1815);
`;

const Body = styled.div`
  margin-top: 2px;
  font-size: 12.5px;
  color: var(--ink-2, #5b5750);
`;

const When = styled.div`
  margin-top: 4px;
  font-size: 11px;
  color: var(--ink-3, #8a857c);
`;

const Empty = styled.div`
  padding: 24px 14px;
  text-align: center;
  font-size: 13px;
  color: var(--ink-3, #8a857c);
`;

const relative = (date) => {
  if (!date) return "";
  const diff = Date.now() - new Date(date).getTime();
  const min = Math.round(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const hrs = Math.round(min / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} d ago`;
};

const targetFor = (n) => {
  const data = n.data || {};
  if (data.rideId && (n.type === "chat_message" || data.chatId)) return `/chat?rideId=${data.rideId}`;
  if (data.rideId) return `/ride/${data.rideId}`;
  if (data.url && typeof data.url === "string" && data.url.startsWith("/")) return data.url;
  return null;
};

const NotificationBell = ({ history }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const { ready, items } = useTracker(() => {
    if (!Meteor.userId()) return { ready: true, items: [] };
    const sub = Meteor.subscribe("notifications.recent");
    return {
      ready: sub.ready(),
      items: Notifications.find({ userId: Meteor.userId() }, { sort: { createdAt: -1 }, limit: 20 }).fetch(),
    };
  }, []);

  const unread = items.filter(n => n.status !== "read").length;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = e => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const openItem = (n) => {
    if (n.status !== "read") Meteor.call("notifications.markAsRead", n._id, () => {});
    setOpen(false);
    const to = targetFor(n);
    if (to && history) history.push(to);
  };

  const markAll = () => Meteor.call("notifications.markAllAsRead", () => {});

  if (!Meteor.userId()) return null;

  return (
    <Wrap ref={wrapRef}>
      <BellBtn
        type="button"
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen(o => !o)}
      >
        <Icon name="bell" size={18} />
        {unread > 0 && <Count aria-hidden="true">{unread > 9 ? "9+" : unread}</Count>}
      </BellBtn>
      {open && (
        <Menu role="menu" aria-label="Notifications">
          <Head>
            <span>Notifications</span>
            {unread > 0 && <LinkBtn type="button" onClick={markAll}>Mark all read</LinkBtn>}
          </Head>
          {!ready && <Empty>Loading…</Empty>}
          {ready && items.length === 0 && <Empty>You&apos;re all caught up.</Empty>}
          {items.map(n => (
            <Item key={n._id} type="button" role="menuitem" $unread={n.status !== "read"} onClick={() => openItem(n)}>
              <Title>{n.title}</Title>
              {n.body && <Body>{n.body}</Body>}
              <When>{relative(n.createdAt)}</When>
            </Item>
          ))}
        </Menu>
      )}
    </Wrap>
  );
};

NotificationBell.propTypes = {
  history: PropTypes.object,
};

NotificationBell.defaultProps = {
  history: null,
};

export default withRouter(NotificationBell);
