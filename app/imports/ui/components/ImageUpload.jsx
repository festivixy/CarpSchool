import React, { useState, useRef } from "react";
import { Meteor } from "meteor/meteor";
import {
  Button,
  Form,
  Message,
  Segment,
  Header,
  Image,
  Input,
} from "semantic-ui-react";
import PropTypes from "prop-types";
import Captcha from "./Captcha";

const ImageUpload = ({ onUploadSuccess, onUploadError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);
  const captchaRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setError("");
    setSuccess("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Generate captcha when file is selected (automatically handled by Captcha component)
  };

  // Convert file to base64
  const fileToBase64 = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (data:image/jpeg;base64,)
        const base64 = reader.result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = (error1) => reject(error1);
    });

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    if (!captchaRef.current) {
      setError("Captcha component not available.");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    // Verify CAPTCHA using the centralized component
    captchaRef.current.verify((captchaError, isValid) => {
      if (captchaError || !isValid) {
        setIsUploading(false);
        setError(captchaError || "Invalid security code. Please try again.");
        return;
      }

      // CAPTCHA is valid, proceed with upload
      (async () => {
        try {
          const base64Data = await fileToBase64(selectedFile);
          const captchaData = captchaRef.current.getCaptchaData();

          const imageData = {
            fileName: selectedFile.name,
            mimeType: selectedFile.type,
            base64Data,
          };

          Meteor.call(
            "images.upload",
            imageData,
            captchaData.sessionId,
            (err, result) => {
              setIsUploading(false);

              if (err) {
                setError(err.reason || "Upload failed. Please try again.");
                if (onUploadError) {
                  onUploadError(err);
                }
              } else {
                setSuccess(`Image uploaded successfully! UUID: ${result.uuid}`);
                // Reset form
                setSelectedFile(null);
                setPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
                // Reset captcha
                captchaRef.current.reset();
                if (onUploadSuccess) {
                  onUploadSuccess(result);
                }
              }
            },
          );
        } catch (err) {
          setIsUploading(false);
          setError("Failed to process file. Please try again.");
          console.error("File processing error:", err);
        }
      })();
    });
  };

  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (captchaRef.current) {
      captchaRef.current.reset();
    }
  };

  return (
    <Segment>
      <Header as="h3">Upload Image</Header>

      <Form>
        <Form.Field>
          <label>Select Image File</label>
          <Input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
          <div style={{ marginTop: "0.5em", fontSize: "0.9em", color: "#666" }}>
            Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
          </div>
        </Form.Field>

        {preview && (
          <Form.Field>
            <label>Preview</label>
            <Image
              src={preview}
              size="medium"
              bordered
              style={{ maxHeight: "200px", objectFit: "contain" }}
            />
          </Form.Field>
        )}

        {selectedFile && (
          <Form.Field>
            <Captcha
              ref={captchaRef}
              autoGenerate={true}
              disabled={isUploading}
            />
          </Form.Field>
        )}

        {error && (
          <Message negative>
            <Message.Header>Error</Message.Header>
            <p>{error}</p>
          </Message>
        )}

        {success && (
          <Message positive>
            <Message.Header>Success</Message.Header>
            <p>{success}</p>
          </Message>
        )}

        <Form.Field>
          <Button.Group>
            <Button
              primary
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              loading={isUploading}
              style={{ borderRadius: "4px" }}
            >
              Upload Image
            </Button>
            <Button
              onClick={handleReset}
              disabled={isUploading}
              style={{ borderRadius: "4px" }}
            >
              Reset
            </Button>
          </Button.Group>
        </Form.Field>
      </Form>
    </Segment>
  );
};

ImageUpload.propTypes = {
  onUploadSuccess: PropTypes.func,
  onUploadError: PropTypes.func,
};

ImageUpload.defaultProps = {
  onUploadSuccess: null,
  onUploadError: null,
};

export default ImageUpload;
