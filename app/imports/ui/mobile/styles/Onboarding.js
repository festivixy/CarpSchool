import styled from "styled-components";
import MapBg from "../../components/MapBg";
import {
  btnBase,
  btnCoral,
  btnGhost,
  eyebrow,
  inputBase,
  marker,
  scrollY,
} from "../../styles/tokens";

/* Below this width the 480px brand column collapses into a short top band. */
const BREAK = "900px";
/* Below this the two-up field rows stack. */
const NARROW = "520px";

/* App.jsx mounts TopNavAuto (+ a 76px NavSpacer) above every signed-in
 * desktop route, /onboarding included, so the wizard cannot be the design's
 * position:absolute; inset:0. It fills what is left of the viewport instead. */
export const Container = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 480px 1fr;
  min-height: calc(100vh - 76px);
  background: var(--cream-0);
  color: var(--ink-1);
  font-family: var(--font-ui);

  @media (max-width: ${BREAK}) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`;

/* ── Left brand panel ─────────────────────────────────────── */

export const BrandPanel = styled.aside`
  position: relative;
  overflow: hidden;
  padding: 40px;
  background: var(--ink-1);
  color: var(--cream-0);
  display: flex;
  flex-direction: column;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 8px;
    background: var(--signal-yellow);
    z-index: 2;
  }

  @media (max-width: ${BREAK}) {
    padding: 26px 20px 24px;
  }
`;

/* Decorative street map, inverted so it reads as chalk on the ink panel. */
export const BrandMap = styled(MapBg)`
  opacity: 0.18;
  filter: invert(0.9);
  pointer-events: none;
`;

export const BrandInner = styled.div`
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export const BrandFoot = styled.div`
  margin-top: auto;
  padding-top: 40px;

  @media (max-width: ${BREAK}) {
    padding-top: 16px;
  }
`;

export const BrandEyebrow = styled.div`
  ${eyebrow}
  color: var(--accent-on-dark);
`;

export const BrandTitle = styled.h1`
  margin: 14px 0 18px;
  font-family: var(--font-display);
  font-size: clamp(38px, 4.4vw, 56px);
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.015em;

  @media (max-width: ${BREAK}) {
    margin: 10px 0 0;
    font-size: 32px;
  }
`;

/* Stabilo-Boss highlight. At most one phrase per heading. */
export const Mark = styled.span`
  ${marker}
`;

export const BrandCopy = styled.p`
  margin: 0 0 28px;
  max-width: 380px;
  font-size: 15px;
  line-height: 1.55;
  color: var(--cream-3);

  @media (max-width: ${BREAK}) {
    display: none;
  }
`;

export const ProofPanel = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 18px;
  border-radius: var(--r-lg);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);

  @media (max-width: ${BREAK}) {
    display: none;
  }
`;

export const ProofTile = styled.div`
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: var(--r-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(127, 176, 206, 0.18);
  color: var(--accent-on-dark);
`;

export const ProofBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const ProofPrimary = styled.div`
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

export const ProofSecondary = styled.div`
  margin-top: 1px;
  font-size: 12px;
  color: var(--cream-3);
`;

/* ── Right form column ────────────────────────────────────── */

export const FormPane = styled.div`
  position: relative;
`;

export const Content = styled.div`
  max-width: 460px;
  margin: 0 auto;
  padding: 88px 24px 40px;

  @media (max-width: ${BREAK}) {
    padding: 32px 20px 32px;
  }
`;

export const StepRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
`;

export const StepBadge = styled.div`
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 700;
  background: ${props => (props.$on ? "var(--signal-yellow)" : "var(--cream-2)")};
  color: ${props => (props.$on ? "var(--on-accent)" : "var(--ink-3)")};
  transition: background 0.2s ease, color 0.2s ease;
`;

export const StepConnector = styled.div`
  flex: 1;
  height: 2px;
  border-radius: 1px;
  background: ${props => (props.$on ? "var(--signal-yellow)" : "var(--cream-2)")};
  transition: background 0.2s ease;
`;

export const StepEyebrow = styled.div`
  ${eyebrow}
`;

export const StepTitle = styled.h2`
  margin: 8px 0;
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: -0.01em;

  @media (max-width: ${BREAK}) {
    font-size: 28px;
  }
`;

export const StepSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: var(--ink-3);
`;

/* Each step's body replays the entry animation, so it carries .fade-in and a
 * key on the step index. */
export const Step = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 24px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const FieldRow = styled.div`
  display: flex;
  gap: 12px;

  > * {
    flex: 1;
    min-width: 0;
  }

  @media (max-width: ${NARROW}) {
    flex-direction: column;
  }
`;

export const Label = styled.label`
  ${eyebrow}
`;

export const Input = styled.input`
  ${inputBase}
`;

/* The address was verified by Clerk at signup and the school derived from its
 * domain, so step 1 confirms it rather than collecting it. */
export const ReadOnlyInput = styled.input`
  ${inputBase}
  background: var(--cream-1);
  color: var(--ink-2);
  cursor: default;

  &:focus {
    border-color: var(--glass-stroke);
    background: var(--cream-1);
    box-shadow: none;
  }
`;

export const InputHint = styled.div`
  font-size: 12px;
  color: var(--ink-4);
`;

export const SelectWrap = styled.div`
  position: relative;
`;

export const Select = styled.select`
  ${inputBase}
  appearance: none;
  -webkit-appearance: none;
  padding-right: 38px;
  cursor: pointer;
`;

export const SelectChevron = styled.span`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  pointer-events: none;
  display: flex;
  color: var(--ink-3);
`;

/* Cream bar used for the detected-school row and the photo rows. */
export const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 12px;
  background: var(--cream-1);
  margin-top: 4px;
`;

export const InfoTile = styled.div`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--cream-2);
  color: var(--ink-2);
`;

export const InfoBody = styled.div`
  flex: 1;
  min-width: 0;
`;

export const InfoTitle = styled.div`
  font-size: 13px;
  font-weight: 600;
`;

export const InfoDesc = styled.div`
  font-size: 12px;
  color: var(--ink-3);
`;

export const InfoMono = styled.div`
  font-family: var(--font-mono);
  font-size: 11.5px;
  color: var(--ink-3);
`;

/* Reassurance pill. The design tints the copy yellow-deep; on the soft yellow
 * ground that is unreadable, so the ink stays and the icon carries the accent. */
export const NotePill = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  margin-top: 4px;
  border-radius: 12px;
  background: var(--signal-yellow-soft);
  color: var(--ink-1);
  font-size: 13px;
  font-weight: 500;
`;

export const NoteIcon = styled.span`
  display: flex;
  flex-shrink: 0;
`;

/* ── School picker (accounts with no domain-matched school) ── */

export const SchoolList = styled.div`
  ${scrollY}
  max-height: 220px;
  border: 1px solid var(--glass-stroke);
  border-radius: var(--r-md);
  background: rgba(255, 255, 255, 0.7);
`;

export const SchoolOption = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 11px 13px;
  border: 0;
  border-bottom: 1px solid var(--glass-stroke);
  text-align: left;
  cursor: pointer;
  font-family: var(--font-ui);
  font-size: 14px;
  color: var(--ink-1);
  background: ${props => (props.$selected ? "var(--signal-yellow-soft)" : "transparent")};

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background: ${props => (props.$selected ? "var(--signal-yellow-soft)" : "var(--cream-1)")};
  }
`;

export const SchoolCode = styled.span`
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--ink-3);
  flex-shrink: 0;
`;

export const SchoolEmpty = styled.div`
  padding: 16px 13px;
  font-size: 13px;
  color: var(--ink-3);
`;

/* ── Step 3 role cards ────────────────────────────────────── */

export const UserTypeOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const UserTypeOption = styled.button`
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 16px;
  border-radius: var(--r-lg);
  text-align: left;
  cursor: pointer;
  font-family: var(--font-ui);
  transition: background 0.15s ease, border-color 0.15s ease;
  background: ${props => (props.$selected ? "var(--signal-yellow-soft)" : "var(--cream-1)")};
  border: ${props => (props.$selected
    ? "1.5px solid var(--signal-yellow)"
    : "1px solid var(--glass-stroke)")};

  &:focus-visible {
    outline: 2px solid var(--ink-1);
    outline-offset: 2px;
  }
`;

export const RoleIconTile = styled.span`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => (props.$selected ? "var(--signal-yellow)" : "var(--cream-2)")};
  color: ${props => (props.$selected ? "var(--on-accent)" : "var(--ink-2)")};
`;

export const RoleBody = styled.span`
  flex: 1;
  min-width: 0;
`;

export const UserTypeTitle = styled.span`
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink-1);
`;

export const UserTypeDesc = styled.span`
  display: block;
  font-size: 13px;
  color: var(--ink-3);
`;

export const RoleRadio = styled.span`
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => (props.$selected ? "var(--signal-yellow)" : "transparent")};
  border: ${props => (props.$selected ? "0" : "2px solid var(--cream-3)")};
`;

/* ── Photo upload ─────────────────────────────────────────── */

export const PreviewImg = styled.img`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
`;

export const FileInput = styled.input`
  display: none;
`;

export const UploadBtn = styled.button`
  ${btnBase}
  ${btnGhost}
  font-size: 12px;
  padding: 7px 14px;
  flex-shrink: 0;
`;

export const UploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  border-radius: 12px;
  background: var(--cream-1);
`;

export const UploadButton = styled.button`
  ${btnBase}
  ${btnCoral}
  ${props => props.disabled && "opacity: 0.5; pointer-events: none;"}
`;

export const FileInfo = styled.div`
  font-size: 12px;
  color: var(--ink-4);
`;

/* ── Messages + footer ────────────────────────────────────── */

export const ErrorMessage = styled.div`
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: var(--r-md);
  background: rgba(176, 58, 110, 0.1);
  color: var(--plum);
  font-size: 14px;
`;

export const SuccessMessage = styled.div`
  margin-top: 16px;
  padding: 10px 14px;
  border-radius: var(--r-md);
  background: rgba(31, 138, 91, 0.12);
  color: var(--leaf);
  font-size: 14px;
`;

export const Navigation = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 28px;
`;

export const PrimaryButton = styled.button`
  ${btnBase}
  ${btnCoral}
  padding: 12px 24px;
  ${props => props.disabled && "opacity: 0.5; pointer-events: none;"}
`;

export const SecondaryButton = styled.button`
  ${btnBase}
  ${btnGhost}
  ${props => props.disabled && "opacity: 0.45; pointer-events: none;"}
`;

/* Terms and Privacy acceptance on the final step. */
export const ConsentRow = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-top: 18px;
  padding: 14px;
  border-radius: var(--r-lg, 14px);
  border: 1px solid ${props => (props.$invalid ? "var(--signal-red, #c0392b)" : "var(--cream-3, #ddd6c8)")};
  background: var(--cream-0, #faf7f0);
  cursor: pointer;
`;

export const ConsentCheck = styled.input`
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  margin-top: 2px;
  accent-color: var(--ink-1, #1a1815);
  cursor: pointer;
`;

export const ConsentText = styled.span`
  font-size: 13px;
  line-height: 1.45;
  color: var(--ink-2, #5b5750);

  a {
    color: var(--ink-1, #1a1815);
    text-decoration: underline;
  }
`;
