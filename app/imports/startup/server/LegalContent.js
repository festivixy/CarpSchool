import { Meteor } from "meteor/meteor";
import { SystemContent } from "../../api/system/System";
import { TERMS_MD, PRIVACY_MD } from "../../api/legal/terms";

/*
 * Seeds the Terms of Use and Privacy Policy into SystemContent so /tos and
 * /privacy have real content on a fresh database.
 *
 * Idempotent and non-destructive: a document is written only when none
 * exists for that type, or when the existing one is the "DEV BUILD"
 * placeholder from system.initializeDefaults. Text edited by an
 * administrator is never overwritten; publishing a new version is a
 * deliberate act done from the admin area.
 */

const PLACEHOLDER = /^#\s*\*\*DEV BUILD\*\*\s*$/;

const DEFAULTS = {
  tos: TERMS_MD,
  privacy: PRIVACY_MD,
};

export const seedLegalContent = async () => {
  const written = [];
  await Promise.all(Object.entries(DEFAULTS).map(async ([type, content]) => {
    const existing = await SystemContent.findOneAsync({ type }, { fields: { content: 1 } });
    if (existing && !PLACEHOLDER.test(existing.content || "")) return;
    const doc = { type, content, lastUpdated: new Date(), updatedBy: "system" };
    if (existing) {
      await SystemContent.updateAsync(existing._id, { $set: doc });
    } else {
      await SystemContent.insertAsync(doc);
    }
    written.push(type);
  }));
  return written;
};

Meteor.startup(async () => {
  try {
    const written = await seedLegalContent();
    if (written.length > 0) {
      console.log(`[LegalContent] Seeded ${written.join(", ")}`);
    }
  } catch (error) {
    console.error("[LegalContent] Failed to seed legal content:", error);
  }
});
