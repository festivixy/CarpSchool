import { expect } from "chai";
import {
  zonedNow,
  slotIsOpenAt,
  minutesUntilOpen,
  formatMinutes,
  formatSlot,
  slotRangeError,
  slotsOverlap,
  MINUTES_IN_DAY,
} from "../../api/availability/availabilityTime";

/*
 * The production server runs in UTC while the school does not, so these cover
 * the zone conversion with fixed instants rather than the machine clock, and
 * include a summer date to catch a daylight-saving offset being ignored.
 */

describe("availabilityTime", function () {
  describe("zonedNow", function () {
    it("reads the local weekday and minute in winter (UTC-8)", function () {
      // Monday 2026-01-05, 16:30 UTC => 08:30 Monday in Vancouver (PST).
      const at = new Date("2026-01-05T16:30:00Z");
      expect(zonedNow("America/Vancouver", at)).to.deep.equal({
        dayOfWeek: 1,
        minutes: (8 * 60) + 30,
      });
    });

    it("respects daylight saving in summer (UTC-7)", function () {
      // Monday 2026-07-06, 15:30 UTC => 08:30 Monday in Vancouver (PDT).
      const at = new Date("2026-07-06T15:30:00Z");
      expect(zonedNow("America/Vancouver", at)).to.deep.equal({
        dayOfWeek: 1,
        minutes: (8 * 60) + 30,
      });
    });

    it("rolls back to the previous day when local time is behind UTC midnight", function () {
      // Monday 2026-01-05, 03:00 UTC => 19:00 Sunday in Vancouver.
      const at = new Date("2026-01-05T03:00:00Z");
      expect(zonedNow("America/Vancouver", at)).to.deep.equal({
        dayOfWeek: 0,
        minutes: 19 * 60,
      });
    });

    it("reports local midnight as minute zero, not 1440", function () {
      // 08:00 UTC => 00:00 in Vancouver (PST).
      const at = new Date("2026-01-05T08:00:00Z");
      expect(zonedNow("America/Vancouver", at).minutes).to.equal(0);
    });

    it("gives a different answer in a different zone for the same instant", function () {
      const at = new Date("2026-01-05T16:30:00Z");
      const vancouver = zonedNow("America/Vancouver", at);
      const toronto = zonedNow("America/Toronto", at);
      expect(toronto.minutes - vancouver.minutes).to.equal(3 * 60);
    });
  });

  describe("slotIsOpenAt", function () {
    const slot = { dayOfWeek: 1, startMinutes: 480, endMinutes: 540 };

    it("is open at the start and inside the window", function () {
      expect(slotIsOpenAt(slot, { dayOfWeek: 1, minutes: 480 })).to.equal(true);
      expect(slotIsOpenAt(slot, { dayOfWeek: 1, minutes: 500 })).to.equal(true);
    });

    it("is closed at the end, so back-to-back slots never both open", function () {
      expect(slotIsOpenAt(slot, { dayOfWeek: 1, minutes: 540 })).to.equal(false);
      const next = { dayOfWeek: 1, startMinutes: 540, endMinutes: 600 };
      expect(slotIsOpenAt(next, { dayOfWeek: 1, minutes: 540 })).to.equal(true);
    });

    it("is closed on another day at the same time", function () {
      expect(slotIsOpenAt(slot, { dayOfWeek: 2, minutes: 500 })).to.equal(false);
    });
  });

  describe("minutesUntilOpen", function () {
    const slot = { dayOfWeek: 1, startMinutes: 480, endMinutes: 540 };

    it("is zero while open", function () {
      expect(minutesUntilOpen(slot, { dayOfWeek: 1, minutes: 500 })).to.equal(0);
    });

    it("counts forward later the same day", function () {
      expect(minutesUntilOpen(slot, { dayOfWeek: 1, minutes: 400 })).to.equal(80);
    });

    it("wraps to next week once the window has passed today", function () {
      expect(minutesUntilOpen(slot, { dayOfWeek: 1, minutes: 600 }))
        .to.equal((7 * MINUTES_IN_DAY) - 600 + 480);
    });

    it("counts forward across days", function () {
      // Sunday 23:00 to Monday 08:00 is 9 hours.
      expect(minutesUntilOpen(slot, { dayOfWeek: 0, minutes: 23 * 60 })).to.equal(9 * 60);
    });
  });

  describe("formatting", function () {
    it("pads hours and minutes", function () {
      expect(formatMinutes(485)).to.equal("08:05");
      expect(formatMinutes(0)).to.equal("00:00");
      expect(formatMinutes(23 * 60)).to.equal("23:00");
    });

    it("summarises a slot", function () {
      expect(formatSlot({ dayOfWeek: 1, startMinutes: 480, endMinutes: 540 }))
        .to.equal("Mon 08:00-09:00");
    });
  });

  describe("slotRangeError", function () {
    it("accepts a normal window", function () {
      expect(slotRangeError(480, 540)).to.equal(null);
    });

    it("rejects an end at or before the start, including overnight", function () {
      expect(slotRangeError(540, 540)).to.be.a("string");
      expect(slotRangeError(22 * 60, 2 * 60)).to.be.a("string");
    });

    it("rejects values outside a single day and non-integers", function () {
      expect(slotRangeError(-1, 540)).to.be.a("string");
      expect(slotRangeError(480, MINUTES_IN_DAY + 1)).to.be.a("string");
      expect(slotRangeError(4.5, 540)).to.be.a("string");
    });
  });

  describe("slotsOverlap", function () {
    const base = { dayOfWeek: 1, startMinutes: 480, endMinutes: 540 };

    it("detects a genuine overlap", function () {
      expect(slotsOverlap(base, { dayOfWeek: 1, startMinutes: 500, endMinutes: 560 })).to.equal(true);
    });

    it("allows touching windows", function () {
      expect(slotsOverlap(base, { dayOfWeek: 1, startMinutes: 540, endMinutes: 600 })).to.equal(false);
    });

    it("ignores the same window on another day", function () {
      expect(slotsOverlap(base, { dayOfWeek: 2, startMinutes: 480, endMinutes: 540 })).to.equal(false);
    });
  });
});
