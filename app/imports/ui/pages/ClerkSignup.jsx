import React from "react";
import PropTypes from "prop-types";
import { SignUp } from "@clerk/clerk-react";
import styled from "styled-components";

const CenteredContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

/**
 * Sign-up page using Clerk's default SignUp component
 * Provides full authentication UI with forms, social login, etc.
 */
export default function ClerkSignup({ location }) {
  const from = location?.state?.from?.pathname || "/onboarding";

  return (
    <CenteredContainer>
      <SignUp
        path="/signup"
        routing="path"
        signInUrl="/login"
        afterSignUpUrl={from}
      />
    </CenteredContainer>
  );
}

ClerkSignup.propTypes = {
  location: PropTypes.object,
};
