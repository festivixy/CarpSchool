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
import Captcha from "../components/Captcha";

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
      error: "",
      redirectToReferer: false,
    };
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

    if (!this.captchaRef.current) {
      this.setState({ error: "Captcha component not available." });
      return;
    }

    // First verify CAPTCHA using centralized component
    this.captchaRef.current.verify((captchaError, isValid) => {
      if (captchaError || !isValid) {
        this.setState({
          error: captchaError || "Invalid security code. Please try again.",
        });
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
              <Field>
                <Captcha ref={this.captchaRef} autoGenerate={true} />
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
