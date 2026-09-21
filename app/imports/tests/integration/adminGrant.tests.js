import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { Profiles } from "../../api/profile/Profile";
import { Schools } from "../../api/schools/Schools";
import {
  listedAdminEmails,
  userIsListedAdmin,
  grantAdminIfListed,
  grantAllListedAdmins,
} from "../../api/accounts/adminGrant";

/*
 * The administrator grant is the only way to create the first administrator,
 * since every role-granting method is itself admin-only. It has to work on
 * sign-in and not only at boot: an account created after the server started
 * used to stay an ordinary user until someone happened to deploy.
 */

if (Meteor.isServer) {
  describe("administrator grant (integration, real Mongo)", function () {
    this.timeout(20000);

    let originalSettings;
    let schoolId;

    const withPrivate = (privateSettings) => {
      Meteor.settings = { ...originalSettings, private: privateSettings };
    };

    const mkUser = (address, extra = {}) => Meteor.users.insertAsync({
      emails: address ? [{ address, verified: true }] : [],
      roles: [],
      ...extra,
    });

    beforeEach(async function () {
      originalSettings = Meteor.settings;
      await Promise.all([
        Meteor.users.removeAsync({}), Profiles.removeAsync({}), Schools.removeAsync({}),
      ]);
      schoolId = await Schools.insertAsync({
        name: "School A", shortName: "A", code: "SCA", isActive: true,
        createdAt: new Date(), createdBy: "seed",
        location: { country: "Canada", coordinates: { lat: 49, lng: -123 } },
      });
    });

    afterEach(function () {
      Meteor.settings = originalSettings;
    });

    describe("reading the list", function () {
      it("normalises entries and ignores rubbish", function () {
        withPrivate({ adminEmails: ["  Boss@Example.com ", "", 42, null, "two@example.com"] });
        expect(listedAdminEmails()).to.deep.equal(["boss@example.com", "two@example.com"]);
      });

      it("is empty when unset, so nobody is matched", function () {
        withPrivate({});
        expect(listedAdminEmails()).to.deep.equal([]);
        expect(userIsListedAdmin({ emails: [{ address: "boss@example.com" }] })).to.equal(false);
      });

      it("matches regardless of case", function () {
        withPrivate({ adminEmails: ["boss@example.com"] });
        expect(userIsListedAdmin({ emails: [{ address: "BOSS@Example.COM" }] })).to.equal(true);
        expect(userIsListedAdmin({ emails: [{ address: "someone@example.com" }] })).to.equal(false);
        expect(userIsListedAdmin({ emails: [] })).to.equal(false);
      });
    });

    describe("granting", function () {
      it("gives a listed account both roles and an approved profile", async function () {
        withPrivate({ adminEmails: ["boss@example.com"] });
        const userId = await mkUser("boss@example.com");

        expect(await grantAdminIfListed(userId)).to.equal(true);

        const user = await Meteor.users.findOneAsync(userId);
        expect(user.roles).to.include("system");
        expect(user.roles).to.include("admin");

        const profile = await Profiles.findOneAsync({ Owner: userId });
        expect(profile.verified).to.equal(true);
        expect(profile.requested).to.equal(false);
      });

      /* An administrator operates the platform rather than belonging to a
       * school in it. requireAdminScope already pins their schoolId to null,
       * and the member routes let them through without one. */
      it("does not put an administrator in a school", async function () {
        withPrivate({ adminEmails: ["boss@example.com"] });
        const userId = await mkUser("boss@example.com");

        await grantAdminIfListed(userId);

        expect((await Meteor.users.findOneAsync(userId)).schoolId).to.equal(undefined);
      });

      it("leaves a school alone if the account already has one", async function () {
        withPrivate({ adminEmails: ["boss@example.com"] });
        const userId = await mkUser("boss@example.com", { schoolId });

        await grantAdminIfListed(userId);

        expect((await Meteor.users.findOneAsync(userId)).schoolId).to.equal(schoolId);
      });

      it("leaves an unlisted account completely alone", async function () {
        withPrivate({ adminEmails: ["boss@example.com"] });
        const userId = await mkUser("someone@example.com");

        expect(await grantAdminIfListed(userId)).to.equal(false);
        expect((await Meteor.users.findOneAsync(userId)).roles).to.deep.equal([]);
        expect(await Profiles.findOneAsync({ Owner: userId })).to.not.exist;
      });

      it("approves a profile that was left pending", async function () {
        withPrivate({ adminEmails: ["boss@example.com"] });
        const userId = await mkUser("boss@example.com");
        await Profiles.insertAsync({
          Owner: userId, Name: "Boss", Location: "", UserType: "Both",
          verified: false, requested: true, rejected: false, createdAt: new Date(),
        });

        await grantAdminIfListed(userId);
        const profile = await Profiles.findOneAsync({ Owner: userId });
        expect(profile.verified).to.equal(true);
        expect(profile.requested).to.equal(false);
      });

      it("is idempotent and does not duplicate roles or profiles", async function () {
        withPrivate({ adminEmails: ["boss@example.com"] });
        const userId = await mkUser("boss@example.com");

        await grantAdminIfListed(userId);
        await grantAdminIfListed(userId);

        const user = await Meteor.users.findOneAsync(userId);
        expect(user.roles.filter(r => r === "system")).to.have.length(1);
        expect(await Profiles.find({ Owner: userId }).countAsync()).to.equal(1);
      });

      it("does nothing without a user id", async function () {
        withPrivate({ adminEmails: ["boss@example.com"] });
        expect(await grantAdminIfListed(null)).to.equal(false);
      });
    });

    describe("the startup pass", function () {
      it("grants every listed account that exists", async function () {
        withPrivate({ adminEmails: ["one@example.com", "two@example.com"] });
        const a = await mkUser("one@example.com");
        const b = await mkUser("two@example.com");
        await mkUser("nobody@example.com");

        expect(await grantAllListedAdmins()).to.equal(2);
        expect((await Meteor.users.findOneAsync(a)).roles).to.include("system");
        expect((await Meteor.users.findOneAsync(b)).roles).to.include("system");
      });

      it("grants nothing when the list is missing", async function () {
        withPrivate({});
        await mkUser("boss@example.com");
        expect(await grantAllListedAdmins()).to.equal(0);
      });

      it("copes with a listed account that has not signed up yet", async function () {
        withPrivate({ adminEmails: ["absent@example.com"] });
        expect(await grantAllListedAdmins()).to.equal(0);
      });
    });
  });
}
