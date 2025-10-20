import React from "react";
import PropTypes from "prop-types";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Profiles } from "../../api/profile/Profile";
import {
  PrivacyContainer,
  PrivacyTitle,
  PrivacyOptions,
  PrivacyOption,
  PrivacyIcon,
  PrivacyLabel,
  PrivacyDescription,
  PrivacyNote,
} from "../styles/ImagePrivacySelector";

/**
 * ImagePrivacySelector - Component for selecting image privacy settings
 * Allows users to choose between public and private image sharing
 */
const ImagePrivacySelector = ({ 
  privacyOptions, 
  onPrivacyChange, 
  userProfile,
  disabled = false,
  showDescription = true 
}) => {
  const handlePrivacyChange = (isPrivate) => {
    const newOptions = {
      private: isPrivate,
      school: isPrivate ? userProfile?.SchoolId : null,
      user: isPrivate ? Meteor.userId() : null,
    };
    
    if (onPrivacyChange) {
      onPrivacyChange(newOptions);
    }
  };

  return (
    <PrivacyContainer>
      <PrivacyTitle>Image Privacy Settings</PrivacyTitle>
      
      <PrivacyOptions>
        {/* Public Option */}
        <PrivacyOption 
          selected={!privacyOptions.private}
          onClick={() => !disabled && handlePrivacyChange(false)}
          disabled={disabled}
        >
          <PrivacyIcon>🌍</PrivacyIcon>
          <PrivacyLabel>Public</PrivacyLabel>
          {showDescription && (
            <PrivacyDescription>
              Anyone can view this image
            </PrivacyDescription>
          )}
        </PrivacyOption>

        {/* Private Option */}
        <PrivacyOption 
          selected={privacyOptions.private}
          onClick={() => !disabled && handlePrivacyChange(true)}
          disabled={disabled}
        >
          <PrivacyIcon>🔒</PrivacyIcon>
          <PrivacyLabel>Private</PrivacyLabel>
          {showDescription && (
            <PrivacyDescription>
              Only you, school admins, and system admins can view
            </PrivacyDescription>
          )}
        </PrivacyOption>
      </PrivacyOptions>

      {showDescription && (
        <PrivacyNote>
          {privacyOptions.private ? (
            <>
              <strong>Private images</strong> are only visible to you, administrators of your school ({userProfile?.School}), and system administrators.
            </>
          ) : (
            <>
              <strong>Public images</strong> can be viewed by anyone using the application.
            </>
          )}
        </PrivacyNote>
      )}
    </PrivacyContainer>
  );
};

ImagePrivacySelector.propTypes = {
  privacyOptions: PropTypes.shape({
    private: PropTypes.bool.isRequired,
    school: PropTypes.string,
    user: PropTypes.string,
  }).isRequired,
  onPrivacyChange: PropTypes.func.isRequired,
  userProfile: PropTypes.object,
  disabled: PropTypes.bool,
  showDescription: PropTypes.bool,
};

export default withTracker(() => {
  const userProfile = Profiles.findOne({ Owner: Meteor.userId() });
  
  return {
    userProfile,
  };
})(ImagePrivacySelector);
