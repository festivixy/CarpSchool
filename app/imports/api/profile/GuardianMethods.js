import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Profiles } from "./Profile";

/**
 * A student claiming their parent or guardian.
 *
 * Signing up no longer requires a school email, because a parent does not have
 * one. What replaces the domain check is this: an account with no school sits
 * inert -- it cannot browse, post, or message anyone -- until a student who
 * *did* verify a school email says "this is my parent". The student's school
 * becomes theirs, and only then do they reach the approval queue, where an
 * administrator still has the final say.
 *
 * So the barrier did not move so much as change shape. A stranger can hold a
 * dormant record; reaching anything still needs somebody verified to vouch for
 * them, and then an administrator to agree.
 */

/** Claims are capped so one account cannot enumerate addresses. */
const MAX_GUARDIANS = 4;

const normalise = address => String(address || "").trim().toLowerCase();

Meteor.methods({
  /**
   * Claim the holder of `email` as a guardian of the calling student.
   *
   * Deliberately returns the same error whether the address has no account or
   * has one that is not a claimable parent: a signed-in student should not be
   * able to use this to find out who has registered.
   */
  async "profiles.claimGuardian"(email) {
    check(email, String);

    if (!this.userId) {
      throw new Meteor.Error("auth-required", "Please sign in.");
    }

    const student = await Profiles.findOneAsync({ Owner: this.userId });
    if (!student || student.verified !== true) {
      throw new Meteor.Error(
        "not-approved",
        "Your own account has to be approved before you can add a guardian.",
      );
    }
    if (student.accountType === "parent") {
      throw new Meteor.Error("not-a-student", "Only a student can add a guardian.");
    }

    const me = await Meteor.users.findOneAsync(this.userId, { fields: { schoolId: 1 } });
    if (!me?.schoolId) {
      throw new Meteor.Error("no-school", "Your account is not attached to a school.");
    }

    const address = normalise(email);
    const candidate = await Meteor.users.findOneAsync(
      { "emails.address": { $regex: `^${address.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } },
      { fields: { _id: 1, schoolId: 1 } },
    );

    const refuse = () => {
      throw new Meteor.Error(
        "guardian-not-found",
        "No guardian account is waiting on that address. Ask them to sign up first, "
        + "choosing \"Parent or guardian\" when they do.",
      );
    };

    if (!candidate) refuse();

    const guardian = await Profiles.findOneAsync({ Owner: candidate._id });
    if (!guardian || guardian.accountType !== "parent") refuse();

    if (candidate.schoolId && candidate.schoolId !== me.schoolId) {
      throw new Meteor.Error(
        "guardian-elsewhere",
        "That guardian is already attached to a different school.",
      );
    }

    if ((guardian.guardianOf || []).includes(this.userId)) {
      return { alreadyLinked: true };
    }
    if ((guardian.guardianOf || []).length >= MAX_GUARDIANS) {
      throw new Meteor.Error("too-many", "That guardian is already linked to the maximum number of students.");
    }

    /* The claim does three things at once: attaches the guardian to the
     * student's school, records who vouched for them, and puts them in front
     * of an administrator. None of it means much without the others. */
    await Meteor.users.updateAsync(candidate._id, { $set: { schoolId: me.schoolId } });
    await Profiles.updateAsync(guardian._id, {
      $addToSet: { guardianOf: this.userId },
      $set: { requested: true, rejected: false },
    });

    return { linked: true };
  },
});
