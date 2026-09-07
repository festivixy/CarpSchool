import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { isSystemAdmin, isSchoolAdmin } from "../../imports/api/accounts/RoleUtils";

if (Meteor.isServer) {
  describe("RoleUtils (server)", function () {
    let systemUserId;
    let schoolAdminUserId;
    let plainUserId;

    beforeEach(async function () {
      await Meteor.users.removeAsync({});
      systemUserId = await Meteor.users.insertAsync({ roles: ["system"] });
      schoolAdminUserId = await Meteor.users.insertAsync({
        roles: ["admin.schoolA"],
        schoolId: "schoolA",
      });
      plainUserId = await Meteor.users.insertAsync({ schoolId: "schoolA" });
    });

    describe("isSystemAdmin", function () {
      it("returns true for a user with the system role", async function () {
        expect(await isSystemAdmin(systemUserId)).to.equal(true);
      });

      it("returns false for a user without the system role", async function () {
        expect(await isSystemAdmin(schoolAdminUserId)).to.equal(false);
        expect(await isSystemAdmin(plainUserId)).to.equal(false);
      });

      it("returns false for a non-existent user", async function () {
        expect(await isSystemAdmin("does-not-exist")).to.equal(false);
      });
    });

    describe("isSchoolAdmin", function () {
      it("returns true when the user has admin.<schoolId> for that school", async function () {
        expect(await isSchoolAdmin(schoolAdminUserId, "schoolA")).to.equal(true);
      });

      it("returns false for a different school (cross-school)", async function () {
        expect(await isSchoolAdmin(schoolAdminUserId, "schoolB")).to.equal(false);
      });

      it("returns false for a plain user with no admin role", async function () {
        expect(await isSchoolAdmin(plainUserId, "schoolA")).to.equal(false);
      });

      it("falls back to the user's own schoolId when none is given", async function () {
        expect(await isSchoolAdmin(schoolAdminUserId)).to.equal(true);
      });

      it("returns false when no schoolId can be resolved", async function () {
        const noSchoolAdmin = await Meteor.users.insertAsync({ roles: ["admin.schoolA"] });
        expect(await isSchoolAdmin(noSchoolAdmin)).to.equal(false);
      });
    });
  });
}
