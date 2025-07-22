import React from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
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
} from "../styles/SignIn";

/**
 * Mobile SignIn component with modern design and full functionality including CAPTCHA
 */
export default class MobileSignIn extends React.Component {
  /** Initialize component state with properties for login and redirection. */
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

  /** Handle Signin submission using Meteor's account mechanism. */
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
        const methodArguments = Accounts._hashPassword(password);
        methodArguments.captchaSessionId = this.state.captchaSessionId;
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
              this.generateNewCaptchaKeepError(); // Generate new CAPTCHA but keep error message
            } else {
              this.setState({ error: "", redirectToReferer: true });
            }
          },
        });
        // CAPTCHA is valid, proceed with login
        // Meteor.loginWithPassword(email, password, (err) => {
        //   if (err) {
        //     this.setState({ error: err.reason });
        //     this.generateNewCaptchaKeepError(); // Generate new CAPTCHA but keep error message
        //   } else {
        //     this.setState({ error: "", redirectToReferer: true });
        //   }
        // });
      },
    );
  };

  /** Render the signin form. */
  render() {
    // if correct authentication, redirect to page instead of login screen
    if (this.state.redirectToReferer) {
      return <Redirect to={"/myRides"} />;
    }

    return (
      <Container>
        <Header>
          <AppName>Carpool App</AppName>
        </Header>

        <Content>
          <Copy>
            <Title>Sign in to your account</Title>
            <Subtitle>Enter your credentials to access your account</Subtitle>
          </Copy>

          <Form onSubmit={this.handleSubmit}>
            <InputSection>
              <Field>
                <Input
                  type="email"
                  name="email"
                  placeholder="email@domain.com"
                  value={this.state.email}
                  onChange={this.handleChange}
                  required
                />
              </Field>

              <Field>
                <Input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
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

              <SubmitButton type="submit">Sign In</SubmitButton>
            </InputSection>
          </Form>

          {this.state.error && <ErrorMessage>{this.state.error}</ErrorMessage>}

          <Divider>
            <DividerLine></DividerLine>
            <DividerText>or</DividerText>
            <DividerLine></DividerLine>
          </Divider>

          <Links>
            <StyledLink to="/signup">
              Don&apos;t have an account? Sign up
            </StyledLink>
            <StyledLink to="/forgot">Forgot your password?</StyledLink>
          </Links>

          <Legal>
            By signing in, you agree to our{" "}
            <LegalLink to="/tos">Terms of Service</LegalLink> and{" "}
            <LegalLink to="/privacy">Privacy Policy</LegalLink>
          </Legal>
        </Content>
      </Container>
    );
  }
}

/** Ensure that the React Router location object is available in case we need to redirect. */
MobileSignIn.propTypes = {
  location: PropTypes.object,
};
