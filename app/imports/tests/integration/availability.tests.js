import { Meteor } from "meteor/meteor";
import { DDP } from "meteor/ddp-client";
import { DDPCommon } from "meteor/ddp-common";
import { expect } from "chai";
import { Availabilities } from "../../api/availability/Availability";
import { Profiles } from "../../api/profile/Profile";
import { Places } from "../../api/places/Places";
import { Schools } from "../../api/schools/Schools";
import "../../api/availability/AvailabilityMethods";

/*
 * Being listed as available is an offer to drive, so it is gated exactly like
 * creating a ride: approved profile, not a rider-only account, and places from
 * the caller's own school.
 */

if (Meteor.isServer) {
  const callMethod = (name, userId, ...args) => {
    const handler = Meteor.server.method_handlers[name];
    if (!handler) throw new Error(`No method handler registered for "${name}"`);
    const invocation = new DDPCommon.MethodInvocation({
      name, userId: userId || null, isSimulation: false, setUserId() {}, connection: {}, randomSeed: `t-${Math.random()}`,
    });
    return DDP._CurrentMethodInvocation.withValue(invocation, () => handler.apply(invocation, args));
  };

  const rejects = async (promise, label) => {
    try { await promise; } catch (error) { return error; }
    throw new Error(`${label}: expected rejection`);
  };

  describe("driver availability (integration, real Mongo)", function () {
    this.timeout(30000);

    const ids = {};
    let schoolAId;
    let schoolBId;
    let placeA1;
    let placeA2;
    let placeB1;

    const mkUser = (schoolId, roles = []) => Meteor.users.insertAsync({ schoolId, roles });

    const mkProfile = (Owner, overrides = {}) => Profiles.insertAsync({
      Owner,
      Name: "Test User",
      Location: "Campus",
      UserType: "Both",
      verified: true,
      requested: false,
      rejected: false,
      createdAt: new Date(),
      ...overrides,
    });

    const weeklySlot = (over = {}) => ({
      dayOfWeek: 1,
      startMinutes: 8 * 60,
      endMinutes: 9 * 60,
      origin: placeA1,
      destination: placeA2,
      ...over,
    });

    beforeEach(async function () {
      await Promise.all([
        Availabilities.removeAsync({}), Profiles.removeAsync({}), Places.removeAsync({}),
        Schools.removeAsync({}), Meteor.users.removeAsync({}),
      ]);

      schoolAId = await Schools.insertAsync({
        name: "School A", shortName: "A", code: "SCA", isActive: true, createdAt: new Date(), createdBy: "seed",
        location: { country: "Canada", coordinates: { lat: 49, lng: -123 } },
        settings: { timezone: "America/Vancouver" },
      });
      schoolBId = await Schools.insertAsync({
        name: "School B", shortName: "B", code: "SCB", isActive: true, createdAt: new Date(), createdBy: "seed",
        location: { country: "Canada", coordinates: { lat: 49, lng: -123 } },
      });

      ids.driver = await mkUser(schoolAId);
      ids.rider = await mkUser(schoolAId);
      ids.pending = await mkUser(schoolAId);
      ids.noSchool = await Meteor.users.insertAsync({ roles: [] });
      ids.driverB = await mkUser(schoolBId);

      await mkProfile(ids.driver, { UserType: "Driver", Name: "Dana" });
      await mkProfile(ids.rider, { UserType: "Rider", Name: "Rae" });
      await mkProfile(ids.pending, { verified: false, requested: true });
      await mkProfile(ids.noSchool);
      await mkProfile(ids.driverB, { UserType: "Driver", Name: "Bo" });

      placeA1 = await Places.insertAsync({
        schoolId: schoolAId, text: "Northside", value: "49.1,-123.1", createdBy: ids.driver, createdAt: new Date(),
      });
      placeA2 = await Places.insertAsync({
        schoolId: schoolAId, text: "Campus", value: "49.2,-123.2", createdBy: ids.driver, createdAt: new Date(),
      });
      placeB1 = await Places.insertAsync({
        schoolId: schoolBId, text: "Other campus", value: "49.3,-123.3", createdBy: ids.driverB, createdAt: new Date(),
      });
    });

    describe("who may offer availability", function () {
      it("a driver can add a weekly slot", async function () {
        await callMethod("availability.addWeekly", ids.driver, weeklySlot());
        const stored = await Availabilities.findOneAsync({ driver: ids.driver });
        expect(stored).to.exist;
        expect(stored.kind).to.equal("weekly");
        expect(stored.schoolId).to.equal(schoolAId);
        expect(stored.seats).to.equal(1);
      });

      it("a rider-only account cannot", async function () {
        await rejects(callMethod("availability.addWeekly", ids.rider, weeklySlot()), "rider weekly");
        await rejects(
          callMethod("availability.goNow", ids.rider, { origin: placeA1, destination: placeA2 }),
          "rider now",
        );
        expect(await Availabilities.findOneAsync({ driver: ids.rider })).to.not.exist;
      });

      it("an unapproved account cannot", async function () {
        await rejects(callMethod("availability.addWeekly", ids.pending, weeklySlot()), "pending");
      });

      it("a signed-out caller cannot", async function () {
        await rejects(callMethod("availability.addWeekly", null, weeklySlot()), "anonymous");
      });

      it("an account with no school cannot", async function () {
        await rejects(callMethod("availability.addWeekly", ids.noSchool, weeklySlot()), "no school");
      });
    });

    describe("slot validation", function () {
      it("rejects an end at or before the start", async function () {
        await rejects(
          callMethod("availability.addWeekly", ids.driver, weeklySlot({ endMinutes: 8 * 60 })),
          "zero length",
        );
      });

      it("rejects a day outside the week", async function () {
        await rejects(
          callMethod("availability.addWeekly", ids.driver, weeklySlot({ dayOfWeek: 7 })),
          "bad day",
        );
      });

      it("rejects another school's place", async function () {
        await rejects(
          callMethod("availability.addWeekly", ids.driver, weeklySlot({ destination: placeB1 })),
          "foreign place",
        );
      });

      it("rejects an overlapping slot but allows a touching one", async function () {
        await callMethod("availability.addWeekly", ids.driver, weeklySlot());
        await rejects(
          callMethod("availability.addWeekly", ids.driver, weeklySlot({ startMinutes: 510, endMinutes: 570 })),
          "overlap",
        );
        await callMethod("availability.addWeekly", ids.driver, weeklySlot({ startMinutes: 9 * 60, endMinutes: 10 * 60 }));
        expect(await Availabilities.find({ driver: ids.driver, kind: "weekly" }).countAsync()).to.equal(2);
      });
    });

    describe("available now", function () {
      it("creates an expiring slot and replaces any existing one", async function () {
        await callMethod("availability.goNow", ids.driver, { origin: placeA1, destination: placeA2 });
        await callMethod("availability.goNow", ids.driver, { origin: placeA2, destination: placeA1 });
        const all = await Availabilities.find({ driver: ids.driver, kind: "now" }).fetchAsync();
        expect(all).to.have.length(1);
        expect(all[0].expiresAt).to.be.instanceOf(Date);
        expect(all[0].expiresAt.getTime()).to.be.greaterThan(Date.now());
      });

      it("stopNow clears it", async function () {
        await callMethod("availability.goNow", ids.driver, { origin: placeA1, destination: placeA2 });
        await callMethod("availability.stopNow", ids.driver);
        expect(await Availabilities.findOneAsync({ driver: ids.driver, kind: "now" })).to.not.exist;
      });

      it("shows in openNow while live and not after it expires", async function () {
        await callMethod("availability.goNow", ids.driver, { origin: placeA1, destination: placeA2 });

        const live = await callMethod("availability.openNow", ids.rider);
        expect(live).to.have.length(1);
        expect(live[0].driverName).to.equal("Dana");
        expect(live[0].originText).to.equal("Northside");
        expect(live[0].destinationText).to.equal("Campus");

        await Availabilities.updateAsync(
          { driver: ids.driver, kind: "now" },
          { $set: { expiresAt: new Date(Date.now() - 1000) } },
        );
        expect(await callMethod("availability.openNow", ids.rider)).to.have.length(0);
      });
    });

    describe("browsing", function () {
      it("never returns another school's drivers", async function () {
        await callMethod("availability.goNow", ids.driverB, { origin: placeB1, destination: placeB1 })
          .catch(() => { /* same origin/destination is rejected; insert directly below */ });
        await Availabilities.insertAsync({
          driver: ids.driverB,
          schoolId: schoolBId,
          kind: "now",
          expiresAt: new Date(Date.now() + 60000),
          origin: placeB1,
          destination: placeB1,
          seats: 1,
          note: "",
          createdAt: new Date(),
        });

        const list = await callMethod("availability.openNow", ids.rider);
        expect(list.every(entry => entry.driver !== ids.driverB)).to.equal(true);
      });

      it("only exposes display fields, never the raw document", async function () {
        await callMethod("availability.goNow", ids.driver, { origin: placeA1, destination: placeA2 });
        const [entry] = await callMethod("availability.openNow", ids.rider);
        expect(entry).to.not.have.property("schoolId");
        expect(entry).to.not.have.property("expiresAt");
        expect(Object.keys(entry).sort()).to.deep.equal([
          "_id", "destinationText", "driver", "driverImage", "driverName", "endMinutes",
          "endsAt", "isMine", "kind", "note", "originText", "seats", "startMinutes",
        ]);
      });

      it("requires an approved profile to browse", async function () {
        await rejects(callMethod("availability.openNow", ids.pending), "pending browse");
        await rejects(callMethod("availability.openNow", null), "anonymous browse");
      });
    });

    describe("managing your own slots", function () {
      it("mine returns only the caller's slots", async function () {
        await callMethod("availability.addWeekly", ids.driver, weeklySlot());
        await Availabilities.insertAsync({
          driver: ids.driverB, schoolId: schoolBId, kind: "weekly", dayOfWeek: 2,
          startMinutes: 480, endMinutes: 540, origin: placeB1, destination: placeB1,
          seats: 1, note: "", createdAt: new Date(),
        });
        const mine = await callMethod("availability.mine", ids.driver);
        expect(mine).to.have.length(1);
        expect(mine[0].driver).to.equal(ids.driver);
      });

      it("a driver cannot remove someone else's slot", async function () {
        const slotId = await callMethod("availability.addWeekly", ids.driver, weeklySlot());
        await rejects(callMethod("availability.remove", ids.driverB, slotId), "other driver remove");
        expect(await Availabilities.findOneAsync(slotId)).to.exist;

        await callMethod("availability.remove", ids.driver, slotId);
        expect(await Availabilities.findOneAsync(slotId)).to.not.exist;
      });
    });
  });
}
