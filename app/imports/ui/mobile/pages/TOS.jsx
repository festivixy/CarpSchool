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
import { HeaderWithBack } from "../styles/TOS";
import BackButton from "../components/BackButton";

const tosContent = `
# **__DEV BUILD__**
`;

/**
 * Terms of Service page with markdown content
 */
function MobileTOS({ history: _history }) {
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
