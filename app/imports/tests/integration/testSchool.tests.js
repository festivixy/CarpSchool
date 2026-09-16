import { Meteor } from "meteor/meteor";
import { expect } from "chai";
import { Schools } from "../../api/schools/Schools";
import { seedTestSchool } from "../../startup/server/TestSchool";

/*
 * A deployment with no school cannot onboard anyone: the school is resolved
 * from the verified email domain, so every new account stalls at the first
 * step. This seed exists to guarantee one, and must never overwrite a school
 * an administrator is already using.
 */

if (Meteor.isServer) {
  describe("test school seed (integration, real Mongo)", function () {
    this.timeout(20000);

    let originalSettings;

    const withPrivate = (privateSettings) => {
      Meteor.settings = { ...originalSettings, private: privateSettings };
    };

    beforeEach(async function () {
      originalSettings = Meteor.settings;
      await Schools.removeAsync({});
    });

    afterEach(function () {
      Meteor.settings = originalSettings;
    });

    it("does nothing when no test school is configured", async function () {
      withPrivate({});
      expect(await seedTestSchool()).to.equal(null);
      expect(await Schools.find({}).countAsync()).to.equal(0);
    });

    it("creates an active school under the configured code", async function () {
      withPrivate({ testSchoolCode: "CTU" });
      const schoolId = await seedTestSchool();
      expect(schoolId).to.be.a("string");

      const school = await Schools.findOneAsync(schoolId);
      expect(school.code).to.equal("CTU");
      expect(school.isActive).to.equal(true);
      expect(school.settings.timezone).to.be.a("string");
      /* No domain requirement, or an allow-listed test address could not join
       * without owning a matching school mailbox. */
      expect(school.settings.requireDomainMatch).to.equal(false);
      expect(school.location.coordinates.lat).to.be.a("number");
    });

    it("upper-cases the code, matching how schools are looked up", async function () {
      withPrivate({ testSchoolCode: "ctu" });
      const schoolId = await seedTestSchool();
      expect((await Schools.findOneAsync(schoolId)).code).to.equal("CTU");
    });

    it("is idempotent across restarts", async function () {
      withPrivate({ testSchoolCode: "CTU" });
      await seedTestSchool();
      expect(await seedTestSchool()).to.equal(null);
      expect(await Schools.find({ code: "CTU" }).countAsync()).to.equal(1);
    });

    it("never touches a school that already carries the code", async function () {
      withPrivate({ testSchoolCode: "CTU" });
      const realId = await Schools.insertAsync({
        name: "A Real School", shortName: "Real", code: "CTU", isActive: true,
        createdAt: new Date(), createdBy: "an-admin",
        location: { country: "Canada", coordinates: { lat: 1, lng: 2 } },
      });

      expect(await seedTestSchool()).to.equal(null);
      const school = await Schools.findOneAsync(realId);
      expect(school.name).to.equal("A Real School");
      expect(school.createdBy).to.equal("an-admin");
      expect(await Schools.find({ code: "CTU" }).countAsync()).to.equal(1);
    });

    it("takes the name from settings when given one", async function () {
      withPrivate({ testSchoolCode: "CTU", testSchoolName: "Demo College" });
      const schoolId = await seedTestSchool();
      expect((await Schools.findOneAsync(schoolId)).name).to.equal("Demo College");
    });
  });
}
