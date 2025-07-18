import React from "react";
import PropTypes from "prop-types";
import { Link, Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import {
  Container,
  Header,
  AppName,
  Content,
  Copy,
  Title,
  Subtitle,
  Form,
  InputSection,
  Field,
  Input,
  CaptchaSection,
  CaptchaLabel,
  CaptchaContainer,
  CaptchaLoading,
  CaptchaDisplay,
  CaptchaRefreshIcon,
  SubmitButton,
  ErrorMessage,
  Divider,
  DividerLine,
  DividerText,
  Links,
  StyledLink,
  Legal,
  LegalLink,
} from "../styles/Signup";

/**
 * Mobile Signup component with modern design and full functionality including CAPTCHA
 */
export default class MobileSignup extends React.Component {
  /** Initialize component state with properties for signup and redirection. */
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      captchaInput: "",
      captchaSvg: "",
      captchaSessionId: "",
      error: "",
      redirectToReferer: false,
      isLoadingCaptcha: false,
    };
  }

  componentDidMount() {
    this.generateNewCaptcha();
  }

  /** Update the form controls each time the user interacts with them. */
  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  /** Generate a new CAPTCHA */
  generateNewCaptcha = () => {
    this.setState({ isLoadingCaptcha: true });
    Meteor.call("captcha.generate", (error, result) => {
      if (error) {
        this.setState({
          error: "Failed to load CAPTCHA. Please try again.",
          isLoadingCaptcha: false,
        });
      } else {
        this.setState({
          captchaSvg: result.svg,
          captchaSessionId: result.sessionId,
          captchaInput: "",
          isLoadingCaptcha: false,
          error: "",
        });
      }
    });
  };

  /** Generate a new CAPTCHA without clearing existing error messages */
  generateNewCaptchaKeepError = () => {
    this.setState({ isLoadingCaptcha: true });
    Meteor.call("captcha.generate", (error, result) => {
      if (error) {
        this.setState({
          error: "Failed to load CAPTCHA. Please try again.",
          isLoadingCaptcha: false,
        });
      } else {
        this.setState({
          captchaSvg: result.svg,
          captchaSessionId: result.sessionId,
          captchaInput: "",
          isLoadingCaptcha: false,
        });
      }
    });
  };

  /** Handle form submission */
  handleSubmit = (e) => {
    e.preventDefault();
    this.submit();
  };

  /** Handle Signup submission. Create user account and a profile entry, then redirect to the home page. */
  submit = () => {
    const { email, password, captchaInput, captchaSessionId } = this.state;

    // First verify CAPTCHA
    Meteor.call(
      "captcha.verify",
      captchaSessionId,
      captchaInput,
      (captchaError, isValidCaptcha) => {
        if (captchaError || !isValidCaptcha) {
          this.setState({ error: "Invalid security code. Please try again." });
          this.generateNewCaptchaKeepError(); // Generate new CAPTCHA but keep any existing errors
          return;
        }

        // CAPTCHA is valid, proceed with account creation
        Accounts.createUser(
          {
            email,
            username: email,
            password,
            profile: {
              captchaSessionId: captchaSessionId, // Pass captcha session ID for server-side validation
            },
          },
          (err) => {
            if (err) {
              this.setState({ error: err.reason });
              this.generateNewCaptchaKeepError(); // Generate new CAPTCHA but keep error message
            } else {
              this.setState({ error: "", redirectToReferer: true });
            }
          },
        );
      },
    );
  };

  /** Render the signup form. */
  render() {
    const { from } = this.props.location?.state || {
      from: { pathname: "/imDriving" },
    };
    // if correct authentication, redirect to from: page instead of signup screen
    if (this.state.redirectToReferer) {
      return <Redirect to={from} />;
    }

    return (
      <Container>
        <Header>
          <AppName>Carpool App</AppName>
        </Header>

        <Content>
          <Copy>
            <Title>Create an account</Title>
            <Subtitle>Enter your information to sign up for this app</Subtitle>
          </Copy>

          <Form onSubmit={this.handleSubmit}>
            <InputSection>
              <Field>
                <Input
                  type="email"
                  name="email"
                  placeholder="UH E-mail address"
                  value={this.state.email}
                  onChange={this.handleChange}
                  required
                />
              </Field>

              <Field>
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={this.state.password}
                  onChange={this.handleChange}
                  required
                />
              </Field>

              {/* CAPTCHA Section */}
              <CaptchaSection>
                <CaptchaLabel>Security Verification</CaptchaLabel>
                <CaptchaContainer>
                  {this.state.isLoadingCaptcha ? (
                    <CaptchaLoading>Loading CAPTCHA...</CaptchaLoading>
                  ) : (
                    <CaptchaDisplay
                      dangerouslySetInnerHTML={{
                        __html: this.state.captchaSvg,
                      }}
                    />
                  )}
                  <CaptchaRefreshIcon
                    type="button"
                    onClick={this.generateNewCaptcha}
                    disabled={this.state.isLoadingCaptcha}
                    title="Refresh CAPTCHA"
                  >
                    <img src="/svg/refresh.svg" alt="Refresh" />
                  </CaptchaRefreshIcon>
                </CaptchaContainer>
              </CaptchaSection>

              <Field>
                <Input
                  type="text"
                  name="captchaInput"
                  placeholder="Enter the characters shown above"
                  value={this.state.captchaInput}
                  onChange={this.handleChange}
                  required
                />
              </Field>

              <SubmitButton type="submit">Create Account</SubmitButton>
            </InputSection>
          </Form>

          {this.state.error && <ErrorMessage>{this.state.error}</ErrorMessage>}

          <Divider>
            <DividerLine></DividerLine>
            <DividerText>or</DividerText>
            <DividerLine></DividerLine>
          </Divider>

          <Links>
            <StyledLink to="/signin">
              Already have an account? Sign in
            </StyledLink>
          </Links>

          <Legal>
            By creating an account, you agree to our{" "}
            <LegalLink to="/tos">Terms of Service</LegalLink> and{" "}
            <LegalLink to="/privacy">Privacy Policy</LegalLink>
          </Legal>
        </Content>
      </Container>
    );
  }
}

/** Ensure that the React Router location object is available in case we need to redirect. */
MobileSignup.propTypes = {
  location: PropTypes.object,
};
