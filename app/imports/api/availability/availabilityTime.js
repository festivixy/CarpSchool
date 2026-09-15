/*
 * Time arithmetic for driver availability.
 *
 * A weekly slot is "Monday, 08:00-09:00" in the school's local time. The
 * server does not run in that time zone -- a container is almost always UTC --
 * so a slot can never be compared against the server clock directly, or every
 * slot is evaluated hours away from what the driver meant.
 *
 * These helpers are pure so the day/minute maths can be tested without a
 * database or a fixed machine clock.
 */

export const DEFAULT_TIMEZONE = "America/Vancouver";

export const MINUTES_IN_DAY = 24 * 60;

/* Intl returns the short weekday name; map it onto the same 0-6 Sunday-first
 * index that Date.getDay() uses, so stored values match anything else in the
 * app that works with days. */
const WEEKDAY_INDEX = {
  Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
};

export const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * The weekday and minute-of-day at `at`, as observed in `timeZone`.
 *
 * @param {string} timeZone IANA zone, e.g. "America/Vancouver".
 * @param {Date} at Instant to read; defaults to now.
 * @returns {{dayOfWeek: number, minutes: number}}
 */
export const zonedNow = (timeZone = DEFAULT_TIMEZONE, at = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(at);

  const valueOf = type => (parts.find(p => p.type === type) || {}).value;

  /* hourCycle h23 still reports midnight as "24" in some engines. */
  const hour = Number(valueOf("hour")) % 24;
  const minute = Number(valueOf("minute"));

  return {
    dayOfWeek: WEEKDAY_INDEX[valueOf("weekday")],
    minutes: (hour * 60) + minute,
  };
};

/**
 * Is a weekly slot open at the given local moment?
 *
 * The end is exclusive so back-to-back slots (08:00-09:00, 09:00-10:00) never
 * both report open at exactly 09:00.
 */
export const slotIsOpenAt = (slot, moment) => slot.dayOfWeek === moment.dayOfWeek
  && moment.minutes >= slot.startMinutes
  && moment.minutes < slot.endMinutes;

/**
 * Minutes until a slot opens, from the given local moment, looking forward up
 * to a week. Returns 0 while the slot is open, and null if it cannot be
 * resolved. Used to show "starts in 20 min" and to order the list.
 */
export const minutesUntilOpen = (slot, moment) => {
  if (slotIsOpenAt(slot, moment)) return 0;

  const dayGap = (slot.dayOfWeek - moment.dayOfWeek + 7) % 7;
  const untilSameDay = slot.startMinutes - moment.minutes;

  /* Later today. */
  if (dayGap === 0 && untilSameDay > 0) return untilSameDay;

  /* Already past today, so it is this day next week. */
  const days = dayGap === 0 ? 7 : dayGap;
  return (days * MINUTES_IN_DAY) - moment.minutes + slot.startMinutes;
};

/** "08:05" from 485. */
export const formatMinutes = (minutes) => {
  const safe = ((Math.round(minutes) % MINUTES_IN_DAY) + MINUTES_IN_DAY) % MINUTES_IN_DAY;
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

/** "Mon 08:00-09:00" for a slot summary. */
export const formatSlot = slot => `${DAY_SHORT[slot.dayOfWeek]} `
  + `${formatMinutes(slot.startMinutes)}-${formatMinutes(slot.endMinutes)}`;

/**
 * Validity rules shared by the server and the schedule editor, so the form and
 * the method cannot disagree about what a usable slot is. Overnight slots are
 * rejected rather than wrapped: a driver who means two windows should say so.
 */
export const slotRangeError = (startMinutes, endMinutes) => {
  if (!Number.isInteger(startMinutes) || !Number.isInteger(endMinutes)) {
    return "Choose a start and end time.";
  }
  if (startMinutes < 0 || endMinutes > MINUTES_IN_DAY) {
    return "Times must fall within one day.";
  }
  if (endMinutes <= startMinutes) {
    return "The end time must be after the start time.";
  }
  return null;
};

/** Do two slots on the same day overlap? Used to stop duplicate windows. */
export const slotsOverlap = (a, b) => a.dayOfWeek === b.dayOfWeek
  && a.startMinutes < b.endMinutes
  && b.startMinutes < a.endMinutes;
