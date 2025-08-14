import React from "react";
import PropTypes from "prop-types";
import {
  SkeletonContainer,
  SkeletonHeader,
  SkeletonBackButton,
  SkeletonTitle,
  SkeletonContent,
  SkeletonCopy,
  SkeletonMainTitle,
  SkeletonSubtitle,
  SkeletonForm,
  SkeletonSection,
  SkeletonSectionTitle,
  SkeletonField,
  SkeletonLabel,
  SkeletonInput,
  SkeletonSelect,
  SkeletonImagePreview,
  SkeletonFileInput,
  SkeletonFileInfo,
  SkeletonCaptchaArea,
  SkeletonUploadButton,
  SkeletonSubmitButton,
  SkeletonLink,
  SkeletonPulse,
} from "../styles/ProfileSkeleton";

/**
 * Skeleton loading component for EditProfile page
 * Mimics the structure and layout of the actual EditProfile component
 * with header, form sections, image uploads, and submit button
 */
const ProfileSkeleton = ({
  showProfileImage = true,
  showVehicleImage = true,
  showCaptcha = false,
}) => (
  <SkeletonContainer>
    {/* Header */}
    <SkeletonHeader>
      <SkeletonBackButton>
        <SkeletonPulse />
      </SkeletonBackButton>
      <SkeletonTitle>
        <SkeletonPulse />
      </SkeletonTitle>
    </SkeletonHeader>

    <SkeletonContent>
      {/* Copy Section */}
      <SkeletonCopy>
        <SkeletonMainTitle>
          <SkeletonPulse />
        </SkeletonMainTitle>
        <SkeletonSubtitle>
          <SkeletonPulse />
        </SkeletonSubtitle>
      </SkeletonCopy>

      <SkeletonForm>
        {/* Basic Information Section */}
        <SkeletonSection>
          <SkeletonSectionTitle>
            <SkeletonPulse />
          </SkeletonSectionTitle>

          {/* Full Name Field */}
          <SkeletonField>
            <SkeletonLabel>
              <SkeletonPulse />
            </SkeletonLabel>
            <SkeletonInput>
              <SkeletonPulse />
            </SkeletonInput>
          </SkeletonField>

          {/* Location Field */}
          <SkeletonField>
            <SkeletonLabel>
              <SkeletonPulse />
            </SkeletonLabel>
            <SkeletonInput>
              <SkeletonPulse />
            </SkeletonInput>
          </SkeletonField>

          {/* User Type Field */}
          <SkeletonField>
            <SkeletonLabel>
              <SkeletonPulse />
            </SkeletonLabel>
            <SkeletonSelect>
              <SkeletonPulse />
            </SkeletonSelect>
          </SkeletonField>
        </SkeletonSection>

        {/* Contact Information Section */}
        <SkeletonSection>
          <SkeletonSectionTitle>
            <SkeletonPulse />
          </SkeletonSectionTitle>

          {/* Phone Field */}
          <SkeletonField>
            <SkeletonLabel>
              <SkeletonPulse />
            </SkeletonLabel>
            <SkeletonInput>
              <SkeletonPulse />
            </SkeletonInput>
          </SkeletonField>

          {/* Other Contact Field */}
          <SkeletonField>
            <SkeletonLabel>
              <SkeletonPulse />
            </SkeletonLabel>
            <SkeletonInput>
              <SkeletonPulse />
            </SkeletonInput>
          </SkeletonField>
        </SkeletonSection>

        {/* Profile Photo Section */}
        {showProfileImage && (
          <SkeletonSection>
            <SkeletonSectionTitle>
              <SkeletonPulse />
            </SkeletonSectionTitle>

            <SkeletonImagePreview>
              <SkeletonPulse />
            </SkeletonImagePreview>

            <SkeletonField>
              <SkeletonLabel>
                <SkeletonPulse />
              </SkeletonLabel>
              <SkeletonFileInput>
                <SkeletonPulse />
              </SkeletonFileInput>
              <SkeletonFileInfo>
                <SkeletonPulse />
              </SkeletonFileInfo>
            </SkeletonField>

            {/* Captcha and Upload Button (if showing) */}
            {showCaptcha && (
              <>
                <SkeletonCaptchaArea>
                  <SkeletonPulse />
                </SkeletonCaptchaArea>
                <SkeletonUploadButton>
                  <SkeletonPulse />
                </SkeletonUploadButton>
              </>
            )}
          </SkeletonSection>
        )}

        {/* Vehicle Photo Section */}
        {showVehicleImage && (
          <SkeletonSection>
            <SkeletonSectionTitle>
              <SkeletonPulse />
            </SkeletonSectionTitle>

            <SkeletonImagePreview>
              <SkeletonPulse />
            </SkeletonImagePreview>

            <SkeletonField>
              <SkeletonLabel>
                <SkeletonPulse />
              </SkeletonLabel>
              <SkeletonFileInput>
                <SkeletonPulse />
              </SkeletonFileInput>
              <SkeletonFileInfo>
                <SkeletonPulse />
              </SkeletonFileInfo>
            </SkeletonField>

            {/* Captcha and Upload Button (if showing) */}
            {showCaptcha && (
              <>
                <SkeletonCaptchaArea>
                  <SkeletonPulse />
                </SkeletonCaptchaArea>
                <SkeletonUploadButton>
                  <SkeletonPulse />
                </SkeletonUploadButton>
              </>
            )}
          </SkeletonSection>
        )}

        {/* Submit Button */}
        <SkeletonSubmitButton>
          <SkeletonPulse />
        </SkeletonSubmitButton>
      </SkeletonForm>

      {/* Back Link */}
      <SkeletonLink>
        <SkeletonPulse />
      </SkeletonLink>
    </SkeletonContent>
  </SkeletonContainer>
);

ProfileSkeleton.propTypes = {
  showProfileImage: PropTypes.bool,
  showVehicleImage: PropTypes.bool,
  showCaptcha: PropTypes.bool,
};

export default ProfileSkeleton;
