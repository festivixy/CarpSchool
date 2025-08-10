import React, { useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import JoinRideModal from "../../../components/JoinRideModal";

/**
 * iOS-specific Join Ride page
 * Empty page that shows the existing JoinRideModal
 */
const JoinRide = ({ history, currentUser }) => {
  const [showModal, setShowModal] = useState(true);

  const handleClose = () => {
    setShowModal(false);
    history.goBack();
  };

  const handleJoinSuccess = () => {
    setShowModal(false);
    history.push("/myRides");
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "transparent"
    }}>
      <JoinRideModal
        open={showModal}
        onClose={handleClose}
        onJoinSuccess={handleJoinSuccess}
        currentUser={currentUser}
      />
    </div>
  );
};

JoinRide.propTypes = {
  history: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
};

export default withRouter(withTracker(() => ({
  currentUser: Meteor.user(),
}))(JoinRide));
