import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import ReactMarkdown from "react-markdown";
import {
  Container,
  SectionHeader,
  SectionTitle,
  Content,
} from "../styles/Landing";
import { MobileOnly, DesktopOnly } from "../../layouts/Devices";
import { HeaderWithBack } from "../styles/Privacy";
import BackButton from "../components/BackButton";
import { SystemContent } from "../../../api/system/System";
import LoadingPage from "../../components/LoadingPage";

const defaultContent = `
# Frequently Asked Questions

## Getting Started

### How do I create an account?
1. Download the CarpSchool app or visit our website
2. Click "Sign Up" and enter your school email
3. Verify your email and complete the onboarding process
4. You're ready to start carpooling!

### Why do I need to use my school email?
School emails help us verify that you're part of your school community, keeping everyone safe and ensuring rides are only shared with verified students.

## Finding & Joining Rides

### How do I find a ride?
Browse the Marketplace to see available rides. You can filter by date, time, and destination to find the perfect ride.

### Can I request a specific pickup location?
When joining a ride, you can suggest a pickup location. The driver will review and confirm if it works with their route.

### What if my ride gets cancelled?
You'll receive a notification immediately. We recommend having a backup plan and booking rides in advance when possible.

## Offering Rides

### How do I offer a ride?
Go to "My Rides" and tap "Offer a Ride". Enter your route details, available seats, and preferred pickup times.

### Can I charge for rides?
CarpSchool is designed for cost-sharing, not profit. You can share fuel costs with passengers, but charging more than actual costs is not allowed.

### How many passengers can I take?
You can offer as many seats as are legally available in your vehicle (minus the driver's seat).

## Safety

### How is my information protected?
We use industry-standard encryption and never share your personal information with third parties. See our Privacy Policy for details.

### What if I feel unsafe?
Your safety is our top priority. You can:
- Cancel a ride at any time
- Report users through the app
- Contact our safety team at safety@carpschool.com

### Are drivers verified?
All users must verify their school email. Some schools may have additional verification requirements.

## Account & Settings

### How do I change my password?
Go to Settings > Account > Change Password. You'll need to enter your current password to set a new one.

### Can I delete my account?
Yes, go to Settings > Account > Delete Account. This action is permanent and cannot be undone.

### How do I update my notification preferences?
Go to Settings > Notifications to customize which alerts you receive.

---

*Still have questions? [Contact us](/contact) and we'll be happy to help!*
`;

/**
 * FAQ page with markdown content from database
 */
function MobileFAQ({ history: _history, faqContent, ready }) {
  const content = faqContent?.content || defaultContent;

  if (!ready) {
    return <LoadingPage message="Loading FAQ..." />;
  }

  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <MobileOnly>
        <BackButton />
        <HeaderWithBack>
          <SectionTitle>FAQ</SectionTitle>
        </HeaderWithBack>
      </MobileOnly>
      <DesktopOnly>
        <SectionHeader>
          <SectionTitle>Frequently Asked Questions</SectionTitle>
        </SectionHeader>
      </DesktopOnly>
      <Content>
        <ReactMarkdown>{content}</ReactMarkdown>
      </Content>
    </Container>
  );
}

MobileFAQ.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  faqContent: PropTypes.object,
  ready: PropTypes.bool.isRequired,
};

export default withRouter(
  withTracker(() => {
    const subscription = Meteor.subscribe("systemContent.byType", "faq");
    const faqContent = SystemContent.findOne({ type: "faq" });

    return {
      faqContent,
      ready: subscription.ready(),
    };
  })(MobileFAQ),
);
