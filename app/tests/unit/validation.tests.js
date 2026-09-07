import { expect } from "chai";
import { createCoordinatesSchema } from "../../imports/ui/utils/validation";

describe("validation", function () {
  describe("createCoordinatesSchema (coordinates validator)", function () {
    const schema = createCoordinatesSchema();

    it("accepts a well-formed, in-range 'lat,lng' pair", function () {
      const { error } = schema.validate("49.2827,-123.1207");
      expect(error).to.equal(undefined);
    });

    it("rejects an out-of-range coordinate pair", function () {
      // This is the requirement this test suite was asked to document: the
      // coordinates validator must reject values outside lat [-90, 90] /
      // lng [-180, 180], not just check the string shape. It is backed by
      // imports/api/places/placeCoords.js#validateCoordinates, which now
      // range-checks rather than pattern-matches.
      const { error } = schema.validate("999,999");
      expect(error, "expected the coordinates schema to reject an out-of-range pair").to.exist;
    });

    it("rejects non-numeric input", function () {
      const { error } = schema.validate("abc,def");
      expect(error).to.exist;
    });

    it("rejects a malformed pair (wrong number of parts)", function () {
      const { error } = schema.validate("1,2,3");
      expect(error).to.exist;
    });
  });
});
