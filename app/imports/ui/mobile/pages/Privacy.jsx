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
import { BackButton, HeaderWithBack } from "../styles/Privacy";

const privacyContent = `
# **__DEV BUILD__**
`;

/**
 * Privacy Policy page with markdown content
 */
function MobilePrivacy({ history }) {
  const handleBack = () => {
    history.goBack();
  };

  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <MobileOnly>
        <HeaderWithBack>
          <BackButton onClick={handleBack}>
            <img src="/svg/back.svg" alt="Back" />
          </BackButton>
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
