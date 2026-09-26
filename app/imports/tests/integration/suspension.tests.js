import { Meteor } from "meteor/meteor";
import { DDP } from "meteor/ddp-client";
import { DDPCommon } from "meteor/ddp-common";
import { expect } from "chai";
import { Profiles } from "../../api/profile/Profile";
import "../../api/profile/SuspensionMethods";

/*
 * Suspension is what an administrator has once a verified school address is
 * enough to get in on its own. These pin the things that make it safe to rely
 * on: it is reversible, it keeps the account's history rather than destroying
 * it, it clears `verified` so the existing route gates shut without being
 * taught about suspension, and it cannot be turned on a colleague or oneself.
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
      randomSeed: `t-${Math.random()}`,
    });
    return DDP._CurrentMethodInvocation.withValue(invocation, () => handler.apply(invocation, args));
  };

  const rejects = async (promise, label) => {
    try {
      await promise;
    } catch (error) {
      return error;
    }
    throw new Error(`${label}: expected rejection`);
  };

  const makeUser = async (address, fields = {}) => Meteor.users.insertAsync({
    emails: [{ address, verified: true }],
    ...fields,
  });

  const makeProfile = async (owner, fields = {}) => Profiles.insertAsync({
    Owner: owner,
    Name: "Test",
    verified: true,
    requested: false,
    rejected: false,
    suspended: false,
    createdAt: new Date(),
    ...fields,
  });

  describe("suspension", function () {
    const SCHOOL = "school-a";
    let adminId;
    let memberId;

    beforeEach(async function () {
      await Profiles.removeAsync({});
      await Meteor.users.removeAsync({});

      adminId = await makeUser("admin@school.test", { roles: ["system"], schoolId: SCHOOL });
      await makeProfile(adminId, { Name: "Admin" });

      memberId = await makeUser("kid@school.test", { schoolId: SCHOOL });
      await makeProfile(memberId, { Name: "Member" });
    });

    it("suspends, clearing verified so the route gates shut", async function () {
      const result = await callMethod("admin.suspendUser", adminId, memberId, "Repeated no-shows");
      expect(result.suspended).to.equal(true);

      const profile = await Profiles.findOneAsync({ Owner: memberId });
      expect(profile.suspended).to.equal(true);
      expect(profile.verified).to.equal(false, "gates read verified");
      expect(profile.suspensionReason).to.equal("Repeated no-shows");
      expect(profile.suspendedBy).to.equal(adminId);
      expect(profile.suspendedAt).to.be.a("date");
    });

    it("reinstates, and keeps the record that it happened", async function () {
      await callMethod("admin.suspendUser", adminId, memberId, "A reason");
      await callMethod("admin.reinstateUser", adminId, memberId);

      const profile = await Profiles.findOneAsync({ Owner: memberId });
      expect(profile.suspended).to.equal(false);
      expect(profile.verified).to.equal(true);
      // History survives: a repeat problem should be visible to whoever looks.
      expect(profile.suspensionReason).to.equal("A reason");
      expect(profile.suspendedBy).to.equal(adminId);
    });

    it("keeps the account rather than destroying it", async function () {
      await callMethod("admin.suspendUser", adminId, memberId, "");
      expect(await Meteor.users.findOneAsync(memberId)).to.not.equal(undefined);
      expect(await Profiles.findOneAsync({ Owner: memberId })).to.not.equal(undefined);
    });

    it("refuses a second suspension rather than restamping the record", async function () {
      await callMethod("admin.suspendUser", adminId, memberId, "First");
      const error = await rejects(
        callMethod("admin.suspendUser", adminId, memberId, "Second"),
        "double suspend",
      );
      expect(error.error).to.equal("already-suspended");

      const profile = await Profiles.findOneAsync({ Owner: memberId });
      expect(profile.suspensionReason).to.equal("First");
    });

    it("refuses to reinstate an account that is not suspended", async function () {
      const error = await rejects(
        callMethod("admin.reinstateUser", adminId, memberId),
        "reinstate active",
      );
      expect(error.error).to.equal("not-suspended");
    });

    it("will not let an administrator suspend themselves", async function () {
      const error = await rejects(
        callMethod("admin.suspendUser", adminId, adminId, "oops"),
        "self suspend",
      );
      expect(error.error).to.equal("not-authorized");
    });

    it("will not suspend a system administrator", async function () {
      const otherAdmin = await makeUser("boss@school.test", { roles: ["system"], schoolId: SCHOOL });
      await makeProfile(otherAdmin, { Name: "Boss" });

      const error = await rejects(
        callMethod("admin.suspendUser", adminId, otherAdmin, "no"),
        "suspend an admin",
      );
      expect(error.error).to.equal("not-authorized");
    });

    it("refuses an ordinary member", async function () {
      const error = await rejects(
        callMethod("admin.suspendUser", memberId, adminId, "no"),
        "member suspending",
      );
      expect(error.error).to.equal("not-authorized");
    });

    it("refuses a signed-out caller", async function () {
      const error = await rejects(
        callMethod("admin.suspendUser", null, memberId, "no"),
        "signed out",
      );
      expect(error.error).to.equal("not-authorized");
    });

    it("keeps a school administrator inside their own school", async function () {
      const otherSchoolMember = await makeUser("kid@other.test", { schoolId: "school-b" });
      await makeProfile(otherSchoolMember, { Name: "Elsewhere" });

      const schoolAdmin = await makeUser("head@school.test", {
        roles: [`admin.${SCHOOL}`],
        schoolId: SCHOOL,
      });
      await makeProfile(schoolAdmin, { Name: "Head" });

      const error = await rejects(
        callMethod("admin.suspendUser", schoolAdmin, otherSchoolMember, "no"),
        "cross-school suspend",
      );
      expect(error.error).to.equal("not-authorized");

      // Their own school is fine.
      const ok = await callMethod("admin.suspendUser", schoolAdmin, memberId, "fine");
      expect(ok.suspended).to.equal(true);
    });
  });
}
