# Find a ride — V1 Split: audit + implementation spec

**Date:** 2026-08-17
**Source of truth:** claude.ai design project `carpool`
(`d0e82d14-83e7-4a94-93f2-4823dfb3fbe4`), `screens/find-rides.jsx` →
`FindRidesSplit`, plus `design_handoff_carpool_web/README.md` section 2.
**Target:** `app/imports/ui/mobile/pages/Marketplace.jsx` (route `/find`)

The handoff calls this screen "highest leverage" and recommends V1 Split for
production over V2 Cards and V3 Timeline.

---

## Verdict

The existing screen is **already V1 Split**, not a different variant. It was
ported faithfully — layout, pin placement and card anatomy match the design
closely, and it is wired to real Meteor data where the design used fake
arrays. This is a gap-closing job, not a rebuild.

Roughly 70% of the screen is done. The remaining 30% is concentrated in one
area: **the search panel**, which is structurally the wrong component.

---

## Already correct — do not touch

| Element | Evidence |
|---|---|
| Split layout | `grid-template-columns: 1fr 440px`, matches "map left flex-1, 440px list right" |
| List pane surface | `--cream-0` bg, `1px solid --glass-stroke` left border |
| Map pin placement | All five at the design's exact coordinates: 22/68, 48/36, 72/58, 36/20, 62/78 |
| Map pin colours | signal-yellow, sky, leaf, plum, amber — exact, in order |
| List header | eyebrow `RESULTS · N RIDES`, then title row + sort control |
| Map controls | Glass cluster, zoom in / divider / zoom out, right side |
| RideCard anatomy | time eyebrow, from, arrowDown + to, fare + `PER SEAT`, rule, avatar + name, seat pill |
| RideCard states | active = cream-0 + 1.5px yellow border; idle = rgba(255,255,255,0.7) + glass-stroke |
| Seat pill | `oklch(0.93 0.06 152)` / `oklch(0.4 0.13 152)` when seats remain, cream-2 when none |
| Real data | `rides.forMySchool` + `profiles.displayNames`, filtered to joinable rides |

---

## Gaps

Severity: **P1** blocks visual parity, **P2** visible but secondary,
**P3** polish.

### P1-a — Search panel is the wrong component

The single biggest gap. The design's panel is a **route entry** control; ours
is a **text filter**.

Design (`glass-strong`, `top: 92, left: 24`, width 360, radius 24, padding 14):

- Vertical indicator column: 9px yellow dot (2px white border, 1px yellow
  ring), then a 2px x 16px `--ink-4` bar at 0.4 opacity, then a `pin` icon at 12px
- Two stacked fields, each with an `eyebrow` label above a 14.5px/600 value:
  - `FROM` — "Hewitt Quad · East gate"
  - `TO` — "Logan Airport · Term. C"
  - Divider: `1px solid --glass-stroke` under the FROM row only
- Trailing `btn btn-icon` on `--cream-2` with the `arrow` glyph (swaps origin
  and destination)

Ours: one `SearchBox` with a magnifier and a free-text `SearchInput` bound to
`query`, matching on origin/destination substrings.

**This is a behaviour change, not just a restyle.** Free-text filtering across
all rides is genuinely useful and the design has no equivalent. See Open
questions.

### P1-b — Filter chips missing

The design renders a chip row directly under the search fields, 6px gap,
wrapping:

`Fri afternoon` (active), `Any time`, `<= $10`, `+ filter`

`chipActive` and `chipCoral` now exist in `tokens.js` (added 2026-08-17), so
this is styling-ready. It needs query state behind it.

### P1-c — TopNav not over the map

The design mounts `<TopNav active="find" />` inside the map pane so it floats
over the map, and pushes the search panel and map controls to `top: 92` to
clear it.

`TopNavAuto` now mounts TopNav globally in `layouts/App.jsx` with a
`NavSpacer` reserving 76px. On this screen that spacer pushes the map down
instead of letting it run full-bleed underneath.

**Fix:** let `/find` opt out of the spacer and render the nav over the map.

### P2-a — Highlight route polyline

The design draws a fixed bezier with a two-pass stroke:

```
M 130 460 Q 280 380 360 320 T 540 240
  pass 1: #fff, strokeWidth 6, opacity 0.95   (halo)
  pass 2: var(--coral-deep), strokeWidth 3    (line)
```

Ours reuses `<RouteLine>` (white 2.2 + dashed yellow 1.2 in a `0 0 100 100`
viewBox) and only when a card is selected. Different weight, plus a dash the
design does not use here.

### P2-b — "Center on me" pill missing

Design: glass pill at `bottom: 24, right: 24`, padding 10px/14px, pill radius,
13px/600 label, preceded by a 9px `--sky` dot carrying `.pulse`.

### P2-c — List title is static

The design shows the active route — `Hewitt → Logan` — reflecting the FROM/TO
values. Ours is hard-coded "Find a ride". Depends on P1-a.

### P2-d — Sort control is decorative

Design: `Sort: Soonest ↓`, with the label in `--ink-3` and the value in
`--ink-1`. Ours drops the "Sort:" label and has no `onClick` — the list is
always date-ascending.

### P3-a — RideCard driver sub-line

The design shows `{year} · {dept}` (e.g. "Senior · Bio") at 11px `--ink-3`
under the driver name. **Blocked on schema** — see Data gaps.

### P3-b — RideCard duration and distance

The design shows a mono `52 min · 24.1 mi` line left of the seat pill.
**Blocked on data** — see Data gaps.

### P3-c — RideCard idle inset highlight

The design's idle state carries `box-shadow: 0 1px 0 rgba(255,255,255,0.5)
inset`. Ours has no idle shadow.

---

## Data gaps

The design's `ROUTES` fixtures carry fields our schema does not.

| Design field | Status | Needed for |
|---|---|---|
| `dur` (`52 min`) | **absent** from `Rides` | P3-b |
| `dist` (`24.1 mi`) | **absent** from `Rides` | P3-b |
| `year` (`Senior`) | **absent** from `Profiles` | P3-a |
| `dept` (`Bio`) | **absent** from `Profiles` | P3-a |
| `note` | present as `Rides.notes` | not used by the V1 card (V3 / detail only) |
| `price` | present as `Rides.fare` | done |

`Rides` currently has: `schoolId, driver, riders, origin, destination, date,
seats, fare, shareCode, notes, createdAt`.
`Profiles` currently has: `Name, Location, Image, Ride, Phone`.

Duration and distance would normally come from OSRM (`osrm.carp.school`) —
**currently unreachable, the domain has expired.** Options: denormalise onto
the ride at creation, compute client-side per card, or defer.

`year` / `dept` were already proposed in `TODO.md` under "School Registration
Simplification Plan" (step 2: School year dropdown, Major/Department) but were
never added to the schema.

---

## Deliberate deviations to keep

1. **Active card shadow colour.** Design: `rgba(217, 119, 87, 0.3)` — that is
   the *old coral*, left over from before the yellow pivot; the design's own
   comments call the `--coral` name historical. Ours uses
   `rgba(224, 168, 0, 0.3)`, derived from `--signal-yellow-deep`.
   **Keep ours** — the design value is a stale artefact.

2. **Responsive breakpoint.** Ours collapses to one column with a 240px map at
   900px. The design is fixed-width desktop only. **Keep ours** — the app
   ships on mobile web.

3. **Real data over fixtures.** Ours filters out the user's own rides and full
   rides. The design has no such logic. **Keep ours.**

---

## Implementation plan

Ordered so each step is independently shippable and verifiable.

**Step 1 — TopNav over the map (P1-c)**
`layouts/App.jsx`, `components/TopNavAuto.jsx`, `styles/TopNav.js`
Add an opt-out so full-bleed map routes suppress `NavSpacer`; drive it from a
route list rather than a prop drilled through pages.
*Verify:* nav floats over the map at `/find`; other pages keep their offset.

**Step 2 — Route search panel (P1-a)**
`mobile/styles/Marketplace.js`, `mobile/pages/Marketplace.jsx`
Add `RouteIndicator`, `RouteFields`, `FieldRow`, `FieldLabel`, `FieldValue`,
`SwapBtn`. Replace `SearchBox` / `SearchInput`. Move the panel to
`top: 92, left: 24`.
*Verify:* computed styles match the dot/bar/pin spec; swap reverses the fields.

**Step 3 — Filter chips (P1-b)**
Same files, using `chipActive` from `tokens.js`. Wire to the existing
`filtered` memo: time-window and max-fare predicates.
*Verify:* each chip narrows the result count and the eyebrow updates.

**Step 4 — Route polyline and "Center on me" (P2-a, P2-b)**
`mobile/pages/Marketplace.jsx`, `mobile/styles/Marketplace.js`
Two-pass stroke at the design's path; glass pill bottom-right with `.pulse`.
*Verify:* stroke widths 6/3 and colours match; pulse animates.

**Step 5 — List title and sort (P2-c, P2-d)**
Title reflects FROM → TO. Make sort a real toggle (Soonest / Cheapest).
*Verify:* toggling reorders the list.

**Step 6 — RideCard polish (P3-c)**
`styles/RideCard.js` — add the idle inset highlight.

**Step 7 — Deferred, needs schema work (P3-a, P3-b)**
Add `Profiles.year` / `Profiles.dept`; decide the duration/distance source.
Do not start until the schema questions below are answered.

---

## Verification

No test framework exists in this repo, so per-step verification is:

- `npm run lint` — no *new* errors (baseline is 948 pre-existing across
  `imports/`; compare per-file against `main`)
- Load `/find` and compare computed styles against the values quoted above
  rather than eyeballing screenshots
- Confirm no new console errors, especially React unknown-prop warnings

**Blocked:** `/find` sits behind `AuthRoute`, and sign-up currently stops at a
Cloudflare human-verification challenge. Visual verification of this screen
requires a signed-in session.

---

## Open questions

1. **Free-text search.** The design replaces it with FROM/TO route entry. Keep
   text search as well (for example behind `+ filter`), or drop it?
2. **Do FROM/TO filter, or just describe?** In the design they are static
   display values. Should they be real inputs bound to `Places`, and should
   they drive the query?
3. **Duration and distance.** Denormalise onto the ride at creation, compute
   client-side, or defer until OSRM is reachable again?
4. **`year` / `dept`.** Add to `Profiles` now (which also completes the
   TODO.md onboarding plan), or ship the card without the sub-line?
