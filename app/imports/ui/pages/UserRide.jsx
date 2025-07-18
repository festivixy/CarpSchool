import React from "react";
import { Meteor } from "meteor/meteor";
import { Container, Header, Loader, Card } from "semantic-ui-react";
import { withTracker } from "meteor/react-meteor-data";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import Ride from "/imports/ui/components/Ride";
import JoinRideModal from "/imports/ui/components/JoinRideModal";
import { Rides } from "../../api/ride/Rides";

/** Renders a table containing all of the Stuff documents. Use <StuffItem> to render each row. */
class UserRide extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      joinRideModalOpen: false,
      prefillCode: "",
    };
  }

  componentDidMount() {
    // Check for code parameter in URL
    const urlParams = new URLSearchParams(this.props.location.search);
    const code = urlParams.get("code");

    if (code) {
      // Format the code with dash if it's 8 characters
      const formattedCode = code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code;
      this.setState({
        joinRideModalOpen: true,
        prefillCode: formattedCode,
      });
    }
  }

  handleJoinRideClose = () => {
    this.setState({ joinRideModalOpen: false, prefillCode: "" });
    // Clear the URL parameter
    this.props.history.replace("/imRiding");
  };

  /** If the subscription(s) have been received, render the page, otherwise show a loading icon. */
  render() {
    return (this.props.ready) ? this.renderPage() : <Loader active>Getting data</Loader>;
  }

  /** Render the page once subscriptions have been received. */
  renderPage() {
    let availRides = this.props.rides;
    availRides = availRides.filter(a => (a.rider === Meteor.user().username));

    return (
        <div>
        <Container>
          <Header as="h2" textAlign="center">Active Rides as Rider</Header>
          <Card.Group itemsPerRow={4}>
            {availRides.length === 0 ? (<h2>No rides available.</h2>) :
                (availRides.map((ride, index) => <Ride key = {index} ride={ride} />))}
          </Card.Group>
        </Container>

        <JoinRideModal
          open={this.state.joinRideModalOpen}
          onClose={this.handleJoinRideClose}
          prefillCode={this.state.prefillCode}
        />
        </div>
    );
  }
}

/** Require an array of Stuff documents in the props. */
UserRide.propTypes = {
  rides: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

/** withTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker */
export default withRouter(withTracker(() => {
  // Get access to Stuff documents.
  const subscription = Meteor.subscribe("Rides");
  return {
    rides: Rides.find({}).fetch(),
    ready: subscription.ready(),
  };
})(UserRide));
