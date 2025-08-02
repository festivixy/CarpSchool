import React from "react";
import { withRouter } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Container,
  SectionHeader,
  SectionTitle,
  Content,
} from "../styles/Landing";
import { MobileOnly, DesktopOnly } from "../../layouts/Devices";
import styled from "styled-components";

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

export default withRouter(MobilePrivacy);
