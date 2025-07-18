import React from "react";
import {
  Container,
  Content,
  ErrorIcon,
  StatusCode,
  Title,
  Subtitle,
  Description,
  ActionButtons,
  PrimaryButton,
  SecondaryButton,
  IllustrationContainer,
} from "../styles/NotFound";

/**
 * Modern Mobile 404 NotFound page with engaging design and clear navigation options
 */
export default class MobileNotFound extends React.Component {
  handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "/";
    }
  };

  render() {
    return (
      <Container>
        <Content>
          <IllustrationContainer>
            <ErrorIcon>🚗💨</ErrorIcon>
            <StatusCode>404</StatusCode>
          </IllustrationContainer>

          <Title>Oops! Wrong Turn</Title>
          <Subtitle>Page Not Found</Subtitle>

          <Description>
            Looks like you've taken a detour! The page you're looking for
            doesn't exist or has been moved to a new location.
          </Description>

          <ActionButtons>
            <PrimaryButton to="/">Go Home</PrimaryButton>
            <SecondaryButton type="button" onClick={this.handleGoBack}>
              Go Back
            </SecondaryButton>
          </ActionButtons>
        </Content>
      </Container>
    );
  }
}
