/**
 * The admin area's sections, in one place.
 *
 * Both the admin dashboard's side nav and the top nav pill render this list.
 * They used to define their own, which is how the two came to disagree about
 * what the admin area even contains.
 *
 * Counts are deliberately absent: only the dashboard subscribes to the stats
 * that produce them, so it decorates these entries with `count` itself via
 * `countKey`. Everything here is static so any screen can render the list
 * without loading admin data first.
 */

export const ADMIN_NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "grid", path: "/admin/overview" },
  { id: "rides", label: "Rides", icon: "car", path: "/admin/rides", countKey: "rides" },
  { id: "users", label: "Users", icon: "user", path: "/admin/users", countKey: "users" },
  {
    id: "queue",
    label: "Verification queue",
    icon: "check",
    path: "/admin/pending-users",
  },
  {
    id: "reports",
    label: "Reports",
    icon: "flame",
    path: "/admin/error-reports",
    countKey: "reports",
    danger: true,
  },
  { id: "places", label: "Places", icon: "pin", path: "/admin/places", countKey: "places" },
  {
    id: "schools",
    label: "Schools",
    icon: "school",
    path: "/admin/schools",
    countKey: "schools",
    systemOnly: true,
  },
  { id: "system", label: "System health", icon: "settings", path: "/system", systemOnly: true },
];

/** The sections a given user may see. System-only entries need the system role. */
export const adminNavFor = isSystem => ADMIN_NAV_ITEMS
  .filter(item => !item.systemOnly || isSystem);

/**
 * Which section a path belongs to, or "" for an admin page that is not itself
 * a section (an error report's detail page, say).
 *
 * Longest path wins, so /admin/pending-users cannot be claimed by a shorter
 * sibling that happens to prefix it.
 */
export const adminSectionFor = (pathname) => {
  const match = [...ADMIN_NAV_ITEMS]
    .sort((a, b) => b.path.length - a.path.length)
    .find(item => pathname.startsWith(item.path));
  return match ? match.id : "";
};

/** Path for a section id, for nav handlers that work in ids. */
export const adminPathFor = (id) => {
  const item = ADMIN_NAV_ITEMS.find(entry => entry.id === id);
  return item ? item.path : null;
};
