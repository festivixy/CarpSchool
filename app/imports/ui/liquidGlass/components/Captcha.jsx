import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import DOMPurify from "dompurify";
import {
  CaptchaSection,
  CaptchaLabel,
  CaptchaContainer,
  CaptchaDisplay,
  CaptchaLoading,
  CaptchaRefreshButton,
  CaptchaInputContainer,
  CaptchaInput,
  ErrorMessage,
} from "../styles/Captcha";

/**
 * LiquidGlass Captcha component with glass morphism styling
 */
class LiquidGlassCaptcha extends Component {
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
          {isLoading ? ( // eslint-disable-line no-nested-ternary
            <CaptchaLoading>Loading CAPTCHA...</CaptchaLoading>
          ) : captchaSvg ? (
            <CaptchaDisplay
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(captchaSvg, {
                  USE_PROFILES: { svg: true, svgFilters: true },
                  ALLOWED_TAGS: [
                    "svg", "g", "path", "text", "rect", "circle",
                    "line", "polygon", "polyline",
                  ],
                  ALLOWED_ATTR: [
                    "viewBox", "width", "height", "d", "fill", "stroke",
                    "x", "y", "cx", "cy", "r", "x1", "y1", "x2", "y2",
                    "points", "stroke-width", "font-family", "font-size", "text-anchor",
                  ],
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
          <CaptchaInputContainer>
            <CaptchaInput
              type="text"
              placeholder={inputPlaceholder}
              value={captchaInput}
              onChange={this.handleInputChange}
              disabled={disabled || isLoading}
              required
            />
          </CaptchaInputContainer>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}
      </CaptchaSection>
    );
  }
}

LiquidGlassCaptcha.propTypes = {
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

LiquidGlassCaptcha.defaultProps = {
  autoGenerate: true,
  showLabel: true,
  showInput: true,
  disabled: false,
};

export default LiquidGlassCaptcha;
