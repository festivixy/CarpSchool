import { Schools } from "../schools/Schools";

/**
 * Resolve the school that owns an email address' domain.
 *
 * The product's trust model is "every user is a verified school student"
 * (README), and accounts.registerStudent enforced that on the legacy
 * registration path. That path is no longer routed - signup goes through
 * Clerk - so the check has to live where Clerk accounts are first mirrored
 * into Meteor.
 *
 * Returns { school } on success, or { error } describing why the address is
 * not acceptable. Never throws, so callers decide how to surface it.
 */

const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const schoolForEmail = async (email) => {
  if (typeof email !== "string" || !email.includes("@")) {
    return { error: "Invalid email address." };
  }

  const domain = email.split("@").pop().trim().toLowerCase();
  if (!domain) {
    return { error: "Invalid email address." };
  }

  // Case-insensitive exact match on the school's registered domain.
  const school = await Schools.findOneAsync({
    domain: { $regex: new RegExp(`^${escapeRegex(domain)}$`, "i") },
  });

  if (!school) {
    return {
      error: "That email domain is not registered to a school on CarpSchool. "
        + "Please sign up with your school email address.",
    };
  }

  if (school.isActive === false) {
    return { error: "Registration for this school is currently disabled." };
  }

  return { school };
};

export default schoolForEmail;
