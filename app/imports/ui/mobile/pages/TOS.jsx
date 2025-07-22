import React from "react";
import ReactMarkdown from "react-markdown";
import {
  Container,
  SectionHeader,
  SectionTitle,
  Content,
} from "../styles/Landing";

const tosContent = `
# **__DEV BUILD__**
`;

/**
 * Terms of Service page with markdown content
 */
export default function MobileTOS() {
  return (
    <Container style={{ minHeight: "100vh", paddingBottom: "40px" }}>
      <SectionHeader>
        <SectionTitle>Terms of Service</SectionTitle>
      </SectionHeader>
      <Content>
        <ReactMarkdown>{tosContent}</ReactMarkdown>
      </Content>
    </Container>
  );
}
