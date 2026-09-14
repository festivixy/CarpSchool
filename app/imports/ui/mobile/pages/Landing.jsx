import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import LoginDropdown from "../components/LoginDropdown";
import {
  Container,
  Hero,
  HeroContent,
  LogoSection,
  AppName,
  CtaSection,
  Features,
  SectionHeader,
  SectionTitle,
  Content,
  Paragraph,
  HowItWorks,
  FinalCta,
  CtaContent,
  CtaTitle,
  CtaButtons,
} from "../styles/Landing";

/**
 * Landing page.
 *
 * The hero plays on mount and each section reveals as it scrolls into view.
 * Motion is applied by wrapping the existing styled components rather than by
 * adding wrapper elements, so the markup -- and the flex gaps that space it --
 * stay exactly as they were. Variants only propagate through motion
 * components, which is why the plain layout containers are wrapped too even
 * though they carry no animation of their own.
 */

/* Wrapped once at module scope: calling motion() during render returns a new
 * component type each time, which would remount the subtree on every render. */
const MotionHeroContent = motion(HeroContent);
const MotionLogoSection = motion(LogoSection);
const MotionAppName = motion(AppName);
const MotionCtaSection = motion(CtaSection);
const MotionFeatures = motion(Features);
const MotionHowItWorks = motion(HowItWorks);
const MotionSectionHeader = motion(SectionHeader);
const MotionContent = motion(Content);
const MotionParagraph = motion(Paragraph);
const MotionFinalCta = motion(FinalCta);
const MotionCtaContent = motion(CtaContent);
const MotionCtaTitle = motion(CtaTitle);
const MotionCtaButtons = motion(CtaButtons);

/* Gentle ease-out, to match the unhurried editorial feel of the page. */
const EASE = [0.22, 1, 0.36, 1];

/* Reveal once, when a third of the section has scrolled into view. */
const VIEWPORT = { once: true, amount: 0.3 };

/*
 * whileInView needs IntersectionObserver. Without it these elements would sit
 * at their "hidden" opacity forever and the copy would never appear, so fall
 * back to showing everything immediately.
 */
const canObserve = typeof IntersectionObserver !== "undefined";

const revealProps = canObserve
  ? { initial: "hidden", whileInView: "visible", viewport: VIEWPORT }
  : { initial: "hidden", animate: "visible" };

const group = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.04 } },
};

const buildItem = (distance, duration) => ({
  hidden: { opacity: 0, y: distance },
  visible: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
});

export default function MobileLanding() {
  const reduceMotion = useReducedMotion();

  /*
   * Reduced motion keeps the sequencing and the fade but drops the travel and
   * the scale, so the page still arrives in order without anything sliding.
   */
  const item = buildItem(reduceMotion ? 0 : 20, reduceMotion ? 0.25 : 0.55);
  const title = buildItem(reduceMotion ? 0 : 32, reduceMotion ? 0.25 : 0.7);
  const card = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 24,
      scale: reduceMotion ? 1 : 0.98,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: reduceMotion ? 0.25 : 0.6, ease: EASE },
    },
  };

  return (
    <Container>
      <Hero>
        <MotionHeroContent variants={group} initial="hidden" animate="visible">
          <MotionLogoSection variants={group}>
            <MotionAppName variants={title}>CarpSchool</MotionAppName>
          </MotionLogoSection>

          <MotionCtaSection variants={item}>
            <LoginDropdown />
          </MotionCtaSection>
        </MotionHeroContent>
      </Hero>

      <MotionFeatures variants={group} {...revealProps}>
        <MotionSectionHeader variants={item}>
          <SectionTitle>What is CarpSchool?</SectionTitle>
        </MotionSectionHeader>

        <MotionContent variants={group}>
          <MotionParagraph variants={item}>
            CarpSchool helps families in your school community coordinate
            carpools — safely and easily.
          </MotionParagraph>

          <MotionParagraph variants={item}>
            Every user is verified through a school email, so you&apos;re only
            ever connecting with other confirmed families at your school.
          </MotionParagraph>
        </MotionContent>
      </MotionFeatures>

      <MotionHowItWorks variants={group} {...revealProps}>
        <MotionSectionHeader variants={item}>
          <SectionTitle>How It Works</SectionTitle>
        </MotionSectionHeader>

        <MotionContent variants={group}>
          <MotionParagraph variants={item}>
            Browse upcoming rides or post your own — it&apos;s added straight to
            your calendar.
          </MotionParagraph>

          <MotionParagraph variants={item}>
            Set up your profile as a driver, a rider, or both, and you&apos;re
            ready to go.
          </MotionParagraph>
        </MotionContent>
      </MotionHowItWorks>

      <MotionFinalCta variants={card} {...revealProps}>
        <MotionCtaContent variants={group}>
          <MotionCtaTitle variants={item}>
            Ready to Start Ride Sharing?
          </MotionCtaTitle>

          <MotionCtaButtons variants={item}>
            <LoginDropdown />
          </MotionCtaButtons>
        </MotionCtaContent>
      </MotionFinalCta>
    </Container>
  );
}
