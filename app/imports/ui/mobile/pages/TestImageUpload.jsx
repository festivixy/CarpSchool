import React, { useState } from "react";
import ImageUpload from "../components/ImageUpload";
import ImageViewer from "../components/ImageViewer";
import {
  Container,
  Header,
  AppName,
  Content,
  Copy,
  Title,
  Subtitle,
  Section,
  SectionTitle,
  SectionContent,
  ComponentContainer,
  StatusCard,
  StatusHeader,
  StatusIcon,
  StatusInfo,
  StatusLabel,
  StatusValue,
  Divider,
  InfoGrid,
  InfoItem,
} from "../styles/TestImageUpload";

/**
 * Modern TestImageUpload page with clean design and better UX
 */
const MobileTestImageUpload = () => {
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleUploadSuccess = (result) => {
    console.log("Upload success:", result);
    setUploadResult(result);
    setUploadError(null);
  };

  const handleUploadError = (error) => {
    console.error("Upload error:", error);
    setUploadError(error);
    setUploadResult(null);
  };

  return (
    <Container>
      <Header>
        <AppName>Image Upload Test</AppName>
      </Header>

      <Content>
        <Copy>
          <Title>Test Image Upload & Viewer</Title>
          <Subtitle>
            Upload images and view them by UUID for testing purposes
          </Subtitle>
        </Copy>

        <Section>
          <SectionTitle>📤 Upload Image</SectionTitle>
          <SectionContent>
            <ComponentContainer>
              <ImageUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </ComponentContainer>

            {uploadResult && (
              <StatusCard success>
                <StatusHeader>
                  <StatusIcon>✅</StatusIcon>
                  <StatusInfo>
                    <StatusLabel>Upload Successful!</StatusLabel>
                  </StatusInfo>
                </StatusHeader>

                <InfoGrid>
                  <InfoItem>
                    <StatusLabel>UUID</StatusLabel>
                    <StatusValue>{uploadResult.uuid}</StatusValue>
                  </InfoItem>
                  <InfoItem>
                    <StatusLabel>SHA256 Hash</StatusLabel>
                    <StatusValue>{uploadResult.sha256Hash}</StatusValue>
                  </InfoItem>
                  <InfoItem>
                    <StatusLabel>Image ID</StatusLabel>
                    <StatusValue>{uploadResult.imageId}</StatusValue>
                  </InfoItem>
                </InfoGrid>
              </StatusCard>
            )}

            {uploadError && (
              <StatusCard error>
                <StatusHeader>
                  <StatusIcon>❌</StatusIcon>
                  <StatusInfo>
                    <StatusLabel>Upload Failed</StatusLabel>
                    <StatusValue>
                      {uploadError.reason ||
                        uploadError.message ||
                        "Unknown error occurred"}
                    </StatusValue>
                  </StatusInfo>
                </StatusHeader>
              </StatusCard>
            )}
          </SectionContent>
        </Section>

        <Divider />

        <Section>
          <SectionTitle>👁️ View Image</SectionTitle>
          <SectionContent>
            <ComponentContainer>
              <ImageViewer uuid={uploadResult ? uploadResult.uuid : ""} />
            </ComponentContainer>
          </SectionContent>
        </Section>
      </Content>
    </Container>
  );
};

export default MobileTestImageUpload;
