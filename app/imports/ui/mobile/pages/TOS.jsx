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
import { BackButton, HeaderWithBack } from "../styles/TOS";

const tosContent = `
# **__DEV BUILD__**
`;

/**
 * Terms of Service page with markdown content
 */
function MobileTOS({ history }) {
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
          <SectionTitle>Terms of Service</SectionTitle>
        </HeaderWithBack>
      </MobileOnly>
      <DesktopOnly>
        <SectionHeader>
          <SectionTitle>Terms of Service</SectionTitle>
        </SectionHeader>
      </DesktopOnly>
      <Content>
        <ReactMarkdown>{tosContent}</ReactMarkdown>
      </Content>
    </Container>
  );
}

MobileTOS.propTypes = {
  history: PropTypes.shape({
    goBack: PropTypes.func.isRequired,
  }).isRequired,
};

export default withRouter(MobileTOS);
