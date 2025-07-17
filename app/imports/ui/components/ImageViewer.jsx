import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Button, Form, Input, Message, Image, Segment, Header, Loader } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const ImageViewer = ({ uuid: initialUuid }) => {
  const [uuid, setUuid] = useState(initialUuid || '');
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadImage = () => {
    if (!uuid.trim()) {
      setError('Please enter a UUID');
      return;
    }

    setIsLoading(true);
    setError('');
    setImageData(null);

    Meteor.call('images.getByUuid', uuid.trim(), (err, result) => {
      setIsLoading(false);

      if (err) {
        setError(err.reason || 'Failed to load image');
        console.error('Image load error:', err);
      } else {
        setImageData(result);
      }
    });
  };

  const getImageSrc = () => {
    if (!imageData) return null;
    return `data:${imageData.mimeType};base64,${imageData.imageData}`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <Segment>
      <Header as="h3">Image Viewer</Header>

      <Form>
        <Form.Field>
          <label>Image UUID</label>
          <Input
            placeholder="Enter image UUID"
            value={uuid}
            onChange={(e) => setUuid(e.target.value)}
            action={
              <Button
                primary
                onClick={loadImage}
                disabled={isLoading || !uuid.trim()}
                loading={isLoading}
              >
                Load Image
              </Button>
            }
          />
        </Form.Field>
      </Form>

      {error && (
        <Message negative>
          <Message.Header>Error</Message.Header>
          <p>{error}</p>
        </Message>
      )}

      {isLoading && (
        <Segment>
          <Loader active inline="centered" />
          <p>Loading image...</p>
        </Segment>
      )}

      {imageData && (
        <Segment>
          <Header as="h4">Image Details</Header>
          <p><strong>UUID:</strong> {imageData.uuid}</p>
          <p><strong>File Name:</strong> {imageData.fileName}</p>
          <p><strong>MIME Type:</strong> {imageData.mimeType}</p>
          <p><strong>File Size:</strong> {formatFileSize(imageData.fileSize)}</p>
          <p><strong>Uploaded:</strong> {new Date(imageData.uploadedAt).toLocaleString()}</p>

          <Header as="h4">Image</Header>
          <Image
            src={getImageSrc()}
            size="large"
            bordered
            style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
          />
        </Segment>
      )}
    </Segment>
  );
};

ImageViewer.propTypes = {
  uuid: PropTypes.string,
};

ImageViewer.defaultProps = {
  uuid: '',
};

export default ImageViewer;
