/**
 * Helpers for the markdown document pages (About, Blog, Contact, Credits,
 * FAQ, Help, Privacy, TOS).
 *
 * Each of those pages renders its own heading in DocHeader and then renders
 * markdown whose first line is usually an H1 saying the same thing, so the
 * title appeared twice.
 *
 * The content is editable in the database (SystemContent), so the fix cannot
 * be to drop the page's heading: content without a leading H1 would then have
 * no title at all. Instead the page keeps its heading and any leading H1 is
 * stripped from the body.
 */

/**
 * Remove a single leading level-1 heading from a markdown string.
 *
 * Only strips the first heading, only if it is the first non-empty line, and
 * only `# ` (never `## `). Anything else is returned unchanged.
 */
export const stripLeadingH1 = (markdown) => {
  if (typeof markdown !== "string") return markdown;

  const lines = markdown.split("\n");
  let i = 0;
  while (i < lines.length && lines[i].trim() === "") i += 1;
  if (i >= lines.length) return markdown;

  if (!/^#\s+\S/.test(lines[i])) return markdown;

  // Remove the blank lines before the heading, the heading itself, and any
  // blank lines that follow it, so the body does not start with extra
  // vertical space.
  lines.splice(0, i + 1);
  while (lines.length > 0 && lines[0].trim() === "") lines.shift();

  return lines.join("\n");
};

export default stripLeadingH1;
