import { Meteor } from "meteor/meteor";
import { DDP } from "meteor/ddp-client";
import { DDPCommon } from "meteor/ddp-common";
import { expect } from "chai";
import { Profiles } from "../../api/profile/Profile";
import "../../api/profile/GuardianMethods";

/*
 * A parent signs up with an address that belongs to no school, and stays inert
 * until a student vouches for them. These tests pin the rules that make that
 * safe: only an approved student may vouch, the guardian inherits that
 * student's school, and the method says the same thing whether an address has
 * no account or an account that is not a claimable guardian -- so a signed-in
 * student cannot use it to find out who has registered.
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

  const makeUser = async (address, schoolId) => {
    const userId = await Meteor.users.insertAsync({
      emails: [{ address, verified: true }],
      ...(schoolId ? { schoolId } : {}),
    });
    return userId;
  };

  const makeProfile = async (owner, fields) => Profiles.insertAsync({
    Owner: owner,
    Name: "Test",
    UserType: "Both",
    accountType: "student",
    guardianOf: [],
    verified: false,
    requested: false,
    rejected: false,
    createdAt: new Date(),
    ...fields,
  });

  describe("profiles.claimGuardian", function () {
    const SCHOOL = "school-a";
    let studentId;
    let guardianId;

    beforeEach(async function () {
      await Profiles.removeAsync({});
      await Meteor.users.removeAsync({});

      studentId = await makeUser("kid@school.test", SCHOOL);
      await makeProfile(studentId, { accountType: "student", verified: true });

      guardianId = await makeUser("mum@gmail.test", null);
      await makeProfile(guardianId, { accountType: "parent" });
    });

    it("attaches the guardian to the student's school and queues them", async function () {
      const result = await callMethod("profiles.claimGuardian", studentId, "mum@gmail.test");
      expect(result.linked).to.equal(true);

      const guardianUser = await Meteor.users.findOneAsync(guardianId);
      expect(guardianUser.schoolId).to.equal(SCHOOL);

      const guardian = await Profiles.findOneAsync({ Owner: guardianId });
      expect(guardian.guardianOf).to.deep.equal([studentId]);
      expect(guardian.requested).to.equal(true);
      expect(guardian.verified).to.equal(false, "an admin still has to approve");
    });

    it("matches the address case-insensitively", async function () {
      const result = await callMethod("profiles.claimGuardian", studentId, "MUM@Gmail.Test");
      expect(result.linked).to.equal(true);
    });

    it("is idempotent", async function () {
      await callMethod("profiles.claimGuardian", studentId, "mum@gmail.test");
      const again = await callMethod("profiles.claimGuardian", studentId, "mum@gmail.test");
      expect(again.alreadyLinked).to.equal(true);

      const guardian = await Profiles.findOneAsync({ Owner: guardianId });
      expect(guardian.guardianOf).to.deep.equal([studentId]);
    });

    it("refuses a student who is not approved yet", async function () {
      await Profiles.updateAsync({ Owner: studentId }, { $set: { verified: false } });
      const error = await rejects(
        callMethod("profiles.claimGuardian", studentId, "mum@gmail.test"),
        "unapproved student",
      );
      expect(error.error).to.equal("not-approved");
    });

    it("refuses a parent trying to claim another parent", async function () {
      await Profiles.updateAsync(
        { Owner: studentId },
        { $set: { accountType: "parent", verified: true } },
      );
      const error = await rejects(
        callMethod("profiles.claimGuardian", studentId, "mum@gmail.test"),
        "parent claiming a parent",
      );
      expect(error.error).to.equal("not-a-student");
    });

    it("will not reveal whether an address has an account", async function () {
      const missing = await rejects(
        callMethod("profiles.claimGuardian", studentId, "nobody@gmail.test"),
        "no such account",
      );

      // An account that exists but is a student, not a claimable guardian.
      const otherId = await makeUser("other@school.test", SCHOOL);
      await makeProfile(otherId, { accountType: "student", verified: true });
      const wrongType = await rejects(
        callMethod("profiles.claimGuardian", studentId, "other@school.test"),
        "not a guardian account",
      );

      expect(missing.error).to.equal("guardian-not-found");
      expect(wrongType.error).to.equal(missing.error);
      expect(wrongType.reason).to.equal(missing.reason);
    });

    it("refuses a guardian already attached to another school", async function () {
      await Meteor.users.updateAsync(guardianId, { $set: { schoolId: "school-b" } });
      const error = await rejects(
        callMethod("profiles.claimGuardian", studentId, "mum@gmail.test"),
        "guardian elsewhere",
      );
      expect(error.error).to.equal("guardian-elsewhere");
    });

    it("requires a signed-in caller", async function () {
      const error = await rejects(
        callMethod("profiles.claimGuardian", null, "mum@gmail.test"),
        "signed out",
      );
      expect(error.error).to.equal("auth-required");
    });
  });
}
