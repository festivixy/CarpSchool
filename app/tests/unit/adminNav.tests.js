import { expect } from "chai";
import {
  ADMIN_NAV_ITEMS,
  adminNavFor,
  adminSectionFor,
  adminPathFor,
} from "../../imports/ui/utils/adminNav";

describe("adminNav", function () {
  describe("adminNavFor", function () {
    it("excludes systemOnly items for a non-system user", function () {
      const items = adminNavFor(false);
      expect(items.some(item => item.systemOnly)).to.equal(false);
      expect(items.length).to.be.lessThan(ADMIN_NAV_ITEMS.length);
    });

    it("includes every item for a system user", function () {
      const items = adminNavFor(true);
      expect(items.length).to.equal(ADMIN_NAV_ITEMS.length);
    });
  });

  describe("adminSectionFor", function () {
    it("resolves an exact section path", function () {
      expect(adminSectionFor("/admin/rides")).to.equal("rides");
    });

    it("resolves a nested path under a section", function () {
      expect(adminSectionFor("/admin/rides/123")).to.equal("rides");
    });

    it("picks the longest matching prefix, not a shorter sibling", function () {
      // /admin/pending-users must not be claimed by a shorter /admin prefix
      // (there is none here, but school-management vs schools is the real
      // case: /admin/school-management must not match /admin/schools).
      expect(adminSectionFor("/admin/school-management")).to.equal("schoolSettings");
      expect(adminSectionFor("/admin/schools")).to.equal("schools");
      expect(adminSectionFor("/admin/pending-users")).to.equal("queue");
    });

    it("returns '' for a path with no matching section", function () {
      expect(adminSectionFor("/admin/error-reports/detail/1")).to.equal("reports");
      expect(adminSectionFor("/unrelated")).to.equal("");
    });
  });

  describe("adminPathFor", function () {
    it("returns the path for a known section id", function () {
      expect(adminPathFor("rides")).to.equal("/admin/rides");
    });

    it("returns null for an unknown id", function () {
      expect(adminPathFor("nope")).to.equal(null);
    });
  });
});
