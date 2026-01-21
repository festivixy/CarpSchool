import React from "react";
import PropTypes from "prop-types";
import { SignIn } from "@clerk/clerk-react";
import styled from "styled-components";

const CenteredContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

/**
 * Sign-in page using Clerk's default SignIn component
 * Provides full authentication UI with forms, social login, etc.
 */
export default function ClerkSignIn({ location }) {
  const from = location?.state?.from?.pathname || "/my-rides";

  return (
    <CenteredContainer>
      <SignIn
        path="/login"
        routing="path"
        signUpUrl="/signup"
        afterSignInUrl={from}
      />
    </CenteredContainer>
  );
}

ClerkSignIn.propTypes = {
  location: PropTypes.object,
};
