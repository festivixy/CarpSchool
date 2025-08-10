import React, { useState } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import AddRidesModal from "../../../components/AddRides";

/**
 * iOS-specific Create Ride page
 * Empty page that shows the existing AddRidesModal
 */
const CreateRide = ({ history, currentUser }) => {
  const [showModal, setShowModal] = useState(true);

  const handleClose = () => {
    setShowModal(false);
    history.goBack();
  };

  const handleCreateSuccess = () => {
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
      <AddRidesModal
        open={showModal}
        onClose={handleClose}
        onRideCreated={handleCreateSuccess}
        currentUser={currentUser}
      />
    </div>
  );
};

CreateRide.propTypes = {
  history: PropTypes.object.isRequired,
  currentUser: PropTypes.object,
};

export default withRouter(withTracker(() => ({
  currentUser: Meteor.user(),
}))(CreateRide));
