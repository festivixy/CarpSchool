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
# About CarpSchool

## Our Mission

CarpSchool connects students for safe, convenient, and sustainable carpooling. We believe that sharing rides should be easy, affordable, and environmentally friendly.

## How It Works

1. **Sign Up** - Create an account with your school email
2. **Find or Offer Rides** - Browse available rides or offer your own
3. **Connect** - Coordinate with other students through the app
4. **Ride Together** - Share the journey and split costs

## Contact Us

Have questions or feedback? We'd love to hear from you!
- Visit our [Contact page](/contact)
- Email us at support@carpschool.com

---

*CarpSchool - Ride Together, Save Together* 🚙
`;

/**
 * About page with markdown content from database
 */
function MobileAbout({ history: _history, aboutContent, ready }) {
  const content = aboutContent?.content || defaultContent;

  if (!ready) {
    return <LoadingPage message="Loading About..." />;
  }

  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <MobileOnly>
        <BackButton />
        <HeaderWithBack>
          <SectionTitle>About Us</SectionTitle>
        </HeaderWithBack>
      </MobileOnly>
      <DesktopOnly>
        <SectionHeader>
          <SectionTitle>About CarpSchool</SectionTitle>
        </SectionHeader>
      </DesktopOnly>
      <Content>
        <ReactMarkdown>{content}</ReactMarkdown>
      </Content>
    </Container>
  );
}

MobileAbout.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  aboutContent: PropTypes.object,
  ready: PropTypes.bool.isRequired,
};

export default withRouter(
  withTracker(() => {
    const subscription = Meteor.subscribe("systemContent.byType", "about");
    const aboutContent = SystemContent.findOne({ type: "about" });

    return {
      aboutContent,
      ready: subscription.ready(),
    };
  })(MobileAbout),
);
