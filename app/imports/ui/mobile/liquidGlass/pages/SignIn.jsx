import React from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import LiquidGlassButton from "../components/Button";
import LiquidGlassTextInput from "../components/TextInput";
import LiquidGlassCaptcha from "../components/Captcha";
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
  ErrorMessage,
  Divider,
  DividerLine,
  DividerText,
  Links,
  StyledLink,
  Legal,
  LegalLink,
} from "../../styles/SignIn";


/**
 * LiquidGlass SignIn component using same structure as normal SignIn but with LiquidGlass components
 */
export default class LiquidGlassSignIn extends React.Component {
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
              <LiquidGlassTextInput
                type="email"
                name="email"
                label="Email Address"
                placeholder="email@domain.com"
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
                captchaSvg={this.state.captchaSvg}
                isLoading={this.state.isLoadingCaptcha}
                onRefresh={this.generateNewCaptcha}
                inputValue={this.state.captchaInput}
                onInputChange={(e) => this.handleChange({ target: { name: 'captchaInput', value: e.target.value } })}
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

LiquidGlassSignIn.propTypes = {
  location: PropTypes.object,
  history: PropTypes.object,
};
