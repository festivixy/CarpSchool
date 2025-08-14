import React from "react";
import {
  SkeletonPageContainer,
  SkeletonHeader,
  SkeletonHeaderTitle,
  SkeletonContent,
  SkeletonContentHeader,
  SkeletonContentTitle,
  SkeletonContentSubtitle,
  SkeletonForm,
  SkeletonSection,
  SkeletonSectionTitle,
  SkeletonField,
  SkeletonLabel,
  SkeletonDropdown,
  SkeletonDropdownInput,
  SkeletonDropdownArrow,
  SkeletonSwapButton,
  SkeletonDateTimeRow,
  SkeletonFieldHalf,
  SkeletonInput,
  SkeletonTextarea,
  SkeletonSubmitButton,
  SkeletonPulse,
} from "../styles/CreateRideSkeleton";

/**
 * Skeleton loading component for CreateRide page
 * Mimics the iOS CreateRide form structure
 */
const CreateRideSkeleton = () => (
    <SkeletonPageContainer>
      {/* Fixed Header */}
      <SkeletonHeader>
        <SkeletonHeaderTitle>
          <SkeletonPulse />
        </SkeletonHeaderTitle>
      </SkeletonHeader>

      <SkeletonContent>
        {/* Content Header */}
        <SkeletonContentHeader>
          <SkeletonContentTitle>
            <SkeletonPulse />
          </SkeletonContentTitle>
          <SkeletonContentSubtitle>
            <SkeletonPulse />
          </SkeletonContentSubtitle>
        </SkeletonContentHeader>

        {/* Form */}
        <SkeletonForm>
          {/* Route Section */}
          <SkeletonSection>
            <SkeletonSectionTitle>
              <SkeletonPulse />
            </SkeletonSectionTitle>

            {/* Origin Field */}
            <SkeletonField>
              <SkeletonLabel>
                <SkeletonPulse />
              </SkeletonLabel>
              <SkeletonDropdown>
                <SkeletonDropdownInput>
                  <SkeletonPulse />
                </SkeletonDropdownInput>
                <SkeletonDropdownArrow>
                  <SkeletonPulse />
                </SkeletonDropdownArrow>
              </SkeletonDropdown>
            </SkeletonField>

            {/* Swap Button */}
            <SkeletonSwapButton>
              <SkeletonPulse />
            </SkeletonSwapButton>

            {/* Destination Field */}
            <SkeletonField>
              <SkeletonLabel>
                <SkeletonPulse />
              </SkeletonLabel>
              <SkeletonDropdown>
                <SkeletonDropdownInput>
                  <SkeletonPulse />
                </SkeletonDropdownInput>
                <SkeletonDropdownArrow>
                  <SkeletonPulse />
                </SkeletonDropdownArrow>
              </SkeletonDropdown>
            </SkeletonField>
          </SkeletonSection>

          {/* DateTime Section */}
          <SkeletonSection>
            <SkeletonSectionTitle>
              <SkeletonPulse />
            </SkeletonSectionTitle>

            <SkeletonDateTimeRow>
              <SkeletonFieldHalf>
                <SkeletonLabel>
                  <SkeletonPulse />
                </SkeletonLabel>
                <SkeletonInput>
                  <SkeletonPulse />
                </SkeletonInput>
              </SkeletonFieldHalf>
              <SkeletonFieldHalf>
                <SkeletonLabel>
                  <SkeletonPulse />
                </SkeletonLabel>
                <SkeletonInput>
                  <SkeletonPulse />
                </SkeletonInput>
              </SkeletonFieldHalf>
            </SkeletonDateTimeRow>
          </SkeletonSection>

          {/* Details Section */}
          <SkeletonSection>
            <SkeletonSectionTitle>
              <SkeletonPulse />
            </SkeletonSectionTitle>

            <SkeletonField>
              <SkeletonLabel>
                <SkeletonPulse />
              </SkeletonLabel>
              <SkeletonInput>
                <SkeletonPulse />
              </SkeletonInput>
            </SkeletonField>

            <SkeletonField>
              <SkeletonLabel>
                <SkeletonPulse />
              </SkeletonLabel>
              <SkeletonTextarea>
                <SkeletonPulse />
              </SkeletonTextarea>
            </SkeletonField>
          </SkeletonSection>

          {/* Submit Button */}
          <SkeletonSubmitButton>
            <SkeletonPulse />
          </SkeletonSubmitButton>
        </SkeletonForm>
      </SkeletonContent>
    </SkeletonPageContainer>
  );



export default CreateRideSkeleton;
