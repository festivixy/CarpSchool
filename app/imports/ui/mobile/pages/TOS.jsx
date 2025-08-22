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
import { HeaderWithBack } from "../styles/TOS";
import BackButton from "../components/BackButton";
import { SystemContent } from "../../../api/system/System";
import LoadingPage from "../../components/LoadingPage";

const defaultContent = `
# Terms of Service

**This is a development version.** Terms of Service content is being configured by administrators.

Please check back later for the complete terms and conditions.
`;

/**
 * Terms of Service page with markdown content from database
 */
function MobileTOS({ history: _history, tosContent, ready }) {
  const content = tosContent?.content || defaultContent;

  if (!ready) {
    return <LoadingPage message="Loading Terms of Service..." />;
  }

  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <MobileOnly>
        <BackButton />
        <HeaderWithBack>
          <SectionTitle>Terms of Service</SectionTitle>
        </HeaderWithBack>
      </MobileOnly>
      <DesktopOnly>
        <SectionHeader>
          <SectionTitle>Terms of Service</SectionTitle>
        </SectionHeader>
      </DesktopOnly>
      <Content>
        <ReactMarkdown>{content}</ReactMarkdown>
      </Content>
    </Container>
  );
}

MobileTOS.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
  tosContent: PropTypes.object,
  ready: PropTypes.bool.isRequired,
};

export default withRouter(
  withTracker(() => {
    const subscription = Meteor.subscribe("systemContent.byType", "tos");
    const tosContent = SystemContent.findOne({ type: "tos" });

    return {
      tosContent,
      ready: subscription.ready(),
    };
  })(MobileTOS)
);
