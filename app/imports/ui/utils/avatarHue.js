/**
 * The avatar colour for an account.
 *
 * Seven screens had each pasted their own copy of this, in two different
 * flavours, so the same person was one colour in the top nav and another on a
 * ride card. This is the one the nav used, kept because it is the one that
 * survives a missing seed rather than throwing on `seed.length`.
 *
 * @param {string} seed stable per account -- a user id, or a name as a last resort
 * @returns {number} a hue in [0, 360)
 */
export const hueFor = (seed) => {
  if (!seed) return 220;
  let total = 0;
  for (let i = 0; i < seed.length; i += 1) total += seed.charCodeAt(i);
  return total % 360;
};

export default hueFor;
