import React, { useState } from 'react';
import { Container, Header, Message, Segment, Divider } from 'semantic-ui-react';
import ImageUpload from '../components/ImageUpload';
import ImageViewer from '../components/ImageViewer';

const TestImageUpload = () => {
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleUploadSuccess = (result) => {
    console.log('Upload success:', result);
    setUploadResult(result);
    setUploadError(null);
  };

  const handleUploadError = (error) => {
    console.error('Upload error:', error);
    setUploadError(error);
    setUploadResult(null);
  };

  return (
    <Container>
      <Header as="h1">Image Upload Test</Header>

      <ImageUpload
        onUploadSuccess={handleUploadSuccess}
        onUploadError={handleUploadError}
      />

      {uploadResult && (
        <Segment color="green">
          <Header as="h3">Upload Successful!</Header>
          <p><strong>UUID:</strong> {uploadResult.uuid}</p>
          <p><strong>SHA256 Hash:</strong> {uploadResult.sha256Hash}</p>
          <p><strong>Image ID:</strong> {uploadResult.imageId}</p>
        </Segment>
      )}

      {uploadError && (
        <Message negative>
          <Message.Header>Upload Failed</Message.Header>
          <p>{uploadError.reason || uploadError.message || 'Unknown error occurred'}</p>
        </Message>
      )}

      <Divider />

      <ImageViewer uuid={uploadResult ? uploadResult.uuid : ''} />
    </Container>
  );
};

export default TestImageUpload;
