import { expect } from "chai";
import { parsePlaceValue, formatPlaceValue, canEditPlace } from "../../ui/utils/placeCoords";

describe("placeCoords", function () {
  describe("parsePlaceValue", function () {
    // Structurally unreadable or out-of-range inputs: always null.
    const alwaysNull = [
      "", "abc", "1", "1,2,3", "999,999", null, undefined, 42,
      // A trailing non-numeric suffix is rejected outright (Number, not
      // parseFloat, is used to parse each half).
      "12abc,-123",
    ];

    alwaysNull.forEach((input) => {
      it(`returns null for ${JSON.stringify(input)}`, function () {
        expect(parsePlaceValue(input)).to.equal(null);
      });
    });

    it("parses a valid 'lat,lng' pair", function () {
      expect(parsePlaceValue("49.282700,-123.120700")).to.deep.equal({
        lat: 49.2827,
        lng: -123.1207,
      });
    });

    it("tolerates surrounding whitespace around each half", function () {
      expect(parsePlaceValue(" 49.3 , -123.1 ")).to.deep.equal({ lat: 49.3, lng: -123.1 });
    });
  });

  describe("formatPlaceValue", function () {
    it("formats to six decimal places, comma-joined with no space", function () {
      expect(formatPlaceValue(49.2827, -123.1207)).to.equal("49.282700,-123.120700");
    });

    it("round-trips through parsePlaceValue", function () {
      const formatted = formatPlaceValue(12.345678, -98.765432);
      expect(parsePlaceValue(formatted)).to.deep.equal({ lat: 12.345678, lng: -98.765432 });
    });

    it("produces a value parsePlaceValue accepts for zero and negative coordinates", function () {
      expect(parsePlaceValue(formatPlaceValue(0, 0))).to.deep.equal({ lat: 0, lng: 0 });
      expect(parsePlaceValue(formatPlaceValue(-49.2827, 123.1207)))
        .to.deep.equal({ lat: -49.2827, lng: 123.1207 });
    });
  });

  describe("canEditPlace", function () {
    const place = { createdBy: "user1" };

    it("returns false when place or userId is missing", function () {
      expect(canEditPlace(null, "user1")).to.equal(false);
      expect(canEditPlace(place, null)).to.equal(false);
    });

    it("returns true for the place's creator", function () {
      expect(canEditPlace(place, "user1")).to.equal(true);
    });

    it("returns false for a non-creator without admin", function () {
      expect(canEditPlace(place, "user2")).to.equal(false);
    });

    it("returns true for a non-creator with admin", function () {
      expect(canEditPlace(place, "user2", true)).to.equal(true);
    });
  });
});
