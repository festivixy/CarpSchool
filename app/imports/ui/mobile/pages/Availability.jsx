import React from "react";
import AvailabilitySchedule from "../components/AvailabilitySchedule";
import {
  Screen, Wrap, Head, Eyebrow, Title, Lede,
} from "../styles/Availability";

/**
 * A driver's own availability. The route is gated on being able to drive, so
 * a rider-only account never reaches this screen.
 */
const MobileAvailability = () => (
  <Screen>
    <Wrap>
      <Head>
        <Eyebrow>Driving</Eyebrow>
        <Title>Your availability</Title>
        <Lede>
          Say when you usually drive and riders at your school can find you during
          those times, without you having to post a ride for each one. Times are in
          your school&apos;s local time.
        </Lede>
      </Head>

      <AvailabilitySchedule />
    </Wrap>
  </Screen>
);

export default MobileAvailability;
