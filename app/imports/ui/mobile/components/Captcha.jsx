import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import styled from "styled-components";
import DOMPurify from "dompurify";

// Styled Components for Captcha
const CaptchaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CaptchaLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
`;

const CaptchaContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const CaptchaDisplay = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border-radius: 4px;
  padding: 8px;
  min-height: 50px;
  border: 1px solid #dee2e6;

  svg {
    max-width: 100%;
    height: auto;
  }
`;

const CaptchaLoading = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 16px;
  color: #6c757d;
  font-size: 14px;
  min-height: 50px;
  border: 1px solid #dee2e6;
`;

const CaptchaRefreshButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2);

  &:hover:not(:disabled) {
    background: #0056b3;
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 123, 255, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  img {
    width: 20px;
    height: 20px;
    filter: invert(1);
  }
`;

const CaptchaInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
`;

/**
 * Reusable Captcha component with generate, display, input, and refresh functionality
 */
class Captcha extends Component {
  constructor(props) {
    super(props);
    this.state = {
      captchaSvg: "",
      captchaSessionId: "",
      captchaInput: "",
      isLoading: false,
      error: "",
    };
  }

  componentDidMount() {
    if (this.props.autoGenerate) {
      this.generateCaptcha();
    }
  }

  generateCaptcha = () => {
    this.setState({ isLoading: true, error: "" });

    Meteor.call("captcha.generate", (error, result) => {
      if (error) {
        this.setState({
          error: "Failed to load CAPTCHA. Please try again.",
          isLoading: false,
        });
        if (this.props.onError) {
          this.props.onError(error);
        }
      } else {
        this.setState({
          captchaSvg: result.svg,
          captchaSessionId: result.sessionId,
          captchaInput: "",
          isLoading: false,
          error: "",
        });
        if (this.props.onGenerate) {
          this.props.onGenerate(result.sessionId);
        }
      }
    });
  };

  handleInputChange = (e) => {
    const value = e.target.value;
    this.setState({ captchaInput: value });

    if (this.props.onChange) {
      this.props.onChange(value, this.state.captchaSessionId);
    }
  };

  verify = (callback) => {
    const { captchaSessionId, captchaInput } = this.state;

    if (!captchaSessionId || !captchaInput.trim()) {
      const error = "Please complete the security verification.";
      this.setState({ error });
      if (callback) callback(error, false);
      return;
    }

    Meteor.call(
      "captcha.verify",
      captchaSessionId,
      captchaInput,
      (error, isValid) => {
        if (error || !isValid) {
          const errorMessage = "Invalid security code. Please try again.";
          this.setState({ error: errorMessage });
          this.generateCaptcha(); // Auto-regenerate on verification failure
          if (callback) callback(errorMessage, false);
        } else {
          this.setState({ error: "" });
          if (callback) callback(null, true);
        }
      },
    );
  };

  // Public method to get current captcha data
  getCaptchaData = () => ({
      sessionId: this.state.captchaSessionId,
      input: this.state.captchaInput,
    });

  // Public method to reset captcha
  reset = () => {
    this.setState({
      captchaSvg: "",
      captchaSessionId: "",
      captchaInput: "",
      error: "",
    });
  };

  render() {
    const {
      label = "Security Verification",
      inputPlaceholder = "Enter the characters shown above",
      showLabel = true,
      showInput = true,
      disabled = false,
      className,
      style,
    } = this.props;

    const { captchaSvg, captchaInput, isLoading, error } = this.state;

    return (
      <CaptchaSection className={className} style={style}>
        {showLabel && <CaptchaLabel>{label}</CaptchaLabel>}

        <CaptchaContainer>
          {isLoading ? (
            <CaptchaLoading>Loading CAPTCHA...</CaptchaLoading>
          ) : captchaSvg ? (
            <CaptchaDisplay
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(captchaSvg, {
                  USE_PROFILES: { svg: true, svgFilters: true },
                  ALLOWED_TAGS: ["svg", "g", "path", "text", "rect", "circle", "line", "polygon", "polyline"],
                  ALLOWED_ATTR: ["viewBox", "width", "height", "d", "fill", "stroke", "x", "y", "cx", "cy", "r", "x1", "y1", "x2", "y2", "points", "stroke-width", "font-family", "font-size", "text-anchor"],
                }),
              }}
            />
          ) : (
            <CaptchaLoading>Click refresh to generate CAPTCHA</CaptchaLoading>
          )}

          <CaptchaRefreshButton
            type="button"
            onClick={this.generateCaptcha}
            disabled={isLoading || disabled}
            title="Refresh CAPTCHA"
          >
            <img src="/svg/refresh.svg" alt="Refresh" />
          </CaptchaRefreshButton>
        </CaptchaContainer>

        {showInput && (
          <CaptchaInput
            type="text"
            placeholder={inputPlaceholder}
            value={captchaInput}
            onChange={this.handleInputChange}
            disabled={disabled || isLoading}
            required
          />
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </CaptchaSection>
    );
  }
}

Captcha.propTypes = {
  // Configuration
  label: PropTypes.string,
  inputPlaceholder: PropTypes.string,
  showLabel: PropTypes.bool,
  showInput: PropTypes.bool,
  autoGenerate: PropTypes.bool,
  disabled: PropTypes.bool,

  // Styling
  className: PropTypes.string,
  style: PropTypes.object,

  // Callbacks
  onGenerate: PropTypes.func, // Called when captcha is generated with sessionId
  onChange: PropTypes.func, // Called when input changes with (value, sessionId)
  onError: PropTypes.func, // Called when error occurs
};

Captcha.defaultProps = {
  autoGenerate: true,
  showLabel: true,
  showInput: true,
  disabled: false,
};

export default Captcha;
