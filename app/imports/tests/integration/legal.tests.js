import { Meteor } from "meteor/meteor";
import { DDP } from "meteor/ddp-client";
import { DDPCommon } from "meteor/ddp-common";
import { expect } from "chai";
import { Profiles } from "../../api/profile/Profile";
import { Schools } from "../../api/schools/Schools";
import { SystemContent } from "../../api/system/System";
import { TERMS_VERSION, TERMS_MD, PRIVACY_MD } from "../../api/legal/terms";
import { seedLegalContent } from "../../startup/server/LegalContent";
import "../../api/accounts/ClerkMethods";

/*
 * Terms acceptance is a legal record, so it is enforced on the server and
 * stored with a version, and the documents themselves must be present for
 * /tos and /privacy on a fresh database.
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

  describe("terms acceptance and legal content (integration)", function () {
    this.timeout(20000);
    let userId;

    beforeEach(async function () {
      await Promise.all([Profiles.removeAsync({}), Schools.removeAsync({}), Meteor.users.removeAsync({}), SystemContent.removeAsync({})]);
      const schoolId = await Schools.insertAsync({
        name: "School A", shortName: "A", code: "SCA", isActive: true, createdAt: new Date(), createdBy: "seed",
        location: { country: "Canada", coordinates: { lat: 49, lng: -123 } },
      });
      userId = await Meteor.users.insertAsync({ schoolId, emails: [{ address: "a@example.com", verified: true }] });
    });

    it("refuses onboarding without accepting the terms", async function () {
      const err = await rejects(callMethod("clerk.completeOnboarding", userId, { name: "Ada", userType: "Both" }), "no acceptance");
      expect(err).to.exist;
      expect(await Profiles.findOneAsync({ Owner: userId })).to.not.exist;
    });

    it("refuses onboarding when acceptance is explicitly false", async function () {
      await rejects(callMethod("clerk.completeOnboarding", userId, { acceptedTerms: false, name: "Ada", userType: "Both" }), "false");
      expect(await Profiles.findOneAsync({ Owner: userId })).to.not.exist;
    });

    it("records the accepted version and time on the profile", async function () {
      const before = Date.now();
      await callMethod("clerk.completeOnboarding", userId, { acceptedTerms: true, name: "Ada", userType: "Both" });
      const profile = await Profiles.findOneAsync({ Owner: userId });
      expect(profile.termsVersion).to.equal(TERMS_VERSION);
      expect(profile.termsAcceptedAt).to.be.instanceOf(Date);
      expect(profile.termsAcceptedAt.getTime()).to.be.at.least(before - 1000);
      expect(profile.verified).to.equal(false);
      expect(profile.requested).to.equal(true);
    });

    it("seeds the terms and privacy policy on an empty database", async function () {
      const written = await seedLegalContent();
      expect(written.sort()).to.deep.equal(["privacy", "tos"]);
      expect((await SystemContent.findOneAsync({ type: "tos" })).content).to.equal(TERMS_MD);
      expect((await SystemContent.findOneAsync({ type: "privacy" })).content).to.equal(PRIVACY_MD);
    });

    it("replaces the DEV BUILD placeholder but never an administrator's edit", async function () {
      await SystemContent.insertAsync({ type: "tos", content: "# **DEV BUILD**", lastUpdated: new Date(), updatedBy: "x" });
      await SystemContent.insertAsync({ type: "privacy", content: "# Edited by admin", lastUpdated: new Date(), updatedBy: "x" });
      const written = await seedLegalContent();
      expect(written).to.deep.equal(["tos"]);
      expect((await SystemContent.findOneAsync({ type: "tos" })).content).to.equal(TERMS_MD);
      expect((await SystemContent.findOneAsync({ type: "privacy" })).content).to.equal("# Edited by admin");
      expect(await seedLegalContent()).to.deep.equal([]);
    });

    it("the documents describe the product as built", function () {
      expect(TERMS_MD).to.not.match(/parent or legal guardian/i);
      expect(TERMS_MD).to.include("does not currently collect driver's licence numbers");
      expect(PRIVACY_MD).to.include("Profile and Vehicle Photos");
      expect(PRIVACY_MD).to.include("does not receive or store the ID images");
    });

    it("describes no payment feature, because the app has none", function () {
      // The cost-share control was removed from the ride flow. These guard the
      // documents against describing a feature the product does not have.
      [TERMS_MD, PRIVACY_MD].forEach((doc) => {
        expect(doc).to.not.match(/cost[ -]shar/i);
        expect(doc).to.not.match(/per-seat/i);
      });
      expect(TERMS_MD).to.include("The Platform has no payment feature.");
    });
  });
}
