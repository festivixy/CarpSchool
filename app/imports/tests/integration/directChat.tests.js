import { Meteor } from "meteor/meteor";
import { DDP } from "meteor/ddp-client";
import { DDPCommon } from "meteor/ddp-common";
import { expect } from "chai";
import { Chats } from "../../api/chat/Chat";
import { Profiles } from "../../api/profile/Profile";
import { Schools } from "../../api/schools/Schools";
import "../../api/chat/ChatMethods";

/*
 * Direct chats exist because availability is not a ride: a rider who finds a
 * driver on the drivers list has nothing to talk in yet. The pair must map to
 * exactly one conversation however it is opened, and must not reach across
 * schools.
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

  describe("direct chats (integration, real Mongo)", function () {
    this.timeout(30000);

    const ids = {};
    let schoolAId;
    let schoolBId;

    const mkProfile = (Owner, overrides = {}) => Profiles.insertAsync({
      Owner,
      Name: `User ${Owner.slice(0, 4)}`,
      Location: "Campus",
      UserType: "Both",
      verified: true,
      requested: false,
      rejected: false,
      createdAt: new Date(),
      ...overrides,
    });

    beforeEach(async function () {
      await Promise.all([
        Chats.removeAsync({}), Profiles.removeAsync({}),
        Schools.removeAsync({}), Meteor.users.removeAsync({}),
      ]);

      schoolAId = await Schools.insertAsync({
        name: "School A", shortName: "A", code: "SCA", isActive: true, createdAt: new Date(), createdBy: "seed",
        location: { country: "Canada", coordinates: { lat: 49, lng: -123 } },
      });
      schoolBId = await Schools.insertAsync({
        name: "School B", shortName: "B", code: "SCB", isActive: true, createdAt: new Date(), createdBy: "seed",
        location: { country: "Canada", coordinates: { lat: 49, lng: -123 } },
      });

      ids.rider = await Meteor.users.insertAsync({ schoolId: schoolAId });
      ids.driver = await Meteor.users.insertAsync({ schoolId: schoolAId });
      ids.third = await Meteor.users.insertAsync({ schoolId: schoolAId });
      ids.otherSchool = await Meteor.users.insertAsync({ schoolId: schoolBId });
      ids.pending = await Meteor.users.insertAsync({ schoolId: schoolAId });

      await mkProfile(ids.rider);
      await mkProfile(ids.driver);
      await mkProfile(ids.third);
      await mkProfile(ids.otherSchool);
      await mkProfile(ids.pending, { verified: false, requested: true });
    });

    it("creates one chat carrying both participants and no ride", async function () {
      const chatId = await callMethod("chats.createDirect", ids.rider, ids.driver);
      const chat = await Chats.findOneAsync(chatId);

      expect(chat).to.exist;
      expect(chat.rideId).to.equal(undefined);
      expect(chat.directKey).to.be.a("string");
      expect(chat.Participants.sort()).to.deep.equal([ids.rider, ids.driver].sort());
      expect(chat.Messages).to.deep.equal([]);
    });

    it("returns the same chat whichever side opens it, and however often", async function () {
      const first = await callMethod("chats.createDirect", ids.rider, ids.driver);
      const again = await callMethod("chats.createDirect", ids.rider, ids.driver);
      const reversed = await callMethod("chats.createDirect", ids.driver, ids.rider);

      expect(again).to.equal(first);
      expect(reversed).to.equal(first);
      expect(await Chats.find({ directKey: { $exists: true } }).countAsync()).to.equal(1);
    });

    it("keeps separate pairs apart", async function () {
      await callMethod("chats.createDirect", ids.rider, ids.driver);
      await callMethod("chats.createDirect", ids.rider, ids.third);
      expect(await Chats.find({ directKey: { $exists: true } }).countAsync()).to.equal(2);
    });

    it("survives two simultaneous opens without duplicating", async function () {
      const results = await Promise.all([
        callMethod("chats.createDirect", ids.rider, ids.driver),
        callMethod("chats.createDirect", ids.driver, ids.rider),
      ]);
      expect(results[0]).to.equal(results[1]);
      expect(await Chats.find({ directKey: { $exists: true } }).countAsync()).to.equal(1);
    });

    it("refuses another school, yourself, a stranger, and an unapproved caller", async function () {
      await rejects(callMethod("chats.createDirect", ids.rider, ids.otherSchool), "cross-school");
      await rejects(callMethod("chats.createDirect", ids.rider, ids.rider), "self");
      await rejects(callMethod("chats.createDirect", ids.rider, "nope"), "missing user");
      await rejects(callMethod("chats.createDirect", ids.pending, ids.driver), "unapproved");
      await rejects(callMethod("chats.createDirect", null, ids.driver), "anonymous");
      expect(await Chats.find({}).countAsync()).to.equal(0);
    });

    it("lets a participant send in it, and keeps an outsider out", async function () {
      const chatId = await callMethod("chats.createDirect", ids.rider, ids.driver);

      await callMethod("chats.sendMessage", ids.driver, chatId, "On my way");
      const chat = await Chats.findOneAsync(chatId);
      expect(chat.Messages).to.have.length(1);
      expect(chat.Messages[0].Sender).to.equal(ids.driver);

      await rejects(callMethod("chats.sendMessage", ids.third, chatId, "let me in"), "outsider");
      expect((await Chats.findOneAsync(chatId)).Messages).to.have.length(1);
    });
  });
}
