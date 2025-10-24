import React, { useState, useRef } from "react";
import { Meteor } from "meteor/meteor";
import { Redirect } from "react-router-dom";
import {
  VerifyContainer,
  VerifyHeader,
  VerifyTitle,
  VerifyContent,
  VerifyText,
  VerifyDescription,
  VerifyButton,
  VerifyIcon,
  SuccessMessage,
  ErrorMessage,
  SchoolEmailSection,
  EmailInput,
  CodeInput,
  EmailStepContainer,
  StepTitle,
  StepDescription,
} from "../styles/Verify";
import BackButton from "../mobile/components/BackButton";
import Captcha from "./Captcha";

const RiderVerify = () => {
  const [step, setStep] = useState("email"); // "email" | "code" | "success"
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [redirectToProfile, setRedirectToProfile] = useState(false);
  const [codeAttempts, setCodeAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(5);

  const captchaRef = useRef();

  const handleSendCode = () => {
    if (!email.trim()) {
      setError("Please enter your school email address.");
      return;
    }

    if (!captchaRef.current) {
      setError("Captcha component not available.");
      return;
    }

    setIsLoading(true);
    setError("");

    // Verify CAPTCHA first
    captchaRef.current.verify((captchaError, isValid) => {
      if (captchaError || !isValid) {
        setIsLoading(false);
        setError(captchaError || "Invalid security code. Please try again.");
        return;
      }

      const captchaData = captchaRef.current.getCaptchaData();

      // Send verification code
      Meteor.call("schoolEmail.sendVerificationCode", email.trim(), captchaData.input, captchaData.sessionId, (err, result) => {
        setIsLoading(false);

        if (err) {
          setError(err.reason || "Failed to send verification code. Please try again.");
          captchaRef.current.reset();
        } else {
          setSuccess("Verification code sent to your school email!");
          setStep("code");
          captchaRef.current.reset();
        }
      });
    });
  };

  const handleVerifyCode = () => {
    if (!verificationCode.trim()) {
      setError("Please enter the verification code.");
      return;
    }

    if (verificationCode.trim().length !== 6) {
      setError("Verification code must be 6 digits.");
      return;
    }

    setIsLoading(true);
    setError("");

    Meteor.call("schoolEmail.verifyCode", verificationCode.trim(), (err, result) => {
      setIsLoading(false);

      if (err) {
        setError(err.reason || "Invalid verification code. Please try again.");
        setCodeAttempts(prev => prev + 1);
      } else {
        setSuccess(result.message);
        setStep("success");
        // Redirect after 3 seconds
        setTimeout(() => {
          setRedirectToProfile(true);
        }, 3000);
      }
    });
  };

  const handleResendCode = () => {
    setStep("email");
    setVerificationCode("");
    setCodeAttempts(0);
    setError("");
    setSuccess("");
  };

  if (redirectToProfile) {
    return <Redirect to="/edit-profile" />;
  }

  return (
    <VerifyContainer>
      <BackButton />

      <VerifyHeader>
        <VerifyIcon>🚗</VerifyIcon>
        <VerifyTitle>Rider Verification</VerifyTitle>
      </VerifyHeader>

      <VerifyContent>
        {step === "email" && (
          <EmailStepContainer>
            <StepTitle>School Email Verification</StepTitle>
            <StepDescription>
              Enter your school email address to receive a verification code
            </StepDescription>

            <SchoolEmailSection>
              <EmailInput
                type="email"
                placeholder="your.email@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />

              <Captcha
                ref={captchaRef}
                autoGenerate={true}
                disabled={isLoading}
              />

              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}

              <VerifyButton
                onClick={handleSendCode}
                disabled={isLoading || !email.trim()}
              >
                {isLoading ? "Sending Code..." : "Send Verification Code"}
              </VerifyButton>
            </SchoolEmailSection>
          </EmailStepContainer>
        )}

        {step === "code" && (
          <EmailStepContainer>
            <StepTitle>Enter Verification Code</StepTitle>
            <StepDescription>
              Check your email ({email}) for a 6-digit verification code
            </StepDescription>

            <SchoolEmailSection>
              <CodeInput
                type="text"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setVerificationCode(value);
                }}
                disabled={isLoading}
                maxLength={6}
              />

              {error && <ErrorMessage>{error}</ErrorMessage>}
              {codeAttempts > 0 && (
                <ErrorMessage>
                  {maxAttempts - codeAttempts} attempts remaining
                </ErrorMessage>
              )}

              <VerifyButton
                onClick={handleVerifyCode}
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </VerifyButton>

              <VerifyButton
                onClick={handleResendCode}
                disabled={isLoading}
                style={{ marginTop: "10px", backgroundColor: "#666" }}
              >
                Resend Code
              </VerifyButton>
            </SchoolEmailSection>
          </EmailStepContainer>
        )}

        {step === "success" && (
          <>
            <VerifyText>
              🎉 School email verified successfully!
            </VerifyText>

            <VerifyDescription>
              You now have access to all rider features:
              • Find and join rides from verified drivers
              • Contact drivers for ride arrangements
              • Access all rider-specific features
              • Build your rider reputation
            </VerifyDescription>

            <SuccessMessage>{success}</SuccessMessage>
          </>
        )}
      </VerifyContent>
    </VerifyContainer>
  );
};

export default RiderVerify;
