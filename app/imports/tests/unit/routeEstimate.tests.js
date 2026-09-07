import { expect } from "chai";
import {
  parseCoords,
  haversineMiles,
  estimateRoute,
  estimateRouteVia,
  formatDuration,
  formatDistance,
} from "../../api/ride/routeEstimate";

describe("routeEstimate", function () {
  describe("parseCoords", function () {
    it("parses a valid 'lat,lng' string", function () {
      expect(parseCoords("49.2827,-123.1207")).to.deep.equal({ lat: 49.2827, lng: -123.1207 });
    });

    it("returns null for non-string input", function () {
      expect(parseCoords(null)).to.equal(null);
      expect(parseCoords(undefined)).to.equal(null);
      expect(parseCoords(42)).to.equal(null);
    });

    it("returns null when the string is malformed", function () {
      expect(parseCoords("")).to.equal(null);
      expect(parseCoords("abc")).to.equal(null);
      expect(parseCoords("1")).to.equal(null);
      expect(parseCoords("1,2,3")).to.equal(null);
    });

    it("returns null for out-of-range values", function () {
      expect(parseCoords("999,999")).to.equal(null);
    });
  });

  describe("haversineMiles", function () {
    it("returns 0 for identical points", function () {
      const p = { lat: 49.2827, lng: -123.1207 };
      expect(haversineMiles(p, p)).to.equal(0);
    });

    it("returns null when either point is missing", function () {
      expect(haversineMiles(null, { lat: 1, lng: 1 })).to.equal(null);
      expect(haversineMiles({ lat: 1, lng: 1 }, null)).to.equal(null);
    });

    it("computes a known great-circle distance (Vancouver to Burnaby)", function () {
      // Roughly 8 miles apart -- verify it's in the right ballpark rather
      // than pinning to a fragile exact figure.
      const vancouver = { lat: 49.2827, lng: -123.1207 };
      const burnaby = { lat: 49.2488, lng: -122.9805 };
      const miles = haversineMiles(vancouver, burnaby);
      expect(miles).to.be.a("number");
      expect(miles).to.be.within(5, 12);
    });

    it("computes a known long-haul distance (Vancouver to Toronto ~ 2080 mi)", function () {
      const vancouver = { lat: 49.2827, lng: -123.1207 };
      const toronto = { lat: 43.6532, lng: -79.3832 };
      const miles = haversineMiles(vancouver, toronto);
      expect(miles).to.be.within(2000, 2150);
    });
  });

  describe("estimateRoute", function () {
    it("returns null when either leg is unparsable", function () {
      expect(estimateRoute("bad", "49.2827,-123.1207")).to.equal(null);
      expect(estimateRoute("49.2827,-123.1207", "bad")).to.equal(null);
    });

    it("returns a distance/duration pair for two valid points", function () {
      const result = estimateRoute("49.2827,-123.1207", "49.2488,-122.9805");
      expect(result).to.have.keys(["distanceMi", "durationMin"]);
      expect(result.distanceMi).to.be.a("number").greaterThan(0);
      expect(result.durationMin).to.be.a("number").greaterThan(0);
    });
  });

  describe("estimateRouteVia", function () {
    it("returns null for fewer than two points", function () {
      expect(estimateRouteVia([])).to.equal(null);
      expect(estimateRouteVia(["49.2827,-123.1207"])).to.equal(null);
      expect(estimateRouteVia(null)).to.equal(null);
    });

    it("returns null when any leg is unreadable", function () {
      const values = ["49.2827,-123.1207", "bad", "49.2488,-122.9805"];
      expect(estimateRouteVia(values)).to.equal(null);
    });

    it("sums legs across three points, roughly matching two direct legs summed", function () {
      const a = "49.2827,-123.1207";
      const b = "49.2600,-123.0500";
      const c = "49.2488,-122.9805";

      const via = estimateRouteVia([a, b, c]);
      const leg1 = estimateRoute(a, b);
      const leg2 = estimateRoute(b, c);

      expect(via).to.not.equal(null);
      expect(via.distanceMi).to.equal(
        Math.round((leg1.distanceMi + leg2.distanceMi) * 10) / 10,
      );
      expect(via.durationMin).to.equal(leg1.durationMin + leg2.durationMin);
    });
  });

  describe("formatDuration", function () {
    it("formats minutes under an hour", function () {
      expect(formatDuration(52)).to.equal("52 min");
    });

    it("formats whole hours with no minutes", function () {
      expect(formatDuration(120)).to.equal("2h");
    });

    it("formats hours with remaining minutes", function () {
      expect(formatDuration(110)).to.equal("1h 50");
    });

    it("returns null for non-positive or non-finite input", function () {
      expect(formatDuration(0)).to.equal(null);
      expect(formatDuration(-5)).to.equal(null);
      expect(formatDuration(NaN)).to.equal(null);
    });
  });

  describe("formatDistance", function () {
    it("formats miles to one decimal", function () {
      expect(formatDistance(24.12)).to.equal("24.1 mi");
    });

    it("returns null for non-positive or non-finite input", function () {
      expect(formatDistance(0)).to.equal(null);
      expect(formatDistance(-1)).to.equal(null);
      expect(formatDistance(NaN)).to.equal(null);
    });
  });
});
