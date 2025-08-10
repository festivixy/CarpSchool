import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import {
  BackButtonContainer,
  BackButtonCircle,
  BackIcon,
} from "../styles/BackButton";

/**
 * Fixed overlay back button component
 * Positioned in top-left corner with gray circle background
 */
const BackButton = ({ history, onClick, style, className, ...props }) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      history.goBack();
    }
  };

  return (
    <BackButtonContainer
      className={className}
      style={style}
      onClick={handleClick}
      {...props}
    >
      <BackButtonCircle>
        <BackIcon src="/svg/back.svg" alt="Back" />
      </BackButtonCircle>
    </BackButtonContainer>
  );
};

BackButton.propTypes = {
  history: PropTypes.object.isRequired,
  onClick: PropTypes.func, // Optional custom click handler
  style: PropTypes.object,
  className: PropTypes.string,
};

export default withRouter(BackButton);
