import React from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import styled from "styled-components";
import LiquidGlassButton from "../components/Button";
import LiquidGlassTextInput from "../components/TextInput";
import LiquidGlassCaptcha from "../components/Captcha";

// Styled Components for LiquidGlass SignIn
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%);
    animation: float 20s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33% { transform: translateY(-10px) rotate(1deg); }
    66% { transform: translateY(5px) rotate(-1deg); }
  }
`;

const Header = styled.header`
  padding: 30px 20px 20px;
  text-align: center;
  position: relative;
  z-index: 2;
`;

const AppName = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  letter-spacing: -0.5px;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 20px;
  position: relative;
  z-index: 2;
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
`;

const FormContainer = styled.div`
  position: relative;
  border-radius: 24px;
  padding: 40px 30px;
  backdrop-filter: blur(20px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.15),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.15) 0%,
      transparent 50%,
      rgba(255, 255, 255, 0.05) 100%
    );
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    backdrop-filter: hue-rotate(8deg) saturate(1.15);
    mix-blend-mode: color-dodge;
    opacity: 0.3;
    pointer-events: none;
  }
`;

const Copy = styled.div`
  text-align: center;
  margin-bottom: 32px;
  position: relative;
  z-index: 10;
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 600;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  line-height: 1.4;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
`;

const Form = styled.form`
  position: relative;
  z-index: 10;
`;

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;



const ErrorMessage = styled.div`
  background: rgba(255, 59, 48, 0.9);
  color: white;
  padding: 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  margin-top: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  margin: 32px 0;
  position: relative;
  z-index: 10;
`;

const DividerLine = styled.div`
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.3);
`;

const DividerText = styled.span`
  padding: 0 16px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
`;

const Links = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
  position: relative;
  z-index: 10;
`;

const StyledLink = styled.a`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    color: white;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  }
`;

const Legal = styled.div`
  text-align: center;
  margin-top: 32px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  position: relative;
  z-index: 10;
`;

const LegalLink = styled.a`
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  cursor: pointer;

  &:hover {
    color: white;
    text-decoration: underline;
  }
`;

/**
 * LiquidGlass SignIn component with modern glass morphism design
 */
export default class LiquidGlassSignIn extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      error: "",
      redirectToReferer: false,
    };

    // Create ref for captcha component
    this.captchaRef = React.createRef();
  }

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.submit();
  };

  submit = () => {
    const { email, password } = this.state;

    // First verify CAPTCHA using the captcha component
    if (this.captchaRef.current) {
      this.captchaRef.current.verify((captchaError, isValidCaptcha) => {
        if (captchaError || !isValidCaptcha) {
          this.setState({ error: captchaError || "Invalid security code. Please try again." });
          return;
        }

        // Get captcha data for the login method
        const captchaData = this.captchaRef.current.getCaptchaData();

        const methodArguments = Accounts._hashPassword(password);
        methodArguments.captchaSessionId = captchaData.sessionId;
        methodArguments.proofOfWorkResult = "";

        Accounts.callLoginMethod({
          methodArguments: [
            {
              user: { email: email },
              password: methodArguments,
            },
          ],
          userCallback: (error, _result) => {
            if (error) {
              this.setState({ error: error.reason });
              // Captcha component will auto-regenerate on verification failure
            } else {
              this.setState({ error: "", redirectToReferer: true });
            }
          },
        });
      });
    } else {
      this.setState({ error: "Please complete the security verification." });
    }
  };

  handleLinkClick = (path) => {
    // Navigate using router if available, otherwise use window.location
    if (this.props.history) {
      this.props.history.push(path);
    } else {
      window.location.href = `#${path}`;
    }
  };

  render() {
    if (this.state.redirectToReferer) {
      return <Redirect to={"/myRides"} />;
    }

    return (
      <Container>
        <Header>
          <AppName>Carpool</AppName>
        </Header>

        <Content>
          <FormContainer>
            <Copy>
              <Title>Welcome Back</Title>
              <Subtitle>Sign in to your account to continue</Subtitle>
            </Copy>

            <Form onSubmit={this.handleSubmit}>
              <InputSection>
                <LiquidGlassTextInput
                  type="email"
                  name="email"
                  label="Email Address"
                  placeholder="Enter your email"
                  value={this.state.email}
                  onChange={this.handleChange}
                  icon="📧"
                  iconPosition="left"
                  required
                />

                <LiquidGlassTextInput
                  type="password"
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={this.state.password}
                  onChange={this.handleChange}
                  icon="🔐"
                  iconPosition="left"
                  required
                />

                <LiquidGlassCaptcha
                  ref={this.captchaRef}
                  label="Security Verification"
                  inputPlaceholder="Enter the characters shown above"
                />

                <LiquidGlassButton
                  type="submit"
                  size="large"
                  variant="primary"
                  style={{ marginTop: "8px" }}
                >
                  Sign In
                </LiquidGlassButton>
              </InputSection>
            </Form>

            {this.state.error && <ErrorMessage>{this.state.error}</ErrorMessage>}

            <Divider>
              <DividerLine />
              <DividerText>or</DividerText>
              <DividerLine />
            </Divider>

            <Links>
              <StyledLink onClick={() => this.handleLinkClick("/signup")}>
                Don't have an account? Sign up
              </StyledLink>
              <StyledLink onClick={() => this.handleLinkClick("/forgot")}>
                Forgot your password?
              </StyledLink>
            </Links>

            <Legal>
              By signing in, you agree to our{" "}
              <LegalLink onClick={() => this.handleLinkClick("/tos")}>
                Terms of Service
              </LegalLink>{" "}
              and{" "}
              <LegalLink onClick={() => this.handleLinkClick("/privacy")}>
                Privacy Policy
              </LegalLink>
            </Legal>
          </FormContainer>
        </Content>
      </Container>
    );
  }
}

LiquidGlassSignIn.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object,
};
