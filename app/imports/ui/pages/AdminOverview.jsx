import React from "react";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { Profiles } from "../../api/profile/Profile";
import Logo from "../components/Logo";
import {
  Shell,
  Sidebar,
  Brand,
  Tag,
  NavItem,
  Main,
  Header,
  Eyebrow,
  Title,
  StatRow,
  StatCard,
  StatValue,
  StatLabel,
  Grid,
  Card,
  CardTitle,
  QueueItem,
  QName,
  ReviewBtn,
  ServiceRow,
  Dot,
  Mono,
  Empty,
} from "../styles/AdminOverview";

const NAV = [
  { id: "overview", label: "Overview", path: "/admin/overview" },
  { id: "users", label: "Users", path: "/admin/users" },
  { id: "pending", label: "Verification queue", path: "/admin/pending-users" },
  { id: "rides", label: "Rides", path: "/admin/rides" },
  { id: "places", label: "Places", path: "/admin/places" },
  { id: "reports", label: "Reports", path: "/admin/error-reports" },
];

const SERVICES = [
  { name: "tileserver.carp.school", role: "Map tiles" },
  { name: "nominatim.carp.school", role: "Geocoding" },
  { name: "osrm.carp.school", role: "Routing" },
];

const AdminOverview = ({ history }) => {
  const { ready, pending } = useTracker(() => {
    const sub = Meteor.subscribe("admin.pendingUsers");
    return {
      ready: sub.ready(),
      pending: Profiles.find({
        requested: true,
        verified: { $ne: true },
        rejected: { $ne: true },
      }).fetch(),
    };
  }, []);

  const go = path => history.push(path);

  let queueNode;
  if (!ready) {
    queueNode = <Empty>Loading…</Empty>;
  } else if (pending.length === 0) {
    queueNode = <Empty>No pending approvals.</Empty>;
  } else {
    queueNode = pending.slice(0, 8).map(p => (
      <QueueItem key={p._id}>
        <QName>{p.Name || "Unnamed student"}</QName>
        <ReviewBtn type="button" onClick={() => go("/admin/pending-users")}>Review</ReviewBtn>
      </QueueItem>
    ));
  }

  return (
    <Shell>
      <Sidebar>
        <Brand>
          <Logo size={20} wordmark={false} />
          Admin
          <Tag>OPS</Tag>
        </Brand>
        {NAV.map(n => (
          <NavItem key={n.id} type="button" $active={n.id === "overview"} onClick={() => go(n.path)}>
            {n.label}
          </NavItem>
        ))}
      </Sidebar>

      <Main>
        <Header>
          <Eyebrow>ADMIN</Eyebrow>
          <Title>Overview</Title>
        </Header>

        <StatRow>
          <StatCard>
            <StatValue $accent="var(--signal-yellow-deep)">{ready ? pending.length : "—"}</StatValue>
            <StatLabel>PENDING APPROVALS</StatLabel>
          </StatCard>
          <StatCard $link onClick={() => go("/admin/users")}>
            <StatValue>›</StatValue>
            <StatLabel>MANAGE USERS</StatLabel>
          </StatCard>
          <StatCard $link onClick={() => go("/admin/rides")}>
            <StatValue>›</StatValue>
            <StatLabel>MANAGE RIDES</StatLabel>
          </StatCard>
          <StatCard $link onClick={() => go("/admin/schools")}>
            <StatValue>›</StatValue>
            <StatLabel>SCHOOLS</StatLabel>
          </StatCard>
        </StatRow>

        <Grid>
          <Card>
            <CardTitle>VERIFICATION QUEUE</CardTitle>
            {queueNode}
          </Card>
          <Card>
            <CardTitle>EXTERNAL SERVICES</CardTitle>
            {SERVICES.map(s => (
              <ServiceRow key={s.name}>
                <Dot />
                <span>{s.role}</span>
                <Mono>{s.name}</Mono>
              </ServiceRow>
            ))}
          </Card>
        </Grid>
      </Main>
    </Shell>
  );
};

AdminOverview.propTypes = {
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

export default withRouter(AdminOverview);
