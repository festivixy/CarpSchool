import React from 'react';
import { Card } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';


/* PROFILE NOT IMPLEMENTED YET
          <Card.Content extra>
            <div className='ui two buttons'>
              <Button basic color='green'>
              Take this ride!
            </Button>
              <Button basic color='blue'>
                Driver Info.
              </Button>
            </div>
          </Card.Content>
          */
/** Renders a single ride card. See pages/ListRides.jsx. */
class Ride extends React.Component {
  render() {
    return (
        <Card centered>
          <Card.Content>
            <Card.Header>{this.props.ride.origin} to {this.props.ride.destination}</Card.Header>
            <Card.Meta>
              {this.props.ride.date.toLocaleDateString('en-US')} at {this.props.ride.date.toLocaleTimeString('en-US')}
            </Card.Meta>
            <Card.Description>
              <strong>Driver:</strong> {this.props.ride.driver}
              <br />
              <strong>Rider:</strong> {this.props.ride.rider}
            </Card.Description>
          </Card.Content>
        </Card>
    );
  }
}

/** Require a document to be passed to this component. */
Ride.propTypes = {
  ride: PropTypes.object.isRequired,
};

/** Wrap this component in withRouter since we use the <Link> React Router element. */
export default withRouter(Ride);
