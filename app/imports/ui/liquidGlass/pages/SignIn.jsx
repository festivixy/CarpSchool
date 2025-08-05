import React from "react";
import PropTypes from "prop-types";
import { Redirect } from "react-router-dom";
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
      error: "",
      redirectToReferer: false,
    };
    // Create ref for centralized captcha component
    this.captchaRef = React.createRef();
  }

  /** Update the form controls each time the user interacts with them. */
  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  /** Handle form submission */
  handleSubmit = (e) => {
    e.preventDefault();
    this.submit();
  };

  /** Handle Signin submission using Meteor's account mechanism. */
  submit = () => {
    const { email, password } = this.state;

    // First verify CAPTCHA using centralized component
    this.captchaRef.current.verify((captchaError, isValid) => {
      if (captchaError || !isValid) {
        this.setState({ error: "Invalid security code. Please try again." });
        return;
      }

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
          } else {
            this.setState({ error: "", redirectToReferer: true });
          }
        },
      });
    });
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
          <AppName>carp.school</AppName>
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
                ref={this.captchaRef}
                autoGenerate={true}
                label="Security Verification"
                inputPlaceholder="Enter the characters shown above"
              />

              <LiquidGlassButton
                label="Sign In"
                type="submit"
                style={{ marginTop: "8px", width: "100%" }}
              />
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
