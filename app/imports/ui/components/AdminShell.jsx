import React from "react";
import PropTypes from "prop-types";
import AdminSidebar from "./AdminSidebar";
import { Shell, Main } from "../styles/AdminShell";

/**
 * The frame every admin screen sits in.
 *
 * Applied by the admin route guards rather than by each screen, because when
 * it was left to the screens exactly one of the nine grew a sidebar and the
 * rest rendered a bare container -- clicking a nav entry made the navigation
 * disappear. Wrapping at the route means a new admin page cannot forget it.
 *
 * Below 820px the rail becomes a horizontal strip above the content, which is
 * the only admin navigation on a phone: the top nav that carries the section
 * pills on desktop is not rendered at that width.
 */
const AdminShell = ({ children, counts }) => (
  <Shell>
    <AdminSidebar counts={counts} />
    <Main>{children}</Main>
  </Shell>
);

AdminShell.propTypes = {
  children: PropTypes.node,
  counts: PropTypes.object,
};

AdminShell.defaultProps = {
  children: null,
  counts: null,
};

export default AdminShell;
