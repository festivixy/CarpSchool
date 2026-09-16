import { Meteor } from "meteor/meteor";
import { Schools } from "../../api/schools/Schools";
import { DEFAULT_TIMEZONE } from "../../api/availability/availabilityTime";

/*
 * Ensures the school named by settings.private.testSchoolCode exists.
 *
 * A deployment with no school at all cannot be used: onboarding resolves a
 * school from the verified email domain, so every new account stalls at the
 * first step, and the allow-listed test addresses have nowhere to be placed.
 *
 * Only runs when testSchoolCode is set, and never touches a school that
 * already exists, so a real school created later under the same code is left
 * exactly as its administrator left it. Remove the setting to stop seeding.
 */

const DEFAULT_NAME = "Carp Test University";
const DEFAULT_SHORT_NAME = "CarpTest";

/* Downtown Vancouver, matching the coordinates the rest of the app falls back
 * to, so the map opens somewhere sensible rather than at (0, 0). */
const DEFAULT_COORDINATES = { lat: 49.2827, lng: -123.1207 };

export const seedTestSchool = async () => {
  const settings = Meteor.settings?.private || {};
  const code = settings.testSchoolCode;
  if (!code) return null;

  const normalised = String(code).toUpperCase();
  const existing = await Schools.findOneAsync({ code: normalised }, { fields: { _id: 1 } });
  if (existing) return null;

  const schoolId = await Schools.insertAsync({
    name: settings.testSchoolName || DEFAULT_NAME,
    shortName: DEFAULT_SHORT_NAME,
    code: normalised,
    location: {
      city: "Vancouver",
      province: "British Columbia",
      country: "Canada",
      coordinates: DEFAULT_COORDINATES,
    },
    settings: {
      allowPublicRegistration: true,
      requireEmailVerification: true,
      /* No domain is set and no domain match is required, so an allow-listed
       * test address can join without owning a matching school mailbox. */
      requireDomainMatch: false,
      maxRideDistance: 50,
      timezone: settings.testSchoolTimezone || DEFAULT_TIMEZONE,
    },
    isActive: true,
    createdAt: new Date(),
    createdBy: "system",
  });

  return schoolId;
};

Meteor.startup(async () => {
  try {
    const schoolId = await seedTestSchool();
    if (schoolId) {
      console.log(`[TestSchool] Created ${Meteor.settings.private.testSchoolCode} (${schoolId})`);
    }
  } catch (error) {
    console.error("[TestSchool] Failed to seed the test school:", error);
  }
});
