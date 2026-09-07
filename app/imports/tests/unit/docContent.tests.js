import { expect } from "chai";
import { stripLeadingH1 } from "../../ui/utils/docContent";

describe("docContent", function () {
  describe("stripLeadingH1", function () {
    it("strips a leading H1 and the blank line after it", function () {
      const input = "# Title\n\nBody text.";
      expect(stripLeadingH1(input)).to.equal("Body text.");
    });

    it("strips a leading H1 with no following blank line", function () {
      const input = "# Title\nBody text.";
      expect(stripLeadingH1(input)).to.equal("Body text.");
    });

    it("skips leading blank lines before finding the H1", function () {
      const input = "\n\n# Title\n\nBody text.";
      expect(stripLeadingH1(input)).to.equal("Body text.");
    });

    it("leaves an H2 heading untouched", function () {
      const input = "## Subtitle\n\nBody text.";
      expect(stripLeadingH1(input)).to.equal(input);
    });

    it("leaves content untouched when there is no leading heading", function () {
      const input = "Just some text.\n\n# Not first";
      expect(stripLeadingH1(input)).to.equal(input);
    });

    it("only strips the first heading, leaving later H1s alone", function () {
      const input = "# Title\n\nBody\n\n# Second heading";
      expect(stripLeadingH1(input)).to.equal("Body\n\n# Second heading");
    });

    it("returns non-string input unchanged", function () {
      expect(stripLeadingH1(null)).to.equal(null);
      expect(stripLeadingH1(undefined)).to.equal(undefined);
    });

    it("returns the input unchanged when it is all blank lines", function () {
      const input = "\n\n\n";
      expect(stripLeadingH1(input)).to.equal(input);
    });

    it("does not strip '##' as if it were '#'", function () {
      const input = "##Not a real heading (no space)\n\nBody.";
      // '##Not...' has no space after '#', so it must not match '^#\\s+\\S'
      // either -- confirms the H1-only, space-required rule.
      expect(stripLeadingH1(input)).to.equal(input);
    });
  });
});
