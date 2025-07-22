import React from "react";
import ReactMarkdown from "react-markdown";
import {
  Container,
  SectionHeader,
  SectionTitle,
  Content,
} from "../styles/Landing";

const privacyContent = `
# **__DEV BUILD__**
`;

/**
 * Privacy Policy page with markdown content
 */
export default function MobilePrivacy() {
  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <SectionHeader>
        <SectionTitle>Privacy Policy</SectionTitle>
      </SectionHeader>
      <Content>
        <ReactMarkdown>{privacyContent}</ReactMarkdown>
      </Content>
    </Container>
  );
}
