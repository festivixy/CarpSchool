import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { Schools } from "../../api/schools/Schools";
import { schoolForEmail } from "../../api/accounts/SchoolDomain";

if (Meteor.isServer) {
  describe("SchoolDomain.schoolForEmail (server)", function () {
    beforeEach(async function () {
      await Schools.removeAsync({});
      await Schools.insertAsync({
        name: "Simon Fraser University",
        shortName: "SFU",
        code: "SFU",
        domain: "sfu.ca",
        isActive: true,
        createdAt: new Date(),
        createdBy: "seed",
      });
    });

    it("resolves the school for a matching domain", async function () {
      const result = await schoolForEmail("student@sfu.ca");
      expect(result.error).to.equal(undefined);
      expect(result.school.shortName).to.equal("SFU");
    });

    it("matches the domain case-insensitively", async function () {
      const result = await schoolForEmail("student@SFU.CA");
      expect(result.school.shortName).to.equal("SFU");
    });

    it("returns an error when no school matches the domain", async function () {
      const result = await schoolForEmail("student@ubc.ca");
      expect(result.school).to.equal(undefined);
      expect(result.error).to.be.a("string");
    });

    it("returns an error for a malformed email address", async function () {
      const result = await schoolForEmail("not-an-email");
      expect(result.error).to.be.a("string");
      expect(result.school).to.equal(undefined);
    });

    it("returns an error when the matching school is inactive", async function () {
      await Schools.updateAsync({ domain: "sfu.ca" }, { $set: { isActive: false } });
      const result = await schoolForEmail("student@sfu.ca");
      expect(result.school).to.equal(undefined);
      expect(result.error).to.match(/disabled/i);
    });
  });
}
