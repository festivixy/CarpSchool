import styled from "styled-components";
import { prose, eyebrow, marker } from "../../styles/tokens";

export const Container = styled.div`
  min-height: 100vh;
  background: var(--cream-0);
  color: var(--ink-1);
  font-family: var(--font-ui);
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

/* Long-form markdown pages (About, Blog, Contact, Credits, FAQ, Help,
 * Privacy, TOS) mount straight inside Container with no section wrapper to
 * centre them, so this supplies the measure, gutters and prose typography
 * that ReactMarkdown output would otherwise render without. */
/* Fixed px rather than ch: `ch` resolves against each element's own font, so
 * the display-face header and the body-copy content computed to different
 * widths (631px vs 699px) and their centred left edges disagreed by 33px. */
const DOC_MEASURE = "700px";

export const DocContent = styled.div`
  ${prose}
  max-width: ${DOC_MEASURE};
  margin: 0 auto;
  padding: 8px 20px 40px;
`;

export const DocHeader = styled.div`
  max-width: ${DOC_MEASURE};
  margin: 0 auto;
  padding: 32px 20px 0;
`;

export const FinalCta = styled.section`
  margin: 40px 20px 80px;
  padding: 48px 24px;
  background: var(--ink-1);
  color: var(--cream-0);
  border-radius: var(--r-xl);
  text-align: center;
`;

export const CtaContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

export const CtaTitle = styled.h2`
  margin: 0;
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 700;
`;

export const CtaButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
`;

/* ---------------------------------------------------------------------------
 * Marketing sections for the landing page.
 *
 * The page used to be a wordmark, a button and two paragraphs. These build it
 * out the way a consumer rideshare homepage is built: a hero that states the
 * offer beside a picture of the product, then reasons to care, then the steps,
 * then a path for each kind of user.
 *
 * The exports above this point are shared with the markdown document pages
 * (About, FAQ, Privacy, TOS and the rest).
 * ------------------------------------------------------------------------- */

const BAND_MEASURE = "1040px";

/* Full-bleed horizontal band. $alt paints the recessed tone so consecutive
 * sections separate without needing rules drawn between them. */
export const Band = styled.section`
  padding: 72px 20px;
  background: ${props => (props.$alt ? "var(--cream-1)" : "transparent")};

  @media (max-width: 640px) {
    padding: 48px 20px;
  }
`;

export const Wrap = styled.div`
  max-width: ${BAND_MEASURE};
  margin: 0 auto;
`;

export const Eyebrow = styled.div`
  ${eyebrow}
  margin-bottom: 14px;
`;

/* The Stabilo-Boss highlight, used once, in the hero headline. */
export const Mark = styled.em`
  ${marker}
`;

/* ---- Hero ---------------------------------------------------------------- */

export const HeroBand = styled.section`
  padding: 72px 20px 64px;

  @media (max-width: 640px) {
    padding: 40px 20px 48px;
  }
`;

export const HeroGrid = styled.div`
  max-width: ${BAND_MEASURE};
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 56px;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

export const HeroCopy = styled.div`
  @media (max-width: 900px) {
    text-align: center;
  }
`;

export const HeroTitle = styled.h1`
  margin: 0 0 18px;
  font-family: var(--font-display);
  font-size: clamp(40px, 6vw, 64px);
  font-weight: 700;
  line-height: 1.04;
  letter-spacing: -0.015em;
`;

export const HeroLede = styled.p`
  margin: 0 0 28px;
  max-width: 46ch;
  font-size: 17.5px;
  line-height: 1.6;
  color: var(--ink-3);

  @media (max-width: 900px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

export const HeroActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 900px) {
    justify-content: center;
  }
`;

/* The tick is inline rather than a flex sibling: as a flex item it was pushed
 * to the far edge once the note wrapped onto a second line, leaving it
 * stranded away from the words it belongs to. */
export const TrustNote = styled.div`
  margin-top: 18px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--ink-4);

  svg {
    vertical-align: -2px;
    margin-right: 6px;
  }
`;

/* ---- Hero visual: a stylised ride, so the hero shows the product ---------- */

export const RideCard = styled.div`
  background: var(--cream-0);
  border: 1px solid var(--cream-2);
  border-radius: var(--r-xl);
  padding: 22px;
  box-shadow: 0 18px 40px rgba(12, 12, 10, 0.08);
`;

export const RideCardHead = styled.div`
  ${eyebrow}
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
`;

export const RideBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: var(--r-pill);
  background: var(--signal-yellow-soft);
  color: var(--ink-2);
  letter-spacing: 0.06em;
`;

export const Route = styled.div`
  display: grid;
  grid-template-columns: 18px 1fr;
  column-gap: 14px;
`;

/* The rail is its own column so the dots and the dashed line between them stay
 * aligned however the labels beside them wrap. */
export const RouteRail = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 6px 0;
`;

export const RouteDot = styled.span`
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex: 0 0 auto;
  background: ${props => (props.$end ? "var(--ink-1)" : "transparent")};
  border: 2px solid var(--ink-1);
`;

export const RouteLine = styled.span`
  flex: 1;
  width: 0;
  min-height: 46px;
  border-left: 2px dashed var(--cream-3);
  margin: 4px 0;
`;

export const RouteStops = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 30px;
`;

export const StopLabel = styled.div`
  ${eyebrow}
  margin-bottom: 2px;
`;

export const StopName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: var(--ink-1);
`;

export const RideMeta = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 22px;
  padding-top: 18px;
  border-top: 1px solid var(--cream-2);
`;

export const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 11px;
  border-radius: var(--r-pill);
  background: var(--cream-1);
  font-size: 12.5px;
  font-weight: 500;
  color: var(--ink-2);
`;

/* ---- Reason cards -------------------------------------------------------- */

export const BandTitle = styled.h2`
  margin: 0 0 12px;
  font-family: var(--font-display);
  font-size: clamp(28px, 3.4vw, 38px);
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.12;
`;

export const BandLede = styled.p`
  margin: 0 0 40px;
  max-width: 54ch;
  font-size: 16.5px;
  line-height: 1.6;
  color: var(--ink-3);
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  padding: 26px 24px;
  border-radius: var(--r-lg);
  background: var(--cream-0);
  border: 1px solid var(--cream-2);
`;

export const CardIcon = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  margin-bottom: 16px;
  border-radius: var(--r-md);
  background: var(--signal-yellow);
  color: var(--ink-1);
`;

export const CardTitle = styled.h3`
  margin: 0 0 8px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.005em;
`;

export const CardText = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.58;
  color: var(--ink-3);
`;

/* ---- Numbered steps ------------------------------------------------------ */

export const Steps = styled.ol`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
  margin: 0;
  padding: 0;
  list-style: none;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const Step = styled.li`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

export const StepNum = styled.span`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid var(--ink-1);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-1);
`;

export const StepTitle = styled.h3`
  margin: 4px 0 6px;
  font-family: var(--font-display);
  font-size: 18.5px;
  font-weight: 700;
`;

export const StepText = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 1.55;
  color: var(--ink-3);
`;

/* ---- Two paths ----------------------------------------------------------- */

export const SplitGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

/* $dark inverts one of the pair so the two paths read as a choice rather than
 * as two of the same thing. */
export const SplitCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 34px 30px;
  border-radius: var(--r-xl);
  background: ${props => (props.$dark ? "var(--ink-1)" : "var(--cream-0)")};
  color: ${props => (props.$dark ? "var(--cream-0)" : "var(--ink-1)")};
  border: 1px solid ${props => (props.$dark ? "var(--ink-1)" : "var(--cream-2)")};
`;

export const SplitTitle = styled.h3`
  margin: 0;
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.005em;
`;

export const SplitText = styled.p`
  margin: 0;
  font-size: 15.5px;
  line-height: 1.58;
  color: ${props => (props.$dark ? "var(--cream-2)" : "var(--ink-3)")};
`;
