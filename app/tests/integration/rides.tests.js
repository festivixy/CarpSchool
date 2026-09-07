import { Meteor } from "meteor/meteor";
import { DDP } from "meteor/ddp-client";
import { DDPCommon } from "meteor/ddp-common";
import { expect } from "chai";
import { Rides } from "../../imports/api/ride/Rides";
import { Profiles } from "../../imports/api/profile/Profile";
import { Places } from "../../imports/api/places/Places";
import { Schools } from "../../imports/api/schools/Schools";
import { Chats } from "../../imports/api/chat/Chat";
import { Notifications } from "../../imports/api/notifications/Notifications";
// Side-effect import: registers the "rides.*" Meteor.methods handlers.
import "../../imports/api/ride/RideMethods";

if (Meteor.isServer) {
  /**
   * Call a registered method handler directly, outside of DDP.
   *
   * A bare `handler.apply({ userId }, args)` sets `this.userId` for code
   * that reads `this.userId` directly, but methods in this codebase also
   * call `Meteor.userAsync()` / `Meteor.userId()`, which read the ambient
   * DDP._CurrentMethodInvocation (AsyncLocalStorage), not `this`. Without
   * wrapping the call the same way the real DDP server does, those calls
   * would see no logged-in user regardless of the userId passed here.
   */
  const callMethod = (name, userId, ...args) => {
    const handler = Meteor.server.method_handlers[name];
    if (!handler) throw new Error(`No method handler registered for "${name}"`);
    const invocation = new DDPCommon.MethodInvocation({
      name,
      userId: userId || null,
      isSimulation: false,
      setUserId() {},
      connection: {},
      randomSeed: `test-${Math.random()}`,
    });
    return DDP._CurrentMethodInvocation.withValue(
      invocation,
      () => handler.apply(invocation, args),
    );
  };

  describe("rides methods (integration, real Mongo)", function () {
    this.timeout(20000);

    let schoolAId;
    let schoolBId;
    let driverId;
    let riderId;
    let otherSchoolRiderId;
    let originId;
    let destinationId;
    let foreignPlaceId;

    beforeEach(async function () {
      await Promise.all([
        Rides.removeAsync({}),
        Profiles.removeAsync({}),
        Places.removeAsync({}),
        Schools.removeAsync({}),
        Chats.removeAsync({}),
        Notifications.removeAsync({}),
        Meteor.users.removeAsync({}),
      ]);

      schoolAId = await Schools.insertAsync({
        name: "School A", shortName: "A", code: "SCA",
        location: { country: "Canada", coordinates: { lat: 49, lng: -123 } },
        isActive: true, createdAt: new Date(), createdBy: "seed",
      });
      schoolBId = await Schools.insertAsync({
        name: "School B", shortName: "B", code: "SCB",
        location: { country: "Canada", coordinates: { lat: 49, lng: -123 } },
        isActive: true, createdAt: new Date(), createdBy: "seed",
      });

      driverId = await Meteor.users.insertAsync({ schoolId: schoolAId });
      riderId = await Meteor.users.insertAsync({ schoolId: schoolAId });
      otherSchoolRiderId = await Meteor.users.insertAsync({ schoolId: schoolBId });

      await Profiles.insertAsync({
        Owner: driverId, Name: "Driver", Location: "Here", UserType: "Both", verified: true,
      });
      await Profiles.insertAsync({
        Owner: riderId, Name: "Rider", Location: "Here", UserType: "Both", verified: true,
      });
      await Profiles.insertAsync({
        Owner: otherSchoolRiderId, Name: "Other", Location: "Here", UserType: "Both", verified: true,
      });

      originId = await Places.insertAsync({
        schoolId: schoolAId, text: "Origin", value: "49.282700,-123.120700",
        createdBy: driverId, createdAt: new Date(),
      });
      destinationId = await Places.insertAsync({
        schoolId: schoolAId, text: "Destination", value: "49.248800,-122.980500",
        createdBy: driverId, createdAt: new Date(),
      });
      foreignPlaceId = await Places.insertAsync({
        schoolId: schoolBId, text: "Foreign", value: "49.200000,-123.000000",
        createdBy: driverId, createdAt: new Date(),
      });
    });

    const baseRideData = () => ({
      driver: driverId,
      riders: [],
      origin: originId,
      destination: destinationId,
      date: new Date(Date.now() + 60 * 60 * 1000),
      seats: 3,
      notes: "",
      createdAt: new Date(),
    });

    const createRide = async (overrides = {}) => {
      const rideId = await callMethod("rides.create", driverId, { ...baseRideData(), ...overrides });
      return Rides.findOneAsync(rideId);
    };

    describe("rides.create", function () {
      it("rejects seats of 0", async function () {
        try {
          await callMethod("rides.create", driverId, { ...baseRideData(), seats: 0 });
          expect.fail("expected rides.create to throw");
        } catch (err) {
          expect(err).to.be.instanceOf(Meteor.Error);
        }
      });

      it("rejects seats of 1000", async function () {
        try {
          await callMethod("rides.create", driverId, { ...baseRideData(), seats: 1000 });
          expect.fail("expected rides.create to throw");
        } catch (err) {
          expect(err).to.be.instanceOf(Meteor.Error);
        }
      });

      it("rejects a past date", async function () {
        try {
          await callMethod("rides.create", driverId, {
            ...baseRideData(),
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
          });
          expect.fail("expected rides.create to throw");
        } catch (err) {
          expect(err).to.be.instanceOf(Meteor.Error);
        }
      });

      it("rejects origin === destination", async function () {
        try {
          await callMethod("rides.create", driverId, {
            ...baseRideData(),
            destination: originId,
          });
          expect.fail("expected rides.create to throw");
        } catch (err) {
          expect(err).to.be.instanceOf(Meteor.Error);
        }
      });

      it("rejects a place at a different school", async function () {
        try {
          await callMethod("rides.create", driverId, {
            ...baseRideData(),
            destination: foreignPlaceId,
          });
          expect.fail("expected rides.create to throw");
        } catch (err) {
          expect(err).to.be.instanceOf(Meteor.Error);
          expect(err.error).to.equal("invalid-place");
        }
      });

      it("forces riders to [] even if the client sends passengers", async function () {
        const ride = await createRide({ riders: [riderId] });
        expect(ride.riders).to.deep.equal([]);
      });

      it("requires an approved profile", async function () {
        await Profiles.updateAsync({ Owner: driverId }, { $set: { verified: false } });
        try {
          await callMethod("rides.create", driverId, baseRideData());
          expect.fail("expected rides.create to throw");
        } catch (err) {
          expect(err).to.be.instanceOf(Meteor.Error);
          expect(err.error).to.equal("profile-pending");
        }
      });
    });

    describe("rides.join", function () {
      it("allows exactly one of two concurrent joins on a 1-seat ride", async function () {
        const ride = await createRide({ seats: 1 });
        const rider2Id = await Meteor.users.insertAsync({ schoolId: schoolAId });
        await Profiles.insertAsync({
          Owner: rider2Id, Name: "Rider2", Location: "Here", UserType: "Both", verified: true,
        });

        const results = await Promise.allSettled([
          callMethod("rides.join", riderId, ride._id),
          callMethod("rides.join", rider2Id, ride._id),
        ]);

        const fulfilled = results.filter(r => r.status === "fulfilled");
        const rejected = results.filter(r => r.status === "rejected");
        expect(fulfilled.length).to.equal(1);
        expect(rejected.length).to.equal(1);

        const finalRide = await Rides.findOneAsync(ride._id);
        expect(finalRide.riders.length).to.equal(1);
      });

      it("rejects a cross-school join", async function () {
        const ride = await createRide();
        try {
          await callMethod("rides.join", otherSchoolRiderId, ride._id);
          expect.fail("expected rides.join to throw");
        } catch (err) {
          expect(err).to.be.instanceOf(Meteor.Error);
          expect(err.error).to.equal("access-denied");
        }
      });

      it("rejects a duplicate join", async function () {
        const ride = await createRide();
        await callMethod("rides.join", riderId, ride._id);
        try {
          await callMethod("rides.join", riderId, ride._id);
          expect.fail("expected the second join to throw");
        } catch (err) {
          expect(err).to.be.instanceOf(Meteor.Error);
        }
      });
    });

    describe("rides.cancel", function () {
      it("rejects a non-driver", async function () {
        const ride = await createRide();
        try {
          await callMethod("rides.cancel", riderId, ride._id);
          expect.fail("expected rides.cancel to throw");
        } catch (err) {
          expect(err).to.be.instanceOf(Meteor.Error);
          expect(err.error).to.equal("access-denied");
        }
      });

      it("lets the driver cancel, notifies riders, and removes the chat", async function () {
        const ride = await createRide();
        await callMethod("rides.join", riderId, ride._id);
        await Chats.insertAsync({
          rideId: ride._id,
          Participants: [driverId, riderId],
          Messages: [],
        });

        await callMethod("rides.cancel", driverId, ride._id);

        expect(await Rides.findOneAsync(ride._id)).to.equal(undefined);
        expect(await Chats.findOneAsync({ rideId: ride._id })).to.equal(undefined);

        const notification = await Notifications.findOneAsync({
          userId: riderId, type: "ride_cancelled",
        });
        expect(notification).to.exist;
      });
    });

    describe("rides.leave", function () {
      it("notifies the driver when a rider leaves", async function () {
        const ride = await createRide();
        await callMethod("rides.join", riderId, ride._id);

        await callMethod("rides.leave", riderId, ride._id);

        const finalRide = await Rides.findOneAsync(ride._id);
        expect(finalRide.riders).to.not.include(riderId);

        const notification = await Notifications.findOneAsync({
          userId: driverId, type: "rider_left",
        });
        expect(notification).to.exist;
      });
    });

    describe("rides.removeRider", function () {
      it("rejects a non-driver, non-admin caller", async function () {
        const ride = await createRide();
        await callMethod("rides.join", riderId, ride._id);
        const rider2Id = await Meteor.users.insertAsync({ schoolId: schoolAId });
        await Profiles.insertAsync({
          Owner: rider2Id, Name: "Rider2", Location: "Here", UserType: "Both", verified: true,
        });

        try {
          await callMethod("rides.removeRider", rider2Id, ride._id, riderId);
          expect.fail("expected rides.removeRider to throw");
        } catch (err) {
          expect(err).to.be.instanceOf(Meteor.Error);
        }
      });
    });

    describe("rides.forMySchool", function () {
      it("throws a Match error when the caller injects a schoolId filter", async function () {
        try {
          await callMethod("rides.forMySchool", riderId, { schoolId: { $exists: true } });
          expect.fail("expected rides.forMySchool to throw");
        } catch (err) {
          // check()'s object pattern only allows the declared keys (from/to);
          // an unlisted key like schoolId fails Match, not the app's own
          // Meteor.Error path.
          expect(err).to.exist;
        }
      });

      it("returns only rides at the caller's own school", async function () {
        const ownRide = await createRide();
        const otherDriverId = await Meteor.users.insertAsync({ schoolId: schoolBId });
        await Profiles.insertAsync({
          Owner: otherDriverId, Name: "OtherDriver", Location: "Here", UserType: "Both", verified: true,
        });
        const foreignOriginId = await Places.insertAsync({
          schoolId: schoolBId, text: "FOrigin", value: "49.200000,-123.000000",
          createdBy: otherDriverId, createdAt: new Date(),
        });
        const foreignDestId = await Places.insertAsync({
          schoolId: schoolBId, text: "FDest", value: "49.210000,-123.010000",
          createdBy: otherDriverId, createdAt: new Date(),
        });
        await callMethod("rides.create", otherDriverId, {
          ...baseRideData(),
          driver: otherDriverId,
          origin: foreignOriginId,
          destination: foreignDestId,
        });

        const rides = await callMethod("rides.forMySchool", riderId, {});
        const ids = rides.map(r => r._id);
        expect(ids).to.include(ownRide._id);
        expect(rides.every(r => r.driver === driverId)).to.equal(true);
      });

      it("returns rides for a school admin's own school", async function () {
        await createRide();
        const adminId = await Meteor.users.insertAsync({
          schoolId: schoolAId, roles: [`admin.${schoolAId}`],
        });
        const rides = await callMethod("rides.forMySchool", adminId, {});
        expect(rides.length).to.be.greaterThan(0);
      });
    });
  });
}
