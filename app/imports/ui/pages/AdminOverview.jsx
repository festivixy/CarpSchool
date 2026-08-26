import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Profiles } from "../../api/profile/Profile";
import { Notifications } from "../../api/notifications/Notifications";
import Logo from "../components/Logo";
import Icon from "../components/Icon";
import { Avatar } from "../components/Avatar";
import {
  Shell,
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
  Main,
  TopBar,
  SearchWrap,
  SearchInput,
  KeyHint,
  TopSpacer,
  Clock,
  HealthPill,
  PillDot,
  BellWrap,
  BellBtn,
  BellDot,
  NotifPanel,
  NotifRow,
  NotifTitle,
  NotifDot,
  NotifBody,
  NotifTime,
  NotifEmpty,
  Content,
  Header,
  Eyebrow,
  Title,
  HeaderActions,
  GhostBtn,
  PrimaryBtn,
  StatRow,
  StatCard,
  StatLabel,
  StatTop,
  StatValue,
  StatDelta,
  LiveDot,
  Spark,
  SparkBar,
  Body,
  TableCard,
  TableHead,
  CardH3,
  SubLine,
  ChipRow,
  FilterChip,
  HeadRow,
  HeadCell,
  BodyRow,
  IdCell,
  RouteCell,
  RouteTop,
  RouteText,
  FlagChip,
  DriverRow,
  DriverName,
  StatusPill,
  StatusDot,
  SeatCell,
  WhenCell,
  ChevCell,
  TableFoot,
  FootText,
  Pager,
  PageBtn,
  PageGap,
  SideCol,
  Panel,
  PanelHead,
  PanelCount,
  QueueList,
  QueueItem,
  QueueBody,
  QueueTop,
  QName,
  KindBadge,
  QAge,
  QNote,
  QActions,
  ApproveBtn,
  ReviewBtn,
  RejectBtn,
  RejectRow,
  RejectInput,
  QError,
  FullQueueBtn,
  ServiceList,
  ServiceRow,
  ServiceDot,
  ServiceName,
  ServiceStatus,
  ServiceLatency,
  FeedCard,
  FeedHead,
  FeedTitle,
  FeedPulse,
  FeedList,
  FeedRow,
  FeedTime,
  FeedKind,
  FeedText,
  FeedEmpty,
  Empty,
  ErrorText,
  RetryBtn,
  Skeleton,
  SkeletonStack,
} from "../styles/AdminOverview";

const PAGE_SIZE = 7;
const QUEUE_PREVIEW = 4;
const FEED_LIMIT = 6;

const CLOCK_TICK_MS = 30000;
const HEALTH_POLL_MS = 30000;
const FEED_POLL_MS = 15000;
const SEARCH_DEBOUNCE_MS = 250;

const RANGE_HOURS = { day: 24, week: 168 };
const RANGE_LABEL = { 24: "LAST 24 HOURS", 168: "LAST 7 DAYS" };
const RANGE_BUTTON = { 24: "Last 24h", 168: "Last 7 days" };

const STATUS_FILTERS = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "pending", label: "Pending" },
  { id: "flagged", label: "Flagged", danger: true, countKey: "flagged" },
];

const COLUMNS = ["RIDE ID", "ROUTE · DRIVER", "STATUS", "SEATS", "WHEN", ""];

/* The three moderation chips the design shows inline on a route. Each maps to
 * a condition the server derives from stored ride data. */
const FLAG_META = {
  long: { label: "long", tone: "pending", title: "Longer than this school's ride-distance limit" },
  price: { label: "price", tone: "flagged", title: "Fare is more than twice a fair gas split" },
  nopickup: { label: "no pickup", tone: "flagged", title: "Pickup code failed 5 times" },
};

const USER_TYPE_META = {
  Driver: { label: "DRIVER", tone: "driver" },
  Rider: { label: "RIDER", tone: "rider" },
  Both: { label: "BOTH", tone: "both" },
};

const PENDING_SELECTOR = {
  requested: true,
  verified: { $ne: true },
  rejected: { $ne: true },
};

/* Deterministic hue so a given account always gets the same avatar colour,
 * matching TopNavAuto. */
const hueFor = (seed) => {
  if (!seed) return 220;
  let total = 0;
  for (let i = 0; i < seed.length; i += 1) total += seed.charCodeAt(i);
  return total % 360;
};

const formatCount = (value) => {
  if (!Number.isFinite(value)) return "—";
  if (value < 1000) return String(value);
  return `${(value / 1000).toFixed(1)}k`;
};

const formatClock = (date) => {
  const day = date
    .toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })
    .replace(/,\s*/g, " · ");
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
  return `${day} · ${time}`.toUpperCase();
};

const formatWhen = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const time = date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const days = Math.round((dayStart.getTime() - midnight.getTime()) / 86400000);
  if (days === 0) return `Today ${time}`;
  if (days === 1) return `Tomorrow ${time}`;
  return `${date.toLocaleDateString([], { weekday: "short" })} ${time}`;
};

const formatAge = (value) => {
  if (!value) return null;
  const ms = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(ms)) return null;
  const minutes = Math.floor(ms / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  return `${Math.floor(hours / 24)} d ago`;
};

const formatFeedTime = value => new Date(value).toLocaleTimeString([], {
  hour12: false,
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

const formatLatency = row => (row.status === "down" ? "—" : `${row.latencyMs}ms`);

const signed = value => (value > 0 ? `+${value}` : String(value));

/** First, last and the current page's neighbours — the design's 1 2 3 … 36. */
const pageWindow = (page, pageCount) => {
  const wanted = [1, pageCount, page - 1, page, page + 1];
  const unique = [...new Set(wanted)].filter(p => p >= 1 && p <= pageCount);
  return unique.sort((a, b) => a - b);
};

const csvCell = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  return `"${text.replace(/"/g, "\"\"")}"`;
};

/**
 * One admin method call with loading / error / refetch handling, optionally
 * polled. Every state write is guarded so an unmount mid-flight cannot warn,
 * and a failed poll keeps the data already on screen instead of blanking it.
 */
const useAdminData = (methodName, args, deps, pollMs) => {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [nonce, setNonce] = useState(0);
  const refetch = useCallback(() => setNonce(n => n + 1), []);

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const data = await Meteor.callAsync(methodName, ...args);
        if (active) setState({ data, loading: false, error: null });
      } catch (error) {
        const reason = error?.reason || error?.message || "Could not load this panel.";
        if (active) setState(prev => ({ data: prev.data, loading: false, error: reason }));
      }
    };

    setState(prev => ({ ...prev, loading: true }));
    run();

    const timer = pollMs ? setInterval(run, pollMs) : null;
    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [...deps, nonce]);

  return { ...state, refetch };
};

const AdminOverview = ({ history }) => {
  const [rangeHours, setRangeHours] = useState(RANGE_HOURS.day);
  const [status, setStatus] = useState("all");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [now, setNow] = useState(() => new Date());
  const [rejecting, setRejecting] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busyOwner, setBusyOwner] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef(null);
  const notifRef = useRef(null);

  /* Reactive slices: the pending count and the unread bell must update the
   * instant an approval or a notification lands, so they stay on publications
   * rather than on the polled methods. */
  const { pendingCount, meName, meId } = useTracker(() => {
    Meteor.subscribe("admin.pendingUsers");
    Meteor.subscribe("userProfile");
    Meteor.subscribe("notifications.recent");
    const userId = Meteor.userId();
    const user = Meteor.user();
    const profile = userId ? Profiles.findOne({ Owner: userId }) : null;
    return {
      pendingCount: Profiles.find(PENDING_SELECTOR).count(),
      meId: userId,
      meName: profile?.Name || user?.username || user?.emails?.[0]?.address || "Administrator",
    };
  }, []);

  const recentNotifications = useTracker(
    () => Notifications.find({}, { sort: { createdAt: -1 }, limit: 8 }).fetch(),
    [],
  );
  const unreadCount = useTracker(
    () => Notifications.find({ status: { $ne: "read" } }).count(),
    [],
  );

  const stats = useAdminData("admin.dashboardStats", [rangeHours], [rangeHours], null);
  const queue = useAdminData(
    "admin.rideQueue",
    [{ status, query, page, pageSize: PAGE_SIZE }],
    [status, query, page],
    null,
  );
  const health = useAdminData("admin.serviceHealth", [], [], HEALTH_POLL_MS);
  const feed = useAdminData("admin.activityFeed", [FEED_LIMIT], [], FEED_POLL_MS);
  const pending = useAdminData("admin.getPendingUsers", [], [], null);

  const go = useCallback(path => history.push(path), [history]);

  /* Live clock in the top bar — the design's "SUN · OCT 26 · 14:22 ET". */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), CLOCK_TICK_MS);
    return () => clearInterval(timer);
  }, []);

  /* Debounce the search box so each keystroke does not hit the server. */
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(queryInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [queryInput]);

  /* Make the ⌘K hint truthful rather than decorative. */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setNotifOpen(false);
        return;
      }
      const isCombo = (event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey);
      const isSlash = event.key === "/" && !event.metaKey && !event.ctrlKey
        && !["INPUT", "TEXTAREA"].includes(event.target?.tagName);
      if (!isCombo && !isSlash) return;
      event.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  /* Dismiss the notification popover on an outside click. */
  useEffect(() => {
    if (!notifOpen) return undefined;
    const onPointerDown = (event) => {
      if (!notifRef.current?.contains(event.target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [notifOpen]);

  const isSystem = stats.data?.scope?.isSystem === true;
  const navCounts = stats.data?.navCounts || {};
  const rows = queue.data?.rows || [];
  const counts = queue.data?.counts || {};

  const navItems = useMemo(() => [
    { id: "overview", label: "Overview", icon: "grid", path: "/admin/overview" },
    { id: "rides", label: "Rides", icon: "car", path: "/admin/rides", count: navCounts.rides },
    { id: "users", label: "Users", icon: "user", path: "/admin/users", count: navCounts.users },
    {
      id: "queue",
      label: "Verification queue",
      icon: "check",
      path: "/admin/pending-users",
      count: pendingCount,
      pulse: pendingCount > 0,
    },
    {
      id: "reports",
      label: "Reports",
      icon: "flame",
      path: "/admin/error-reports",
      count: navCounts.reports,
      danger: true,
    },
    { id: "places", label: "Places", icon: "pin", path: "/admin/places", count: navCounts.places },
    {
      id: "schools",
      label: "Schools",
      icon: "school",
      path: "/admin/schools",
      count: navCounts.schools,
      systemOnly: true,
    },
    { id: "system", label: "System health", icon: "settings", path: "/system", systemOnly: true },
  ].filter(item => !item.systemOnly || isSystem), [navCounts, pendingCount, isSystem]);

  const cards = useMemo(() => {
    const s = stats.data?.stats;
    if (!s) return [];
    const list = [
      {
        key: "active",
        label: "ACTIVE RIDES",
        value: formatCount(s.activeRides.value),
        delta: signed(s.activeRides.delta),
        deltaTone: s.activeRides.delta >= 0 ? "good" : "danger",
        tint: "var(--ink-1)",
        series: s.activeRides.series,
      },
      {
        key: "inflight",
        label: "IN-FLIGHT NOW",
        value: formatCount(s.inFlight.value),
        delta: "live",
        deltaTone: "danger",
        live: true,
        tint: "var(--danger)",
        series: s.inFlight.series,
      },
      {
        key: "signups",
        label: "SIGN-UPS TODAY",
        value: formatCount(s.signups.value),
        delta: s.signups.deltaPct === null ? null : `${signed(s.signups.deltaPct)}%`,
        deltaTone: (s.signups.deltaPct || 0) >= 0 ? "good" : "danger",
        tint: "var(--ink-1)",
        series: s.signups.series,
      },
      {
        key: "chats",
        label: "CHATS / HR",
        value: formatCount(s.chats.value),
        delta: s.chats.deltaPct === null ? null : `${signed(s.chats.deltaPct)}%`,
        deltaTone: (s.chats.deltaPct || 0) >= 0 ? "good" : "danger",
        tint: "var(--ink-1)",
        series: s.chats.series,
      },
    ];
    if (s.reports) {
      list.push({
        key: "reports",
        label: "OPEN ERROR REPORTS",
        value: formatCount(s.reports.value),
        delta: s.reports.delta === null ? null : signed(s.reports.delta),
        deltaTone: "danger",
        tint: "var(--danger)",
        series: s.reports.series,
      });
    }
    return list;
  }, [stats.data]);

  const healthPill = useMemo(() => {
    if (health.error) return { tone: "unknown", text: "health check unavailable" };
    if (!health.data) return { tone: "unknown", text: "checking services" };
    const summary = health.data.summary;
    if (summary.down > 0) return { tone: "down", text: `${summary.down} down` };
    if (summary.degraded > 0) return { tone: "degraded", text: `${summary.degraded} degraded` };
    return { tone: "healthy", text: "all services healthy" };
  }, [health.data, health.error]);

  const exportRows = () => {
    if (rows.length === 0) return;
    const header = [
      "ride_id", "code", "origin", "destination", "driver",
      "status", "flags", "riders", "seats", "departs",
    ];
    const lines = rows.map(row => [
      row._id,
      row.code,
      row.originText,
      row.destinationText,
      row.driverName,
      row.status,
      row.flags.join(" "),
      row.riders,
      row.seats,
      new Date(row.date).toISOString(),
    ].map(csvCell).join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `carp-ride-queue-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const runApproval = async (methodName, owner, reason) => {
    setBusyOwner(owner);
    setActionError(null);
    try {
      const args = reason === undefined ? [owner] : [owner, reason];
      await Meteor.callAsync(methodName, ...args);
      setRejecting(null);
      setRejectReason("");
      // The queue card reads a non-reactive method while the badge reads a
      // publication; refetch so the two can never visibly disagree.
      pending.refetch();
      stats.refetch();
    } catch (error) {
      setActionError({
        owner,
        message: error?.reason || error?.message || "That action failed.",
      });
    } finally {
      setBusyOwner(null);
    }
  };

  const openNotification = (note) => {
    setNotifOpen(false);
    if (note.status !== "read") {
      Meteor.callAsync("notifications.markAsRead", note._id).catch(() => {
        // A failed read-receipt must not block navigation; the badge simply
        // stays until the next successful mark.
      });
    }
    if (note.data?.rideId) go(`/ride/${note.data.rideId}`);
  };

  const selectStatus = (id) => {
    setStatus(id);
    setPage(1);
  };

  const renderNavItem = (item) => {
    const active = item.id === "overview";
    return (
      <NavItem key={item.id} type="button" $active={active} onClick={() => go(item.path)}>
        {active && <Rail />}
        <Icon name={item.icon} size={16} color="currentColor" />
        <NavLabel>{item.label}</NavLabel>
        {typeof item.count === "number" && (
          <Badge $pulse={item.pulse} $danger={item.danger && item.count > 0}>
            {item.count}
            {item.pulse && <BadgePulse className="pulse" />}
          </Badge>
        )}
      </NavItem>
    );
  };

  const renderStatCard = (card) => {
    const max = Math.max(1, ...card.series);
    return (
      <StatCard key={card.key}>
        <StatLabel>{card.label}</StatLabel>
        <StatTop>
          <StatValue $tint={card.tint}>{card.value}</StatValue>
          {card.delta !== null && (
            <StatDelta $tone={card.deltaTone}>
              {card.live && <LiveDot className="pulse" />}
              {card.delta}
            </StatDelta>
          )}
        </StatTop>
        <Spark>
          {card.series.map((value, index) => (
            <SparkBar
              key={`${card.key}-${index}`}
              $pct={(value / max) * 100}
              $active={index === card.series.length - 1}
              $tint={card.tint}
            />
          ))}
        </Spark>
      </StatCard>
    );
  };

  const renderRow = (row) => {
    const open = () => go(`/ride/${row._id}`);
    return (
      <BodyRow
        key={row._id}
        role="link"
        tabIndex={0}
        onClick={open}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            open();
          }
        }}
      >
        <IdCell>{`#${row.code}`}</IdCell>
        <RouteCell>
          <RouteTop>
            <RouteText>{`${row.originText} → ${row.destinationText}`}</RouteText>
            {row.flags.map(flag => (
              <FlagChip key={flag} $tone={FLAG_META[flag].tone} title={FLAG_META[flag].title}>
                {FLAG_META[flag].label}
              </FlagChip>
            ))}
          </RouteTop>
          {row.driverName && (
            <DriverRow>
              <Avatar user={{ name: row.driverName, hue: hueFor(row.driverId) }} size={16} />
              <DriverName>{row.driverName}</DriverName>
            </DriverRow>
          )}
        </RouteCell>
        <div>
          <StatusPill $tone={row.status}>
            <StatusDot $tone={row.status} />
            {row.status}
          </StatusPill>
        </div>
        <SeatCell>{`${row.riders}/${row.seats}`}</SeatCell>
        <WhenCell>{formatWhen(row.date)}</WhenCell>
        <ChevCell>
          <Icon name="chevR" size={14} color="var(--ink-3)" />
        </ChevCell>
      </BodyRow>
    );
  };

  const renderPager = () => {
    const pageCount = queue.data?.pageCount || 1;
    const currentPage = queue.data?.page || 1;
    const pages = pageWindow(currentPage, pageCount);
    const nodes = [];
    pages.forEach((value, index) => {
      if (index > 0 && value - pages[index - 1] > 1) {
        nodes.push(<PageGap key={`gap-${value}`}>…</PageGap>);
      }
      nodes.push(
        <PageBtn
          key={value}
          type="button"
          $active={value === currentPage}
          onClick={() => setPage(value)}
        >
          {value}
        </PageBtn>,
      );
    });
    return (
      <Pager>
        <PageBtn
          type="button"
          disabled={currentPage <= 1}
          onClick={() => setPage(currentPage - 1)}
          aria-label="Previous page"
        >
          <Icon name="chevL" size={11} />
        </PageBtn>
        {nodes}
        <PageBtn
          type="button"
          disabled={currentPage >= pageCount}
          onClick={() => setPage(currentPage + 1)}
          aria-label="Next page"
        >
          <Icon name="chevR" size={11} />
        </PageBtn>
      </Pager>
    );
  };

  const renderTableBody = () => {
    if (queue.error) {
      return (
        <ErrorText>
          {queue.error}
          <RetryBtn type="button" onClick={queue.refetch}>Retry</RetryBtn>
        </ErrorText>
      );
    }
    if (queue.loading && rows.length === 0) {
      return (
        <SkeletonStack>
          {[0, 1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} $h={28} />)}
        </SkeletonStack>
      );
    }
    if (rows.length === 0) return <Empty>No rides match this filter.</Empty>;
    return rows.map(renderRow);
  };

  const renderQueueItem = (row) => {
    const kind = USER_TYPE_META[row.UserType] || USER_TYPE_META.Both;
    const age = formatAge(row.userCreatedAt);
    const contact = row.schoolemail || row.userEmail;
    const busy = busyOwner === row.Owner;
    return (
      <QueueItem key={row._id}>
        <Avatar user={{ name: row.Name || "?", hue: hueFor(row.Owner) }} size={32} />
        <QueueBody>
          <QueueTop>
            <QName>{row.Name || "Unnamed student"}</QName>
            <KindBadge $tone={kind.tone}>{kind.label}</KindBadge>
            {age && <QAge>{age}</QAge>}
          </QueueTop>
          <QNote>{[contact, row.schoolName].filter(Boolean).join(" · ")}</QNote>
          {rejecting === row.Owner ? (
            <RejectRow>
              <RejectInput
                value={rejectReason}
                placeholder="Reason (optional)"
                onChange={event => setRejectReason(event.target.value)}
              />
              <RejectBtn
                type="button"
                disabled={busy}
                onClick={() => runApproval("admin.rejectUser", row.Owner, rejectReason)}
              >
                Confirm
              </RejectBtn>
              <ReviewBtn type="button" onClick={() => setRejecting(null)}>Cancel</ReviewBtn>
            </RejectRow>
          ) : (
            <QActions>
              <ApproveBtn
                type="button"
                disabled={busy}
                onClick={() => runApproval("admin.approveUser", row.Owner)}
              >
                Approve
              </ApproveBtn>
              <ReviewBtn type="button" onClick={() => go("/admin/pending-users")}>Review</ReviewBtn>
              <RejectBtn
                type="button"
                disabled={busy}
                onClick={() => {
                  setRejecting(row.Owner);
                  setRejectReason("");
                }}
              >
                Reject
              </RejectBtn>
            </QActions>
          )}
          {actionError?.owner === row.Owner && <QError>{actionError.message}</QError>}
        </QueueBody>
      </QueueItem>
    );
  };

  const renderQueue = () => {
    if (pending.error) {
      return (
        <ErrorText>
          {pending.error}
          <RetryBtn type="button" onClick={pending.refetch}>Retry</RetryBtn>
        </ErrorText>
      );
    }
    const list = pending.data?.pendingUsers;
    if (!list) {
      return (
        <SkeletonStack>
          {[0, 1, 2].map(i => <Skeleton key={i} $h={64} />)}
        </SkeletonStack>
      );
    }
    if (list.length === 0) return <Empty>No pending approvals.</Empty>;
    return <QueueList>{list.slice(0, QUEUE_PREVIEW).map(renderQueueItem)}</QueueList>;
  };

  const renderServices = () => {
    if (health.error) {
      return (
        <ErrorText>
          {health.error}
          <RetryBtn type="button" onClick={health.refetch}>Retry</RetryBtn>
        </ErrorText>
      );
    }
    if (!health.data) {
      return (
        <SkeletonStack>
          {[0, 1, 2, 3].map(i => <Skeleton key={i} $h={13} />)}
        </SkeletonStack>
      );
    }
    return (
      <ServiceList>
        {health.data.services.map(row => (
          <ServiceRow key={row.id}>
            <ServiceDot $tone={row.status} />
            <ServiceName title={row.host}>{row.host}</ServiceName>
            <ServiceStatus>{row.status}</ServiceStatus>
            <ServiceLatency>{formatLatency(row)}</ServiceLatency>
          </ServiceRow>
        ))}
      </ServiceList>
    );
  };

  const renderFeed = () => {
    if (feed.error) return <FeedEmpty>{feed.error}</FeedEmpty>;
    if (!feed.data) return <FeedEmpty>connecting…</FeedEmpty>;
    if (feed.data.length === 0) return <FeedEmpty>No activity in the last 24 hours.</FeedEmpty>;
    return (
      <FeedList>
        {feed.data.map(event => (
          <FeedRow key={`${event.kind}-${new Date(event.at).getTime()}-${event.text}`}>
            <FeedTime>{formatFeedTime(event.at)}</FeedTime>
            <FeedKind $tone={event.tone}>{event.kind}</FeedKind>
            <FeedText>{event.text}</FeedText>
          </FeedRow>
        ))}
      </FeedList>
    );
  };

  const scope = stats.data?.scope;
  const roleLine = scope && scope.isSystem
    ? "system admin"
    : `admin${scope?.schoolShortName ? ` · ${scope.schoolShortName}` : ""}`;

  const total = queue.data?.total || 0;

  return (
    <Shell>
      <Sidebar>
        <Brand>
          <Logo size={22} wordmark={false} />
          <Tag>ADMIN</Tag>
        </Brand>

        <NavList>{navItems.map(renderNavItem)}</NavList>

        <AccountCard>
          <Avatar user={{ name: meName, hue: hueFor(meId) }} size={32} />
          <AccountText>
            <AccountName>{meName}</AccountName>
            <AccountSub>{scope ? roleLine : "admin"}</AccountSub>
          </AccountText>
          {isSystem && (
            <AccountBtn type="button" aria-label="System settings" onClick={() => go("/system")}>
              <Icon name="settings" size={14} color="currentColor" />
            </AccountBtn>
          )}
        </AccountCard>
      </Sidebar>

      <Main>
        <TopBar>
          <SearchWrap>
            <Icon name="search" size={14} color="var(--ink-3)" />
            <SearchInput
              ref={searchRef}
              value={queryInput}
              placeholder="Search rides by route, driver or id…"
              aria-label="Search rides"
              onChange={event => setQueryInput(event.target.value)}
            />
            <KeyHint>⌘K</KeyHint>
          </SearchWrap>
          <TopSpacer />
          <Clock>{formatClock(now)}</Clock>
          <HealthPill $tone={healthPill.tone}>
            <PillDot />
            {healthPill.text}
          </HealthPill>
          <BellWrap ref={notifRef}>
            <BellBtn
              type="button"
              aria-label="Notifications"
              aria-expanded={notifOpen}
              onClick={() => setNotifOpen(open => !open)}
            >
              <Icon name="bell" size={15} />
              {unreadCount > 0 && <BellDot>{unreadCount > 9 ? "9+" : unreadCount}</BellDot>}
            </BellBtn>
            {notifOpen && (
              <NotifPanel>
                {recentNotifications.length === 0
                  ? <NotifEmpty>No notifications in the last 24 hours.</NotifEmpty>
                  : recentNotifications.map(note => (
                    <NotifRow key={note._id} type="button" onClick={() => openNotification(note)}>
                      <NotifTitle>
                        {note.status !== "read" && <NotifDot />}
                        {note.title}
                      </NotifTitle>
                      <NotifBody>{note.body}</NotifBody>
                      <NotifTime>{formatAge(note.createdAt)}</NotifTime>
                    </NotifRow>
                  ))}
              </NotifPanel>
            )}
          </BellWrap>
        </TopBar>

        <Content>
          <Header>
            <div>
              <Eyebrow>{`OVERVIEW · ${RANGE_LABEL[rangeHours]}`}</Eyebrow>
              <Title>Operations</Title>
            </div>
            <HeaderActions>
              <GhostBtn
                type="button"
                onClick={() => setRangeHours(
                  rangeHours === RANGE_HOURS.day ? RANGE_HOURS.week : RANGE_HOURS.day,
                )}
              >
                <Icon name="filter" size={14} />
                {RANGE_BUTTON[rangeHours]}
              </GhostBtn>
              <PrimaryBtn type="button" disabled={rows.length === 0} onClick={exportRows}>
                <Icon name="arrowDown" size={14} color="var(--cream-0)" />
                Export
              </PrimaryBtn>
            </HeaderActions>
          </Header>

          {stats.error && (
            <ErrorText>
              {stats.error}
              <RetryBtn type="button" onClick={stats.refetch}>Retry</RetryBtn>
            </ErrorText>
          )}

          <StatRow $cols={Math.max(cards.length, 4)}>
            {cards.length > 0
              ? cards.map(renderStatCard)
              : [0, 1, 2, 3].map(i => (
                <StatCard key={i}>
                  <Skeleton $h={11} $w="60%" />
                  <StatTop><Skeleton $h={26} $w="40%" /></StatTop>
                  <Spark><Skeleton $h={18} /></Spark>
                </StatCard>
              ))}
          </StatRow>

          <Body>
            <TableCard>
              <TableHead>
                <div>
                  <CardH3>Live rides</CardH3>
                  <SubLine>
                    {queue.data
                      ? `${counts.live} active · ${counts.flagged} flagged · ${counts.cancelledToday} cancelled today`
                      : "Loading ride queue…"}
                  </SubLine>
                </div>
                <ChipRow>
                  {STATUS_FILTERS.map(filter => (
                    <FilterChip
                      key={filter.id}
                      type="button"
                      $active={status === filter.id}
                      $danger={filter.danger}
                      onClick={() => selectStatus(filter.id)}
                    >
                      {filter.countKey && queue.data
                        ? `${filter.label} · ${counts[filter.countKey]}`
                        : filter.label}
                    </FilterChip>
                  ))}
                </ChipRow>
              </TableHead>

              <HeadRow>
                {COLUMNS.map((label, index) => (
                  <HeadCell key={label || `col-${index}`}>{label}</HeadCell>
                ))}
              </HeadRow>

              {renderTableBody()}

              <TableFoot>
                <FootText>{`Showing ${rows.length} of ${total}`}</FootText>
                {queue.data && queue.data.pageCount > 1 && renderPager()}
              </TableFoot>
            </TableCard>

            <SideCol>
              <Panel>
                <PanelHead>
                  <CardH3>Verification queue</CardH3>
                  <PanelCount>{`${pendingCount} pending`}</PanelCount>
                </PanelHead>
                {renderQueue()}
                <FullQueueBtn type="button" onClick={() => go("/admin/pending-users")}>
                  Open full queue
                  <Icon name="arrow" size={12} />
                </FullQueueBtn>
              </Panel>

              <Panel>
                <PanelHead>
                  <CardH3>External services</CardH3>
                </PanelHead>
                {renderServices()}
              </Panel>

              <FeedCard>
                <FeedHead>
                  <FeedTitle>Live feed</FeedTitle>
                  <FeedPulse className="pulse" />
                </FeedHead>
                {renderFeed()}
              </FeedCard>
            </SideCol>
          </Body>
        </Content>
      </Main>
    </Shell>
  );
};

AdminOverview.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default withRouter(AdminOverview);
