import React, { Component } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import styled from "styled-components";

// Styled Components for LiquidGlass Captcha
const CaptchaSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CaptchaLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #000;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
`;

const CaptchaContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;

  /* Glass morphism effect */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    backdrop-filter: hue-rotate(4deg) saturate(1.05);
    mix-blend-mode: color-dodge;
    opacity: 0.3;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 16px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15) 0%,
      transparent 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
    box-shadow:
      inset 1px 0 3px rgba(255, 0, 0, 0.04),
      inset -1px 0 3px rgba(0, 255, 255, 0.04),
      inset 0 1px 3px rgba(0, 255, 0, 0.03),
      inset 0 -1px 3px rgba(255, 0, 255, 0.03);
    pointer-events: none;
  }
`;

const CaptchaDisplay = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 8px;
  min-height: 50px;
  position: relative;
  z-index: 10;
  box-shadow: 
    inset 2px 2px 4px rgba(255, 255, 255, 0.3),
    inset -1px -1px 2px rgba(0, 0, 0, 0.1);

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
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 16px;
  color: #000;
  font-size: 14px;
  font-weight: 500;
  min-height: 50px;
  position: relative;
  z-index: 10;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
`;

const CaptchaRefreshButton = styled.button`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  img {
    width: 20px;
    height: 20px;
    // filter: invert(1);
  }
`;

const CaptchaInputContainer = styled.div`
  position: relative;
  border-radius: 1000px;
  overflow: hidden;
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
  }

  &:focus-within {
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.3), 0 1px 3px rgba(0, 0, 0, 0.03);
  }

  /* Glass morphism background */
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 1000px;
    backdrop-filter: blur(6px) hue-rotate(8deg) saturate(1.15);
    background: rgba(255, 255, 255, 0.05);
    mix-blend-mode: color-dodge;
    opacity: 0.3;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 1000px;
    background:
      radial-gradient(
        ellipse at center,
        rgba(255, 255, 255, 0.05) 0%,
        rgba(255, 255, 255, 0.08) 70%,
        rgba(255, 255, 255, 0.15) 100%
      ),
      linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.12) 0%,
        rgba(255, 255, 255, 0.05) 100%
      );
    box-shadow:
      inset 2px 2px 4px rgba(255, 255, 255, 0.25),
      inset -1px -1px 2px rgba(0, 0, 0, 0.05);
    pointer-events: none;
  }
`;

const CaptchaInput = styled.input`
  width: 100%;
  padding: 12px 24px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: #000;
  font-family: inherit;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 10;
  transform: translateX(0px);
  backface-visibility: hidden;
  -webkit-font-smoothing: antialiased;

  &::placeholder {
    color: #666;
    font-weight: 400;
    opacity: 0.8;
  }

  &:focus {
    &::placeholder {
      opacity: 0.6;
    }
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  font-size: 12px;
  font-weight: 500;
  margin-top: 4px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  padding: 8px 12px;
  background: rgba(255, 68, 68, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 68, 68, 0.2);
`;

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
      }
    );
  };

  // Public method to get current captcha data
  getCaptchaData = () => {
    return {
      sessionId: this.state.captchaSessionId,
      input: this.state.captchaInput,
    };
  };

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
              dangerouslySetInnerHTML={{ __html: captchaSvg }}
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
  onChange: PropTypes.func,   // Called when input changes with (value, sessionId)
  onError: PropTypes.func,    // Called when error occurs
};

LiquidGlassCaptcha.defaultProps = {
  autoGenerate: true,
  showLabel: true,
  showInput: true,
  disabled: false,
};

export default LiquidGlassCaptcha;
