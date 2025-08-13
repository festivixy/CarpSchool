import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
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

const privacyContent = `
# **__DEV BUILD__**
`;

/**
 * Privacy Policy page with markdown content
 */
function MobilePrivacy({ history: _history }) {
  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <MobileOnly>
        <BackButton />
        <HeaderWithBack>
          <SectionTitle>Privacy Policy</SectionTitle>
        </HeaderWithBack>
      </MobileOnly>
      <DesktopOnly>
        <SectionHeader>
          <SectionTitle>Privacy Policy</SectionTitle>
        </SectionHeader>
      </DesktopOnly>
      <Content>
        <ReactMarkdown>{privacyContent}</ReactMarkdown>
      </Content>
    </Container>
  );
}

MobilePrivacy.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(MobilePrivacy);
