import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import LoginDropdown from "../components/LoginDropdown";
import Icon from "../../components/Icon";
import {
  Container,
  Band,
  Wrap,
  Eyebrow,
  Mark,
  HeroBand,
  HeroGrid,
  HeroCopy,
  HeroTitle,
  HeroLede,
  HeroActions,
  TrustNote,
  RideCard,
  RideCardHead,
  RideBadge,
  Route,
  RouteRail,
  RouteDot,
  RouteLine,
  RouteStops,
  StopLabel,
  StopName,
  RideMeta,
  MetaPill,
  BandTitle,
  BandLede,
  CardGrid,
  Card,
  CardIcon,
  CardTitle,
  CardText,
  Steps,
  Step,
  StepNum,
  StepTitle,
  StepText,
  SplitGrid,
  SplitCard,
  SplitTitle,
  SplitText,
  FinalCta,
  CtaContent,
  CtaTitle,
  CtaButtons,
} from "../styles/Landing";

/**
 * Landing page.
 *
 * Built like a consumer rideshare homepage: the hero states the offer beside a
 * picture of the product, then reasons to care, then the steps, then a path
 * for each kind of user.
 *
 * The hero plays on mount and each band reveals as it scrolls into view.
 * Motion wraps the existing styled components rather than adding wrapper
 * elements, so the markup and the gaps that space it stay as they are.
 * Variants only propagate through motion components, which is why the plain
 * layout containers are wrapped too even where they carry no animation.
 */

/* Wrapped once at module scope: calling motion() during render returns a new
 * component type each time, which would remount the subtree on every render. */
const MotionHeroCopy = motion(HeroCopy);
const MotionEyebrow = motion(Eyebrow);
const MotionHeroTitle = motion(HeroTitle);
const MotionHeroLede = motion(HeroLede);
const MotionHeroActions = motion(HeroActions);
const MotionTrustNote = motion(TrustNote);
const MotionRideCard = motion(RideCard);
const MotionWrap = motion(Wrap);
const MotionBandTitle = motion(BandTitle);
const MotionBandLede = motion(BandLede);
const MotionCardGrid = motion(CardGrid);
const MotionCard = motion(Card);
const MotionSteps = motion(Steps);
const MotionStep = motion(Step);
const MotionSplitGrid = motion(SplitGrid);
const MotionSplitCard = motion(SplitCard);
const MotionFinalCta = motion(FinalCta);
const MotionCtaContent = motion(CtaContent);
const MotionCtaTitle = motion(CtaTitle);
const MotionCtaButtons = motion(CtaButtons);

/* Gentle ease-out, to match the unhurried editorial feel of the page. */
const EASE = [0.22, 1, 0.36, 1];

/* Reveal once, when a fifth of the band has scrolled into view. Bands are tall,
 * so waiting for a third of one would fire late. */
const VIEWPORT = { once: true, amount: 0.2 };

/*
 * whileInView needs IntersectionObserver. Without it these elements would sit
 * at their "hidden" opacity forever and the page would look empty, so fall
 * back to showing everything immediately.
 */
const canObserve = typeof IntersectionObserver !== "undefined";

const revealProps = canObserve
  ? { initial: "hidden", whileInView: "visible", viewport: VIEWPORT }
  : { initial: "hidden", animate: "visible" };

const group = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.04 } },
};

const buildItem = (distance, duration) => ({
  hidden: { opacity: 0, y: distance },
  visible: { opacity: 1, y: 0, transition: { duration, ease: EASE } },
});

const REASONS = [
  {
    icon: "school",
    title: "Verified by school email",
    text: "Every user is verified through a school email, so you're only ever "
      + "connecting with other confirmed families at your school.",
  },
  {
    icon: "dollar",
    title: "Split the cost, not a fare",
    text: "A driver can set a small per-seat contribution toward fuel and "
      + "parking. It's a cost split between you, and CarpSchool never takes a cut.",
  },
  {
    icon: "leaf",
    title: "One car instead of four",
    text: "Fewer cars heading to the same place each morning means less traffic "
      + "at the gates, easier parking, and company on the way.",
  },
];

const STEPS = [
  {
    title: "Verify your school email",
    text: "Sign up with your school address. New accounts are reviewed by a "
      + "community administrator before they're approved.",
  },
  {
    title: "Set up your profile",
    text: "Set up your profile as a driver, a rider, or both, and you're ready to go.",
  },
  {
    title: "Browse or post a ride",
    text: "Browse upcoming rides or post your own — it's added straight to your calendar.",
  },
];

export default function MobileLanding() {
  const reduceMotion = useReducedMotion();

  /*
   * Reduced motion keeps the sequencing and the fade but drops the travel, so
   * the page still arrives in order without anything sliding across the screen.
   */
  const item = buildItem(reduceMotion ? 0 : 20, reduceMotion ? 0.25 : 0.55);
  const title = buildItem(reduceMotion ? 0 : 28, reduceMotion ? 0.25 : 0.65);
  const cardIn = {
    hidden: {
      opacity: 0,
      y: reduceMotion ? 0 : 22,
      scale: reduceMotion ? 1 : 0.985,
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
      <HeroBand>
        <HeroGrid>
          <MotionHeroCopy variants={group} initial="hidden" animate="visible">
            <MotionEyebrow variants={item}>Carpools for your school</MotionEyebrow>

            <MotionHeroTitle variants={title}>
              Share the ride.
              {" "}
              <Mark>Skip the bus.</Mark>
            </MotionHeroTitle>

            <MotionHeroLede variants={item}>
              CarpSchool helps families in your school community coordinate
              carpools — safely and easily.
            </MotionHeroLede>

            <MotionHeroActions variants={item}>
              <LoginDropdown primary />
            </MotionHeroActions>

            <MotionTrustNote variants={item}>
              <Icon name="check" size={14} />
              School email required. Every account is reviewed before approval.
            </MotionTrustNote>
          </MotionHeroCopy>

          <MotionRideCard
            variants={cardIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: reduceMotion ? 0 : 0.25 }}
          >
            <RideCardHead>
              <span>Example ride</span>
              <RideBadge>
                <Icon name="seat" size={11} />
                2 seats left
              </RideBadge>
            </RideCardHead>

            <Route>
              <RouteRail>
                <RouteDot />
                <RouteLine />
                <RouteDot $end />
              </RouteRail>

              <RouteStops>
                <div>
                  <StopLabel>Pickup</StopLabel>
                  <StopName>Northside, by the library</StopName>
                </div>
                <div>
                  <StopLabel>Drop-off</StopLabel>
                  <StopName>Main campus</StopName>
                </div>
              </RouteStops>
            </Route>

            <RideMeta>
              <MetaPill>
                <Icon name="clock" size={12} />
                8:15 AM
              </MetaPill>
              <MetaPill>
                <Icon name="car" size={12} />
                Mon–Fri
              </MetaPill>
            </RideMeta>
          </MotionRideCard>
        </HeroGrid>
      </HeroBand>

      <Band $alt>
        <MotionWrap variants={group} {...revealProps}>
          <MotionBandTitle variants={item}>What is CarpSchool?</MotionBandTitle>

          <MotionBandLede variants={item}>
            A carpool is easier to arrange when everyone already has something in
            common. CarpSchool keeps it to your school, so the person picking up
            is someone your community can vouch for.
          </MotionBandLede>

          <MotionCardGrid variants={group}>
            {REASONS.map(reason => (
              <MotionCard key={reason.title} variants={cardIn}>
                <CardIcon>
                  <Icon name={reason.icon} size={20} />
                </CardIcon>
                <CardTitle>{reason.title}</CardTitle>
                <CardText>{reason.text}</CardText>
              </MotionCard>
            ))}
          </MotionCardGrid>
        </MotionWrap>
      </Band>

      <Band>
        <MotionWrap variants={group} {...revealProps}>
          <MotionBandTitle variants={item}>How It Works</MotionBandTitle>

          <MotionBandLede variants={item}>
            Three steps from signing up to sharing your first ride.
          </MotionBandLede>

          <MotionSteps variants={group}>
            {STEPS.map((step, index) => (
              <MotionStep key={step.title} variants={item}>
                <StepNum>{index + 1}</StepNum>
                <div>
                  <StepTitle>{step.title}</StepTitle>
                  <StepText>{step.text}</StepText>
                </div>
              </MotionStep>
            ))}
          </MotionSteps>
        </MotionWrap>
      </Band>

      <Band $alt>
        <MotionWrap variants={group} {...revealProps}>
          <MotionBandTitle variants={item}>
            Driving, riding, or a bit of both
          </MotionBandTitle>

          <MotionBandLede variants={item}>
            Most people end up doing both, depending on the week. You can change
            it at any time.
          </MotionBandLede>

          <MotionSplitGrid variants={group}>
            <MotionSplitCard $dark variants={cardIn}>
              <SplitTitle>Driving anyway?</SplitTitle>
              <SplitText $dark>
                Post the seats you already have. You choose who rides with you,
                and the fuel gets split instead of coming out of your pocket.
              </SplitText>
            </MotionSplitCard>

            <MotionSplitCard variants={cardIn}>
              <SplitTitle>Need a lift?</SplitTitle>
              <SplitText>
                Find someone already heading your way, message them in the app,
                and agree on where to meet. No waiting at a stop in the rain.
              </SplitText>
            </MotionSplitCard>
          </MotionSplitGrid>
        </MotionWrap>
      </Band>

      <MotionFinalCta variants={cardIn} {...revealProps}>
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
