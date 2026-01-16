import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import {
  SmtpContainer,
  SmtpHeader,
  SmtpTitle,
  SmtpSection,
  SmtpField,
  SmtpLabel,
  SmtpInput,
  SmtpSelect,
  SmtpButton,
  SmtpTestButton,
  SmtpToggle,
  SuccessMessage,
  ErrorMessage,
  InfoMessage,
} from "../styles/SchoolSmtpSettings";

const SchoolSmtpSettings = ({ schoolId }) => {
  const [settings, setSettings] = useState({
    email: "",
    password: "",
    host: "",
    port: 587,
    secure: false,
    enabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSettings();
  }, [schoolId]);

  const loadSettings = () => {
    if (!schoolId) return;

    setIsLoading(true);
    Meteor.call("schools.getSmtpSettings", schoolId, (err, result) => {
      setIsLoading(false);
      if (err) {
        setError(err.reason || "Failed to load SMTP settings");
      } else {
        setSettings(result);
      }
    });
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsSaving(true);
    setError("");
    setSuccess("");

    Meteor.call("schools.updateSmtpSettings", schoolId, settings, (err, result) => {
      setIsSaving(false);
      if (err) {
        setError(err.reason || "Failed to save SMTP settings");
      } else {
        setSuccess(result.message);
        setTimeout(() => setSuccess(""), 5000);
      }
    });
  };

  const handleTest = () => {
    setIsTesting(true);
    setError("");
    setSuccess("");

    Meteor.call("schools.testSmtpConnection", schoolId, (err, result) => {
      setIsTesting(false);
      if (err) {
        setError(err.reason || "SMTP test failed");
      } else {
        setSuccess(result.message);
        setTimeout(() => setSuccess(""), 5000);
      }
    });
  };

  if (isLoading) {
    return (
      <SmtpContainer>
        <SmtpHeader>
          <SmtpTitle>Loading SMTP Settings...</SmtpTitle>
        </SmtpHeader>
      </SmtpContainer>
    );
  }

  return (
    <SmtpContainer>
      <SmtpHeader>
        <SmtpTitle>📧 School Email Settings</SmtpTitle>
      </SmtpHeader>

      <InfoMessage>
        Configure SMTP settings to enable school email verification for riders.
        Students will receive verification codes at their school email addresses.
      </InfoMessage>

      <SmtpSection>
        <SmtpField>
          <SmtpLabel>Enable Email Verification</SmtpLabel>
          <SmtpToggle>
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => handleChange("enabled", e.target.checked)}
              disabled={isSaving}
            />
            <span>{settings.enabled ? "Enabled" : "Disabled"}</span>
          </SmtpToggle>
        </SmtpField>

        <SmtpField>
          <SmtpLabel>SMTP Email Address *</SmtpLabel>
          <SmtpInput
            type="email"
            value={settings.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="noreply@yourschool.edu"
            disabled={isSaving}
          />
        </SmtpField>

        <SmtpField>
          <SmtpLabel>SMTP Password *</SmtpLabel>
          <SmtpInput
            type="password"
            value={settings.password}
            onChange={(e) => handleChange("password", e.target.value)}
            placeholder="Enter SMTP password"
            disabled={isSaving}
          />
        </SmtpField>

        <SmtpField>
          <SmtpLabel>SMTP Host *</SmtpLabel>
          <SmtpInput
            type="text"
            value={settings.host}
            onChange={(e) => handleChange("host", e.target.value)}
            placeholder="smtp.gmail.com"
            disabled={isSaving}
          />
        </SmtpField>

        <SmtpField>
          <SmtpLabel>SMTP Port</SmtpLabel>
          <SmtpInput
            type="number"
            value={settings.port}
            onChange={(e) => handleChange("port", parseInt(e.target.value, 10) || 587)}
            min="1"
            max="65535"
            disabled={isSaving}
          />
        </SmtpField>

        <SmtpField>
          <SmtpLabel>Use Secure Connection (SSL/TLS)</SmtpLabel>
          <SmtpToggle>
            <input
              type="checkbox"
              checked={settings.secure}
              onChange={(e) => handleChange("secure", e.target.checked)}
              disabled={isSaving}
            />
            <span>{settings.secure ? "Yes" : "No"}</span>
          </SmtpToggle>
        </SmtpField>
      </SmtpSection>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <SmtpSection>
        <SmtpButton onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </SmtpButton>

        {settings.email && settings.password && settings.host && (
          <SmtpTestButton onClick={handleTest} disabled={isTesting || isSaving}>
            {isTesting ? "Testing..." : "Test Connection"}
          </SmtpTestButton>
        )}
      </SmtpSection>
    </SmtpContainer>
  );
};

SchoolSmtpSettings.propTypes = {
  schoolId: PropTypes.string.isRequired,
};

export default SchoolSmtpSettings;
