import React from "react";
import { Meteor } from "meteor/meteor";
import { Link } from "react-router-dom";
import {
  Container,
  Content,
  LoadingSection,
  SuccessSection,
  Spinner,
  Icon,
  LoadingTitle,
  Title,
  LoadingMessage,
  Actions,
  ButtonPrimary,
  ButtonSecondary,
} from "../styles/Signout";

/** Modern mobile signout page with clean design and user feedback */
export default class MobileSignout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSigningOut: true,
      signedOut: false,
    };
  }

  componentDidMount() {
    // Add a slight delay for better UX, then sign out
    setTimeout(() => {
      Meteor.logout(() => {
        this.setState({
          isSigningOut: false,
          signedOut: true,
        });
      });
    }, 800);
  }

  render() {
    const { isSigningOut, signedOut } = this.state;

    return (
      <Container>
        <Content>
          {isSigningOut ? (
            <LoadingSection>
              <Spinner></Spinner>
              <LoadingTitle>Signing you out...</LoadingTitle>
              <LoadingMessage>
                Please wait while we securely sign you out
              </LoadingMessage>
            </LoadingSection>
          ) : (
            <SuccessSection>
              <Icon>👋</Icon>
              <Title>You are signed out.</Title>

              <Actions>
                <ButtonPrimary to="/signin">Sign In Again</ButtonPrimary>
                <ButtonSecondary to="/">Go to Home</ButtonSecondary>
              </Actions>
            </SuccessSection>
          )}
        </Content>
      </Container>
    );
  }
}
