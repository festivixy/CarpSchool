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
# Contact Us

We'd love to hear from you! Here's how you can get in touch:

## General Inquiries

For general questions about CarpSchool:
- **Email:** support@carpschool.com

## Technical Support

Having technical issues with the app?
- **Email:** tech@carpschool.com
- Please include your device type, OS version, and a description of the issue

## Feedback

Have suggestions for improving CarpSchool?
- **Email:** feedback@carpschool.com
- We read every piece of feedback!

## Safety Concerns

To report safety concerns or suspicious activity:
- **Email:** safety@carpschool.com
- For emergencies, always contact local authorities first

## Business Inquiries

For partnership or school integration inquiries:
- **Email:** partnerships@carpschool.com

---

*We aim to respond to all inquiries within 24-48 hours.*
`;

/**
 * Contact page with markdown content from database
 */
function MobileContact({ history: _history, contactContent, ready }) {
  const content = contactContent?.content || defaultContent;

  if (!ready) {
    return <LoadingPage message="Loading Contact Info..." />;
  }

  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <MobileOnly>
        <BackButton />
        <HeaderWithBack>
          <SectionTitle>Contact Us</SectionTitle>
        </HeaderWithBack>
      </MobileOnly>
      <DesktopOnly>
        <SectionHeader>
          <SectionTitle>Contact Us</SectionTitle>
        </SectionHeader>
      </DesktopOnly>
      <Content>
        <ReactMarkdown>{content}</ReactMarkdown>
      </Content>
    </Container>
  );
}

MobileContact.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  contactContent: PropTypes.object,
  ready: PropTypes.bool.isRequired,
};

export default withRouter(
  withTracker(() => {
    const subscription = Meteor.subscribe("systemContent.byType", "contact");
    const contactContent = SystemContent.findOne({ type: "contact" });

    return {
      contactContent,
      ready: subscription.ready(),
    };
  })(MobileContact),
);
