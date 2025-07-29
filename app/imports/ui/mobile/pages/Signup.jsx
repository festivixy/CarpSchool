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
} from "../styles/Signup";
import Captcha from "../components/Captcha";

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

  /** Handle Signup submission. Create user account and a profile entry, then redirect to the home page. */
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

      // CAPTCHA is valid, proceed with account creation
      Accounts.createUser(
        {
          email,
          username: email,
          password,
          profile: {
            captchaSessionId: captchaData.sessionId, // Pass captcha session ID for server-side validation
          },
        },
        (err) => {
          if (err) {
            this.setState({ error: err.reason });
          } else {
            this.setState({ error: "", redirectToReferer: true });
          }
        },
      );
    });
  };

  /** Render the signup form. */
  render() {
    const { from } = this.props.location?.state || {
      from: { pathname: "/myRides" },
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
              <Field>
                <Captcha ref={this.captchaRef} autoGenerate={true} />
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
