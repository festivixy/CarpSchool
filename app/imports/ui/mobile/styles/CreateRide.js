import styled from "styled-components";
import {
  btnBase,
  btnCoral,
  eyebrow,
  inputBase,
  marker,
} from "../../styles/tokens";

export const Page = styled.div`
  min-height: 100vh;
  background: var(--cream-0);
  color: var(--ink-1);
  font-family: var(--font-ui);
  padding: 32px 16px 96px;
`;

export const Inner = styled.div`
  max-width: 760px;
  margin: 0 auto;
`;

export const Title = styled.h1`
  margin: 0 0 24px;
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 800;
  letter-spacing: -0.03em;
`;

export const Mark = styled.span`
  ${marker}
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SectionTitle = styled.div`
  ${eyebrow}
  font-size: 12px;
`;

export const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 12px;
  align-items: end;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  ${eyebrow}
`;

export const Input = styled.input`
  ${inputBase}
`;

export const Select = styled.select`
  ${inputBase}
`;

export const Textarea = styled.textarea`
  ${inputBase}
  min-height: 80px;
  resize: vertical;
`;

export const SwapBtn = styled.button`
  align-self: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--glass-stroke);
  background: var(--cream-1);
  cursor: pointer;
  font-size: 16px;
`;

export const Stepper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StepBtn = styled.button`
  width: 36px;
  height: 36px;
  border-radius: var(--r-md);
  border: 1px solid var(--glass-stroke);
  background: var(--cream-1);
  cursor: pointer;
  font-size: 18px;
`;

export const StepValue = styled.div`
  min-width: 40px;
  text-align: center;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
`;

export const Hint = styled.div`
  font-size: 12px;
  color: var(--ink-4);
`;

export const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`;

export const PostBtn = styled.button`
  ${btnBase}
  ${btnCoral}
  font-size: 15px;
  padding: 13px 24px;
  ${props => props.disabled && "opacity: 0.5; pointer-events: none;"}
`;

export const ErrorMessage = styled.div`
  padding: 10px 14px;
  border-radius: var(--r-md);
  background: rgba(176, 58, 110, 0.1);
  color: var(--plum);
  font-size: 14px;
`;

export const Notice = styled.div`
  padding: 16px;
  border-radius: var(--r-lg);
  background: var(--signal-yellow-soft);
  color: var(--ink-2);
  font-size: 14px;
  line-height: 1.5;
`;
