import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Availabilities, AvailabilitySchema } from "./Availability";
import { Places } from "../places/Places";
import { Schools } from "../schools/Schools";
import { assertProfileApproved } from "../profile/approvalGuard";
import { validateUserCanCreateRide } from "../ride/RideValidation";
import {
  DEFAULT_TIMEZONE,
  MINUTES_IN_DAY,
  zonedNow,
  slotIsOpenAt,
  minutesUntilOpen,
  slotRangeError,
  slotsOverlap,
} from "./availabilityTime";

/**
 * Driver availability: a weekly schedule, plus an instant "available now".
 *
 * Every write is gated the same way a ride is -- approved profile, not a
 * rider-only account, places belonging to the caller's own school -- because
 * being listed as available is an offer to drive.
 */

const MAX_WEEKLY_SLOTS = 40;
const MAX_NOW_MINUTES = 8 * 60;
const DEFAULT_NOW_MINUTES = 90;

/** The caller's school id, or a thrown error if they have none. */
const schoolIdFor = async (userId) => {
  const user = await Meteor.users.findOneAsync(userId, { fields: { schoolId: 1 } });
  if (!user?.schoolId) {
    throw new Meteor.Error("no-school", "You must belong to a school to set availability.");
  }
  return user.schoolId;
};

const timezoneFor = async (schoolId) => {
  const school = await Schools.findOneAsync(schoolId, { fields: { settings: 1 } });
  return school?.settings?.timezone || DEFAULT_TIMEZONE;
};

/** Both ends of the route must be real places at the caller's own school. */
const assertPlacesInSchool = async (schoolId, ids) => {
  const unique = [...new Set(ids)];
  const found = await Places.find(
    { _id: { $in: unique }, schoolId },
    { fields: { _id: 1 } },
  ).fetchAsync();
  if (found.length !== unique.length) {
    throw new Meteor.Error("invalid-place", "Choose pickup and drop-off points from your school.");
  }
};

/** Approved, and allowed to drive. */
const assertCanOffer = async (userId) => {
  const profile = await assertProfileApproved(userId);
  const roleCheck = validateUserCanCreateRide(profile);
  if (!roleCheck.isValid) {
    throw new Meteor.Error("role-error", roleCheck.error);
  }
  return profile;
};

Meteor.methods({
  /** The caller's own schedule, newest instant first then the weekly grid. */
  async "availability.mine"() {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in.");
    }

    return Availabilities.find(
      { driver: this.userId },
      { sort: { kind: 1, dayOfWeek: 1, startMinutes: 1 }, limit: MAX_WEEKLY_SLOTS + 1 },
    ).fetchAsync();
  },

  async "availability.addWeekly"(slot) {
    check(slot, {
      dayOfWeek: Match.Integer,
      startMinutes: Match.Integer,
      endMinutes: Match.Integer,
      origin: String,
      destination: String,
      seats: Match.Optional(Match.Integer),
      note: Match.Optional(String),
    });

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in.");
    }
    await assertCanOffer(this.userId);

    if (slot.dayOfWeek < 0 || slot.dayOfWeek > 6) {
      throw new Meteor.Error("invalid-slot", "Choose a day of the week.");
    }
    const rangeError = slotRangeError(slot.startMinutes, slot.endMinutes);
    if (rangeError) {
      throw new Meteor.Error("invalid-slot", rangeError);
    }

    const schoolId = await schoolIdFor(this.userId);
    await assertPlacesInSchool(schoolId, [slot.origin, slot.destination]);

    const existing = await Availabilities.find(
      { driver: this.userId, kind: "weekly" },
      { fields: { dayOfWeek: 1, startMinutes: 1, endMinutes: 1 } },
    ).fetchAsync();

    if (existing.length >= MAX_WEEKLY_SLOTS) {
      throw new Meteor.Error("too-many", "You have reached the maximum number of weekly slots.");
    }
    if (existing.some(other => slotsOverlap(other, slot))) {
      throw new Meteor.Error("overlapping-slot", "That overlaps a slot you already have.");
    }

    const doc = {
      driver: this.userId,
      schoolId,
      kind: "weekly",
      dayOfWeek: slot.dayOfWeek,
      startMinutes: slot.startMinutes,
      endMinutes: slot.endMinutes,
      origin: slot.origin,
      destination: slot.destination,
      seats: slot.seats || 1,
      note: slot.note || "",
      createdAt: new Date(),
    };

    const { error, value } = AvailabilitySchema.validate(doc);
    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    return Availabilities.insertAsync(value);
  },

  /**
   * Go available right now for a bounded window. Replaces any current instant
   * availability, so pressing it twice never lists a driver twice.
   */
  async "availability.goNow"(options) {
    check(options, {
      origin: String,
      destination: String,
      seats: Match.Optional(Match.Integer),
      minutes: Match.Optional(Match.Integer),
      note: Match.Optional(String),
    });

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in.");
    }
    await assertCanOffer(this.userId);

    const minutes = Math.min(Math.max(options.minutes || DEFAULT_NOW_MINUTES, 15), MAX_NOW_MINUTES);
    const schoolId = await schoolIdFor(this.userId);
    await assertPlacesInSchool(schoolId, [options.origin, options.destination]);

    await Availabilities.removeAsync({ driver: this.userId, kind: "now" });

    const doc = {
      driver: this.userId,
      schoolId,
      kind: "now",
      expiresAt: new Date(Date.now() + (minutes * 60 * 1000)),
      origin: options.origin,
      destination: options.destination,
      seats: options.seats || 1,
      note: options.note || "",
      createdAt: new Date(),
    };

    const { error, value } = AvailabilitySchema.validate(doc);
    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
    }

    return Availabilities.insertAsync(value);
  },

  async "availability.stopNow"() {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in.");
    }
    return Availabilities.removeAsync({ driver: this.userId, kind: "now" });
  },

  /** Remove one of the caller's own slots. */
  async "availability.remove"(availabilityId) {
    check(availabilityId, String);

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in.");
    }

    const slot = await Availabilities.findOneAsync(availabilityId, { fields: { driver: 1 } });
    if (!slot) {
      throw new Meteor.Error("not-found", "That slot no longer exists.");
    }
    if (slot.driver !== this.userId) {
      throw new Meteor.Error("access-denied", "That is not your slot.");
    }

    return Availabilities.removeAsync(availabilityId);
  },

  /**
   * Drivers available at the caller's school right now.
   *
   * Weekly slots are resolved against the school's local time rather than the
   * server clock, which is UTC in production. Expired instant availability is
   * filtered here as well as swept, so a lapsed toggle never shows.
   */
  async "availability.openNow"() {
    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to browse drivers.");
    }
    await assertProfileApproved(this.userId);

    const schoolId = await schoolIdFor(this.userId);
    const timeZone = await timezoneFor(schoolId);
    const moment = zonedNow(timeZone);
    const now = new Date();

    const candidates = await Availabilities.find(
      {
        schoolId,
        $or: [
          { kind: "weekly", dayOfWeek: moment.dayOfWeek },
          { kind: "now", expiresAt: { $gt: now } },
        ],
      },
      { limit: 300 },
    ).fetchAsync();

    const open = candidates.filter(slot => (slot.kind === "now"
      ? slot.expiresAt > now
      : slotIsOpenAt(slot, moment)));

    if (open.length === 0) return [];

    const { Profiles } = await import("../profile/Profile");

    const placeIds = [...new Set(open.flatMap(s => [s.origin, s.destination]))];
    const [places, profiles] = await Promise.all([
      Places.find({ _id: { $in: placeIds } }, { fields: { text: 1 } }).fetchAsync(),
      Profiles.find(
        { Owner: { $in: [...new Set(open.map(s => s.driver))] } },
        { fields: { Owner: 1, Name: 1, Image: 1, UserType: 1 } },
      ).fetchAsync(),
    ]);

    const nameById = Object.fromEntries(places.map(p => [p._id, p.text]));
    const profileByOwner = Object.fromEntries(profiles.map(p => [p.Owner, p]));

    /* Only what the list needs. The availability document itself is never
     * returned wholesale, so nothing about another driver leaks beyond their
     * display name, photo and the route they offered. */
    return open
      .map((slot) => {
        const profile = profileByOwner[slot.driver] || {};
        return {
          _id: slot._id,
          driver: slot.driver,
          driverName: profile.Name || "Driver",
          driverImage: profile.Image || "",
          kind: slot.kind,
          originText: nameById[slot.origin] || "",
          destinationText: nameById[slot.destination] || "",
          seats: slot.seats,
          note: slot.note || "",
          endsAt: slot.kind === "now" ? slot.expiresAt : null,
          endMinutes: slot.kind === "weekly" ? slot.endMinutes : null,
          startMinutes: slot.kind === "weekly" ? slot.startMinutes : null,
          isMine: slot.driver === this.userId,
        };
      })
      .sort((a, b) => a.driverName.localeCompare(b.driverName));
  },

  /**
   * Upcoming slots for the caller's school, for the "later today" section.
   * Bounded to the next `withinMinutes`, defaulting to the rest of the day.
   */
  async "availability.upcoming"(withinMinutes) {
    check(withinMinutes, Match.Optional(Match.Integer));

    if (!this.userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to browse drivers.");
    }
    await assertProfileApproved(this.userId);

    const horizon = Math.min(Math.max(withinMinutes || MINUTES_IN_DAY, 30), MINUTES_IN_DAY * 7);
    const schoolId = await schoolIdFor(this.userId);
    const timeZone = await timezoneFor(schoolId);
    const moment = zonedNow(timeZone);

    const weekly = await Availabilities.find(
      { schoolId, kind: "weekly" },
      { limit: 300 },
    ).fetchAsync();

    return weekly
      .map(slot => ({ slot, inMinutes: minutesUntilOpen(slot, moment) }))
      .filter(({ inMinutes }) => inMinutes > 0 && inMinutes <= horizon)
      .sort((a, b) => a.inMinutes - b.inMinutes)
      .slice(0, 50)
      .map(({ slot, inMinutes }) => ({
        _id: slot._id,
        driver: slot.driver,
        inMinutes,
        dayOfWeek: slot.dayOfWeek,
        startMinutes: slot.startMinutes,
        endMinutes: slot.endMinutes,
      }));
  },
});
