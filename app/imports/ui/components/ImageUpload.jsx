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
  Grid,
  Loader,
} from "semantic-ui-react";
import PropTypes from "prop-types";

const ImageUpload = ({ onUploadSuccess, onUploadError }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [captchaData, setCaptchaData] = useState(null);
  const [captchaText, setCaptchaText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingCaptcha, setIsLoadingCaptcha] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  // Generate captcha
  const generateCaptcha = () => {
    setIsLoadingCaptcha(true);
    setError("");

    Meteor.call("captcha.generate", (err, result) => {
      setIsLoadingCaptcha(false);
      if (err) {
        setError("Failed to generate captcha. Please try again.");
        console.error("Captcha generation error:", err);
      } else {
        setCaptchaData(result);
        setCaptchaText("");
      }
    });
  };

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

    // Generate captcha when file is selected
    if (!captchaData) {
      generateCaptcha();
    }
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
      reader.onerror = (error) => reject(error);
    });

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile || !captchaData || !captchaText.trim()) {
      setError("Please select a file, solve the captcha, and try again.");
      return;
    }

    setIsUploading(true);
    setError("");
    setSuccess("");

    // First verify CAPTCHA
    Meteor.call(
      "captcha.verify",
      captchaData.sessionId,
      captchaText,
      async (captchaError, isValidCaptcha) => {
        if (captchaError || !isValidCaptcha) {
          setIsUploading(false);
          setError("Invalid security code. Please try again.");
          generateCaptcha();
          return;
        }

        try {
          // Convert file to base64
          const base64Data = await fileToBase64(selectedFile);

          const imageData = {
            fileName: selectedFile.name,
            mimeType: selectedFile.type,
            base64Data,
          };

          // CAPTCHA is valid, proceed with upload using verified session
          Meteor.call(
            "images.upload",
            imageData,
            captchaData.sessionId,
            (err, result) => {
              setIsUploading(false);

              if (err) {
                setError(err.reason || "Upload failed. Please try again.");
                // Generate new captcha on error
                generateCaptcha();
                if (onUploadError) {
                  onUploadError(err);
                }
              } else {
                setSuccess(`Image uploaded successfully! UUID: ${result.uuid}`);
                // Reset form
                setSelectedFile(null);
                setPreview(null);
                setCaptchaData(null);
                setCaptchaText("");
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
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
      },
    );
  };

  // Reset form
  const handleReset = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaptchaData(null);
    setCaptchaText("");
    setError("");
    setSuccess("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
            <label>Captcha Verification</label>
            <Grid columns={2}>
              <Grid.Column width={10}>
                {isLoadingCaptcha ? (
                  <Segment>
                    <Loader active inline="centered" />
                    <p>Loading captcha...</p>
                  </Segment>
                ) : captchaData ? (
                  <div>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: captchaData.svg,
                      }}
                      style={{
                        border: "1px solid #ccc",
                        padding: "10px",
                        marginBottom: "10px",
                      }}
                    />
                    <Input
                      placeholder="Enter captcha text"
                      value={captchaText}
                      onChange={(e) => setCaptchaText(e.target.value)}
                      disabled={isUploading}
                    />
                  </div>
                ) : (
                  <Button onClick={generateCaptcha} disabled={isUploading}>
                    Generate Captcha
                  </Button>
                )}
              </Grid.Column>
              <Grid.Column width={6}>
                <Button
                  onClick={generateCaptcha}
                  disabled={isUploading || isLoadingCaptcha}
                  icon="refresh"
                  content="New Captcha"
                />
              </Grid.Column>
            </Grid>
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
              disabled={
                !selectedFile ||
                !captchaData ||
                !captchaText.trim() ||
                isUploading
              }
              loading={isUploading}
            >
              Upload Image
            </Button>
            <Button onClick={handleReset} disabled={isUploading}>
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
