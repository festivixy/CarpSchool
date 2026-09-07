import { expect } from "chai";

/**
 * Reference implementation of the discovery matching semantics that live
 * inline in imports/ui/mobile/pages/Marketplace.jsx (routeOf + the
 * `filtered` useMemo). Reproduced here rather than imported because the
 * real logic is embedded in a React component, not exported as a testable
 * unit.
 *
 * NEEDS OTHER OWNER: Marketplace.jsx should extract this into a shared,
 * exported helper -- proposed at imports/ui/utils/rideMatching.js as
 * `matchesRoute(ride, { fromPlace, toPlace, query })` returning boolean --
 * so this logic is tested against the real implementation instead of a
 * parallel copy that can drift from it.
 */
const routeOf = ride => [
  ride.origin,
  ...(ride.stops || []),
  ride.destination,
].filter(Boolean);

const matchesRoute = (ride, { fromPlace = "", toPlace = "", query = "" } = {}) => {
  const route = routeOf(ride);
  const q = query.trim().toLowerCase();

  const fromIndex = fromPlace ? route.indexOf(fromPlace) : -1;
  const toIndex = toPlace ? route.lastIndexOf(toPlace) : -1;

  if (fromPlace && (fromIndex === -1 || fromIndex === route.length - 1)) return false;
  if (toPlace && toIndex <= 0) return false;
  if (fromPlace && toPlace && fromIndex >= toIndex) return false;
  if (q && !route.some(name => name.toLowerCase().includes(q))) return false;

  return true;
};

describe("marketplace route matching (reference semantics)", function () {
  // A ride that stops along the way: A -> S1 -> S2 -> B
  const stoppedRide = { origin: "A", stops: ["S1", "S2"], destination: "B" };
  // A ride with no stops: A -> B
  const directRide = { origin: "A", stops: [], destination: "B" };

  it("1. A -> B on a stopped ride matches", function () {
    expect(matchesRoute(stoppedRide, { fromPlace: "A", toPlace: "B" })).to.equal(true);
  });

  it("2. boarding at stop S1, riding to B matches", function () {
    expect(matchesRoute(stoppedRide, { fromPlace: "S1", toPlace: "B" })).to.equal(true);
  });

  it("3. A to S2 matches", function () {
    expect(matchesRoute(stoppedRide, { fromPlace: "A", toPlace: "S2" })).to.equal(true);
  });

  it("4. S1 -> S2 matches", function () {
    expect(matchesRoute(stoppedRide, { fromPlace: "S1", toPlace: "S2" })).to.equal(true);
  });

  it("5. S2 -> S1 does not match (backwards)", function () {
    expect(matchesRoute(stoppedRide, { fromPlace: "S2", toPlace: "S1" })).to.equal(false);
  });

  it("6. boarding at the final stop B does not match (nowhere to go)", function () {
    expect(matchesRoute(stoppedRide, { fromPlace: "B", toPlace: "" })).to.equal(false);
  });

  it("7. alighting at the origin A does not match", function () {
    expect(matchesRoute(stoppedRide, { fromPlace: "", toPlace: "A" })).to.equal(false);
  });

  it("8. A to A does not match", function () {
    expect(matchesRoute(stoppedRide, { fromPlace: "A", toPlace: "A" })).to.equal(false);
  });

  it("9. text search 's2' matches a stop name", function () {
    expect(matchesRoute(stoppedRide, { query: "s2" })).to.equal(true);
  });

  it("10. text search 'zz' does not match", function () {
    expect(matchesRoute(stoppedRide, { query: "zz" })).to.equal(false);
  });

  it("11. boarding at S1 on a direct (no-stop) ride does not match", function () {
    expect(matchesRoute(directRide, { fromPlace: "S1", toPlace: "" })).to.equal(false);
  });

  it("12. direct ride A -> B matches", function () {
    expect(matchesRoute(directRide, { fromPlace: "A", toPlace: "B" })).to.equal(true);
  });
});
