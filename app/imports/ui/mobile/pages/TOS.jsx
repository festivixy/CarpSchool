import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import styled from "styled-components";
import {
  Container,
  SectionHeader,
  SectionTitle,
  Content,
} from "../styles/Landing";
import { MobileOnly, DesktopOnly } from "/imports/ui/layouts/Devices";

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
  position: absolute;
  left: 20px;
  top: 20px;

  &:hover {
    background-color: rgba(240, 240, 240, 1);
  }

  img {
    width: 24px;
    height: 24px;
  }
`;

const HeaderWithBack = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 0;
`;

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
