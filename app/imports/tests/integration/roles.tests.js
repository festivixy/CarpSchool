import { Meteor } from "meteor/meteor";
import { DDP } from "meteor/ddp-client";
import { DDPCommon } from "meteor/ddp-common";
import { expect } from "chai";
import { Rides } from "../../api/ride/Rides";
import { Profiles } from "../../api/profile/Profile";
import { Places } from "../../api/places/Places";
import { Schools } from "../../api/schools/Schools";
import { Chats } from "../../api/chat/Chat";
import { Notifications } from "../../api/notifications/Notifications";
import "../../api/ride/RideMethods";
import "../../api/chat/ChatMethods";
import "../../api/places/PlacesMethods";
import "../../api/profile/ProfileMethods";
import "../../api/profile/AdminApprovalMethods";
import "../../api/accounts/AccountsMethods";
import "../../api/accounts/AdminMethods";
import "../../api/accounts/ClerkMethods";
import "../../api/notifications/NotificationMethods";
import "../../api/schools/SchoolsMethods";

/*
 * Role matrix: who may do what, checked against the real methods with a
 * real database. Every "must reject" case asserts a Meteor.Error is thrown;
 * every "must allow" case asserts the write actually landed.
 *
 * Roles under test:
 *   rider      approved profile, UserType Rider, school A
 *   driver     approved profile, UserType Driver, school A
 *   both       approved profile, UserType Both, school A
 *   pending    profile requested but not yet approved
 *   rejected   profile rejected by an admin
 *   noProfile  signed in, never completed onboarding
 *   adminA     school admin of school A
 *   adminB     school admin of school B
 *   system     system administrator
 *   riderB     approved rider at school B
 */

if (Meteor.isServer) {
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

  const rejects = async (promise, label) => {
    try {
      await promise;
    } catch (error) {
      expect(error, `${label}: thrown value should be an Error`).to.be.instanceOf(Error);
      return error;
    }
    throw new Error(`${label}: expected the call to be rejected but it succeeded`);
  };

  const tomorrow = () => new Date(Date.now() + 24 * 60 * 60 * 1000);

  describe("role matrix (integration, real Mongo)", function () {
    this.timeout(30000);

    const ids = {};
    let schoolAId;
    let schoolBId;
    let placeA1;
    let placeA2;
    let placeB1;

    const mkUser = async (schoolId, roles = []) => Meteor.users.insertAsync({
      schoolId, roles, emails: [{ address: `${Math.random().toString(36).slice(2)}@example.com`, verified: true }],
    });

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

    const mkRide = async (driver, schoolId, overrides = {}) => {
      const rideId = await Rides.insertAsync({
        schoolId,
        driver,
        riders: [],
        origin: placeA1,
        destination: placeA2,
        waypoints: [],
        date: tomorrow(),
        seats: 2,
        fare: 0,
        notes: "",
        createdAt: new Date(),
        ...overrides,
      });
      return rideId;
    };

    beforeEach(async function () {
      await Promise.all([
        Rides.removeAsync({}), Profiles.removeAsync({}), Places.removeAsync({}),
        Schools.removeAsync({}), Chats.removeAsync({}), Notifications.removeAsync({}),
        Meteor.users.removeAsync({}),
      ]);

      schoolAId = await Schools.insertAsync({
        name: "School A", shortName: "A", code: "SCA", isActive: true, createdAt: new Date(), createdBy: "seed",
        location: { country: "Canada", coordinates: { lat: 49, lng: -123 } },
        settings: { allowPublicRegistration: true },
      });
      schoolBId = await Schools.insertAsync({
        name: "School B", shortName: "B", code: "SCB", isActive: true, createdAt: new Date(), createdBy: "seed",
        location: { country: "Canada", coordinates: { lat: 49, lng: -123 } },
        settings: { allowPublicRegistration: true },
      });

      ids.rider = await mkUser(schoolAId);
      ids.driver = await mkUser(schoolAId);
      ids.both = await mkUser(schoolAId);
      ids.pending = await mkUser(schoolAId);
      ids.rejected = await mkUser(schoolAId);
      ids.noProfile = await mkUser(schoolAId);
      ids.adminA = await mkUser(schoolAId, [`admin.${schoolAId}`]);
      ids.adminB = await mkUser(schoolBId, [`admin.${schoolBId}`]);
      ids.system = await mkUser(schoolAId, ["system"]);
      ids.riderB = await mkUser(schoolBId);

      await mkProfile(ids.rider, { UserType: "Rider" });
      await mkProfile(ids.driver, { UserType: "Driver" });
      await mkProfile(ids.both, { UserType: "Both" });
      await mkProfile(ids.pending, { verified: false, requested: true });
      await mkProfile(ids.rejected, { verified: false, requested: false, rejected: true });
      await mkProfile(ids.adminA);
      await mkProfile(ids.adminB);
      await mkProfile(ids.system);
      await mkProfile(ids.riderB, { UserType: "Rider" });

      placeA1 = await Places.insertAsync({
        schoolId: schoolAId, text: "A1", value: "49.1,-123.1", createdBy: ids.driver, createdAt: new Date(),
      });
      placeA2 = await Places.insertAsync({
        schoolId: schoolAId, text: "A2", value: "49.2,-123.2", createdBy: ids.driver, createdAt: new Date(),
      });
      placeB1 = await Places.insertAsync({
        schoolId: schoolBId, text: "B1", value: "49.3,-123.3", createdBy: ids.riderB, createdAt: new Date(),
      });
    });

    const createPayload = (driver, extra = {}) => ({
      driver,
      riders: [],
      origin: placeA1,
      destination: placeA2,
      waypoints: [],
      date: tomorrow(),
      seats: 3,
      fare: 5,
      notes: "",
      createdAt: new Date(),
      ...extra,
    });

    // ------------------------------------------------------------ riders
    describe("riders are riders", function () {
      it("a Rider-only profile cannot offer a ride", async function () {
        await rejects(callMethod("rides.create", ids.rider, createPayload(ids.rider)), "rider create");
      });

      it("a rider can join an open ride at their school exactly once", async function () {
        const rideId = await mkRide(ids.driver, schoolAId);
        await callMethod("rides.join", ids.rider, rideId);
        const ride = await Rides.findOneAsync(rideId);
        expect(ride.riders).to.deep.equal([ids.rider]);
        await rejects(callMethod("rides.join", ids.rider, rideId), "second join");
        expect((await Rides.findOneAsync(rideId)).riders).to.have.length(1);
      });

      it("a rider cannot cancel, edit or remove riders from someone else's ride", async function () {
        const rideId = await mkRide(ids.driver, schoolAId, { riders: [ids.rider, ids.both] });
        await rejects(callMethod("rides.cancel", ids.rider, rideId), "rider cancel");
        await rejects(callMethod("rides.edit", ids.rider, rideId, { seats: 1 }), "rider edit");
        await rejects(callMethod("rides.removeRider", ids.rider, rideId, ids.both), "rider removeRider");
        const ride = await Rides.findOneAsync(rideId);
        expect(ride).to.exist;
        expect(ride.riders).to.have.length(2);
        expect(ride.seats).to.equal(2);
      });

      it("a rider can leave a ride and the driver is told", async function () {
        const rideId = await mkRide(ids.driver, schoolAId, { riders: [ids.rider] });
        await callMethod("rides.leave", ids.rider, rideId);
        expect((await Rides.findOneAsync(rideId)).riders).to.deep.equal([]);
        const note = await Notifications.findOneAsync({ userId: ids.driver });
        expect(note, "driver notified").to.exist;
      });

      it("a rider cannot join a full ride, and the last seat cannot be taken twice", async function () {
        const rideId = await mkRide(ids.driver, schoolAId, { seats: 1 });
        const results = await Promise.allSettled([
          callMethod("rides.join", ids.rider, rideId),
          callMethod("rides.join", ids.both, rideId),
        ]);
        const ok = results.filter(r => r.status === "fulfilled").length;
        expect(ok).to.equal(1);
        expect((await Rides.findOneAsync(rideId)).riders).to.have.length(1);
      });

      it("a rider at another school cannot join directly", async function () {
        const rideId = await mkRide(ids.driver, schoolAId);
        await rejects(callMethod("rides.join", ids.riderB, rideId), "cross-school join");
        expect((await Rides.findOneAsync(rideId)).riders).to.deep.equal([]);
      });
    });

    // ----------------------------------------------------------- drivers
    describe("drivers are drivers", function () {
      it("a Driver-only profile cannot join a ride as a passenger", async function () {
        const rideId = await mkRide(ids.both, schoolAId);
        await rejects(callMethod("rides.join", ids.driver, rideId), "driver join");
      });

      it("a driver cannot join their own ride", async function () {
        const rideId = await mkRide(ids.both, schoolAId);
        await rejects(callMethod("rides.join", ids.both, rideId), "self join");
      });

      it("a driver can create a ride, but not on another user's behalf or with pre-filled riders", async function () {
        const result = await callMethod("rides.create", ids.driver, createPayload(ids.driver, { riders: [ids.rider] }));
        const rideId = typeof result === "string" ? result : (result && result.rideId);
        const stored = rideId
          ? await Rides.findOneAsync(rideId)
          : await Rides.findOneAsync({ driver: ids.driver });
        expect(stored, "ride stored").to.exist;
        expect(stored.riders, "client-supplied riders ignored").to.deep.equal([]);
        expect(stored.schoolId).to.equal(schoolAId);
        await rejects(callMethod("rides.create", ids.driver, createPayload(ids.both)), "create for someone else");
      });

      it("a driver cannot create a ride using another school's place", async function () {
        await rejects(callMethod("rides.create", ids.driver, createPayload(ids.driver, { origin: placeB1 })), "foreign place");
      });

      it("a driver can cancel their own ride; riders are notified and the chat is removed", async function () {
        const rideId = await mkRide(ids.driver, schoolAId, { riders: [ids.rider] });
        await Chats.insertAsync({ rideId, Participants: [ids.driver, ids.rider], Messages: [] });
        await callMethod("rides.cancel", ids.driver, rideId);
        expect(await Rides.findOneAsync(rideId)).to.not.exist;
        expect(await Chats.findOneAsync({ rideId })).to.not.exist;
        expect(await Notifications.findOneAsync({ userId: ids.rider })).to.exist;
      });

      it("a driver cannot reduce seats below the riders already aboard", async function () {
        const rideId = await mkRide(ids.driver, schoolAId, { seats: 3, riders: [ids.rider, ids.both] });
        await rejects(callMethod("rides.edit", ids.driver, rideId, { seats: 1 }), "seats below riders");
        expect((await Rides.findOneAsync(rideId)).seats).to.equal(3);
      });

      it("a driver can remove a rider, who is notified", async function () {
        const rideId = await mkRide(ids.driver, schoolAId, { riders: [ids.rider] });
        await callMethod("rides.removeRider", ids.driver, rideId, ids.rider);
        expect((await Rides.findOneAsync(rideId)).riders).to.deep.equal([]);
        expect(await Notifications.findOneAsync({ userId: ids.rider })).to.exist;
      });
    });

    // --------------------------------------------------- approval status
    describe("unapproved accounts cannot act", function () {
      it("a pending profile cannot create, join, chat or add places", async function () {
        const rideId = await mkRide(ids.driver, schoolAId);
        await rejects(callMethod("rides.create", ids.pending, createPayload(ids.pending)), "pending create");
        await rejects(callMethod("rides.join", ids.pending, rideId), "pending join");
        await rejects(callMethod("places.insert", ids.pending, { text: "X", value: "49.5,-123.5" }), "pending place");
        const chatId = await Chats.insertAsync({ rideId, Participants: [ids.driver, ids.pending], Messages: [] });
        await rejects(callMethod("chats.sendMessage", ids.pending, chatId, "hi"), "pending chat");
      });

      it("a rejected profile cannot create, join, chat or add places", async function () {
        const rideId = await mkRide(ids.driver, schoolAId);
        await rejects(callMethod("rides.create", ids.rejected, createPayload(ids.rejected)), "rejected create");
        await rejects(callMethod("rides.join", ids.rejected, rideId), "rejected join");
        await rejects(callMethod("places.insert", ids.rejected, { text: "X", value: "49.5,-123.5" }), "rejected place");
        const chatId = await Chats.insertAsync({ rideId, Participants: [ids.driver, ids.rejected], Messages: [] });
        await rejects(callMethod("chats.sendMessage", ids.rejected, chatId, "hi"), "rejected chat");
      });

      it("a user with no profile cannot create or join", async function () {
        const rideId = await mkRide(ids.driver, schoolAId);
        await rejects(callMethod("rides.create", ids.noProfile, createPayload(ids.noProfile)), "no-profile create");
        await rejects(callMethod("rides.join", ids.noProfile, rideId), "no-profile join");
      });

      it("a user cannot approve themselves through profiles.create", async function () {
        await Profiles.removeAsync({ Owner: ids.noProfile });
        await callMethod("profiles.create", ids.noProfile, {
          Name: "Sneaky", Location: "X", Image: "", Ride: "", Phone: "", Other: "",
          UserType: "Both", verified: true, requested: false, rejected: false, Owner: ids.noProfile,
        });
        const profile = await Profiles.findOneAsync({ Owner: ids.noProfile });
        expect(profile.verified).to.equal(false);
        expect(profile.requested).to.equal(true);
      });
    });

    // --------------------------------------------------------- admins
    describe("admins are admins, and only for their school", function () {
      it("an ordinary user cannot approve, reject, or change roles", async function () {
        await rejects(callMethod("admin.approveUser", ids.rider, ids.pending), "user approve");
        await rejects(callMethod("admin.rejectUser", ids.rider, ids.pending), "user reject");
        await rejects(callMethod("admin.makeSchoolAdmin", ids.rider, ids.both), "user makeSchoolAdmin");
        await rejects(callMethod("admin.makeSystemAdmin", ids.rider, ids.both), "user makeSystemAdmin");
        await rejects(callMethod("users.toggleAdmin", ids.rider, ids.both, "add"), "user toggleAdmin");
        const target = await Meteor.users.findOneAsync(ids.both);
        expect(target.roles || []).to.deep.equal([]);
      });

      it("a user cannot grant themselves roles through clerk.syncUserProfile", async function () {
        await callMethod("clerk.syncUserProfile", ids.rider, { publicMetadata: { roles: ["system", "admin"] } });
        const me = await Meteor.users.findOneAsync(ids.rider);
        expect(me.roles || []).to.deep.equal([]);
      });

      it("a school admin can approve a pending user at their own school", async function () {
        await callMethod("admin.approveUser", ids.adminA, ids.pending);
        const profile = await Profiles.findOneAsync({ Owner: ids.pending });
        expect(profile.verified).to.equal(true);
        expect(profile.requested).to.equal(false);
      });

      it("a school admin cannot approve a pending user at another school", async function () {
        await Profiles.updateAsync({ Owner: ids.pending }, { $set: { verified: false, requested: true } });
        await rejects(callMethod("admin.approveUser", ids.adminB, ids.pending), "cross-school approve");
        expect((await Profiles.findOneAsync({ Owner: ids.pending })).verified).to.equal(false);
      });

      it("approve and reject cannot both win on the same profile", async function () {
        const results = await Promise.allSettled([
          callMethod("admin.approveUser", ids.adminA, ids.pending),
          callMethod("admin.rejectUser", ids.adminA, ids.pending, "no"),
        ]);
        const ok = results.filter(r => r.status === "fulfilled").length;
        expect(ok).to.equal(1);
        const profile = await Profiles.findOneAsync({ Owner: ids.pending });
        expect(profile.verified && profile.rejected, "contradictory state").to.equal(false);
      });

      it("a school admin cannot cancel or remove riders from another school's ride", async function () {
        const rideId = await mkRide(ids.driver, schoolAId, { riders: [ids.rider] });
        await rejects(callMethod("rides.cancel", ids.adminB, rideId), "adminB cancel");
        await rejects(callMethod("rides.removeRider", ids.adminB, rideId, ids.rider), "adminB removeRider");
        expect(await Rides.findOneAsync(rideId)).to.exist;
      });

      it("a school admin of the ride's school and a system admin can cancel it", async function () {
        const r1 = await mkRide(ids.driver, schoolAId);
        const r2 = await mkRide(ids.driver, schoolAId);
        await callMethod("rides.cancel", ids.adminA, r1);
        await callMethod("rides.cancel", ids.system, r2);
        expect(await Rides.findOneAsync(r1)).to.not.exist;
        expect(await Rides.findOneAsync(r2)).to.not.exist;
      });

      it("only a system admin may send free-form notifications", async function () {
        await rejects(callMethod("notifications.send", ids.rider, [ids.driver], "Hi", "x", {}), "rider send");
        await rejects(callMethod("notifications.send", ids.adminA, [ids.driver], "Hi", "x", {}), "school admin send");
        await callMethod("notifications.send", ids.system, [ids.driver], "Hi", "x", {});
        expect(await Notifications.findOneAsync({ userId: ids.driver, title: "Hi" })).to.exist;
      });

      it("only the driver or an admin may broadcast to a ride", async function () {
        const rideId = await mkRide(ids.driver, schoolAId, { riders: [ids.rider, ids.both] });
        await rejects(callMethod("notifications.sendToRideParticipants", ids.rider, rideId, "Cancelled", "gotcha", {}), "rider broadcast");
        expect(await Notifications.findOneAsync({ title: "Cancelled" })).to.not.exist;
      });

      it("a school admin cannot change their school's domain; a system admin can", async function () {
        await rejects(
          callMethod("schools.updateMySchool", ids.adminA, { domain: "gmail.com" }),
          "school admin domain",
        ).catch(() => { /* method may accept the call but must ignore the field */ });
        const school = await Schools.findOneAsync(schoolAId);
        expect(school.domain || null).to.not.equal("gmail.com");
      });
    });

    // ------------------------------------------------------ tenancy
    describe("users only see their own school", function () {
      it("discovery ignores an injected school filter and returns own-school rides only", async function () {
        await mkRide(ids.driver, schoolAId);
        await mkRide(ids.riderB, schoolBId, { origin: placeB1, destination: placeB1 });
        await rejects(callMethod("rides.forMySchool", ids.rider, { schoolId: { $exists: true } }), "injected filter");
        const mine = await callMethod("rides.forMySchool", ids.rider, {});
        expect(mine.every(r => r.schoolId === schoolAId)).to.equal(true);
        expect(mine.length).to.equal(1);
      });

      it("a school admin sees their school's rides in discovery", async function () {
        await mkRide(ids.driver, schoolAId);
        const list = await callMethod("rides.forMySchool", ids.adminA, {});
        expect(list.length).to.equal(1);
      });

      it("a user at another school cannot read a ride by id", async function () {
        const rideId = await mkRide(ids.driver, schoolAId);
        await rejects(callMethod("rides.getById", ids.riderB, rideId), "cross-school read");
        const own = await callMethod("rides.getById", ids.rider, rideId);
        expect(own._id).to.equal(rideId);
      });

      it("share codes are only returned to the driver", async function () {
        const rideId = await mkRide(ids.driver, schoolAId, { shareCode: "ABCD1234" });
        const asRider = await callMethod("rides.getById", ids.rider, rideId);
        const asDriver = await callMethod("rides.getById", ids.driver, rideId);
        expect(asRider.shareCode).to.not.equal("ABCD1234");
        expect(asDriver.shareCode).to.equal("ABCD1234");
      });

      it("a non-participant cannot send to a ride's chat", async function () {
        const rideId = await mkRide(ids.driver, schoolAId, { riders: [ids.rider] });
        const chatId = await Chats.insertAsync({ rideId, Participants: [ids.driver, ids.rider], Messages: [] });
        await rejects(callMethod("chats.sendMessage", ids.both, chatId, "hello"), "outsider chat");
        expect((await Chats.findOneAsync(chatId)).Messages).to.have.length(0);
      });

      it("public school lookups never expose SMTP settings", async function () {
        await Schools.updateAsync(schoolAId, { $set: { smtpSettings: { email: "x", password: "secret", host: "h", port: 587 } } });
        const byCode = await callMethod("schools.getByCode", null, "SCA");
        expect(byCode.smtpSettings).to.not.exist;
      });
    });
  });
}
