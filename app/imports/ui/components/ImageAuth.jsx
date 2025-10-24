import React, { useState, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { Image, Loader, Message, Segment } from "semantic-ui-react";
import PropTypes from "prop-types";

/**
 * ImageAuth - Component for displaying images by UUID with automatic authentication handling
 * Fetches image data and displays it, handling private image permissions automatically
 */
const ImageAuth = ({ 
  uuid, 
  alt = "Image",
  size = "medium",
  style = {},
  showError = true,
  onLoad = null,
  onError = null,
  className = "",
  ...otherProps 
}) => {
  const [imageData, setImageData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch image when UUID changes
  useEffect(() => {
    if (!uuid || typeof uuid !== "string" || uuid.trim() === "") {
      setImageData(null);
      setError("");
      setIsLoading(false);
      return;
    }

    const fetchImage = () => {
      setIsLoading(true);
      setError("");
      setImageData(null);

      Meteor.call("images.getByUuid", uuid.trim(), (err, result) => {
        setIsLoading(false);

        if (err) {
          const errorMessage = err.reason || err.message || "Failed to load image";
          setError(errorMessage);
          
          if (onError) {
            onError(err);
          }
        } else {
          setImageData(result);
          
          if (onLoad) {
            onLoad(result);
          }
        }
      });
    };

    fetchImage();

    // Cleanup function
    return () => {
      setImageData(null);
      setError("");
      setIsLoading(false);
    };
  }, [uuid, onLoad, onError]);

  // Generate base64 data URL for image display
  const getImageSrc = () => {
    if (!imageData) return null;
    return `data:${imageData.mimeType};base64,${imageData.imageData}`;
  };

  // Handle different states
  if (!uuid || typeof uuid !== "string" || uuid.trim() === "") {
    return null; // Don't render anything for empty/invalid UUID
  }

  if (isLoading) {
    return (
      <Segment basic textAlign="center" className={className} style={style}>
        <Loader active inline size="small" />
      </Segment>
    );
  }

  if (error) {
    if (!showError) {
      return null; // Hide errors if showError is false
    }

    // Different error styling based on error type
    const isAuthError = error.includes("Access denied") || 
                       error.includes("permission") || 
                       error.includes("Authentication required");
    
    const isNotFoundError = error.includes("not found");

    return (
      <Message 
        negative={!isAuthError && !isNotFoundError}
        warning={isAuthError}
        info={isNotFoundError}
        size="mini"
        className={className}
        style={style}
      >
        <Message.Header>
          {isAuthError ? "🔒 Access Restricted" : 
           isNotFoundError ? "📷 Image Not Found" : 
           "❌ Error Loading Image"}
        </Message.Header>
        <p>{error}</p>
      </Message>
    );
  }

  if (!imageData) {
    return null; // No data to display
  }

  // Render the image
  return (
    <Image
      src={getImageSrc()}
      alt={alt}
      size={size}
      style={{
        objectFit: "cover",
        ...style,
      }}
      className={className}
      {...otherProps}
    />
  );
};

ImageAuth.propTypes = {
  uuid: PropTypes.string.isRequired,
  alt: PropTypes.string,
  size: PropTypes.oneOf([
    "mini",
    "tiny", 
    "small",
    "medium",
    "large",
    "big",
    "huge",
    "massive"
  ]),
  style: PropTypes.object,
  showError: PropTypes.bool,
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  className: PropTypes.string,
};

ImageAuth.defaultProps = {
  alt: "Image",
  size: "medium",
  style: {},
  showError: true,
  onLoad: null,
  onError: null,
  className: "",
};

export default ImageAuth;
