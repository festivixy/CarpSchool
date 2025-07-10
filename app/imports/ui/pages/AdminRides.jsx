import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Container, Table, Header, Loader, Button, Icon, Modal, Form, Message } from 'semantic-ui-react';
import { Rides } from '/imports/api/ride/Rides';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import swal from 'sweetalert';

/** Admin page for managing all rides */
class AdminRides extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editModalOpen: false,
      editingRide: null,
      editForm: {
        rideName: '',
        rideDate: '',
        rideTime: '',
        rideLocation: '',
        rideDestination: '',
        rideSeats: '',
        ridePrice: ''
      }
    };
  }

  handleDelete = (rideId) => {
    swal({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this ride!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        Meteor.call('rides.remove', rideId, (error) => {
          if (error) {
            swal('Error', error.message, 'error');
          } else {
            swal('Deleted!', 'The ride has been deleted.', 'success');
          }
        });
      }
    });
  };

  handleEdit = (ride) => {
    this.setState({
      editModalOpen: true,
      editingRide: ride,
      editForm: {
        rideName: ride.rideName || '',
        rideDate: ride.rideDate || '',
        rideTime: ride.rideTime || '',
        rideLocation: ride.rideLocation || '',
        rideDestination: ride.rideDestination || '',
        rideSeats: ride.rideSeats || '',
        ridePrice: ride.ridePrice || ''
      }
    });
  };

  handleFormChange = (e, { name, value }) => {
    this.setState({
      editForm: { ...this.state.editForm, [name]: value }
    });
  };

  handleSaveEdit = () => {
    const { editingRide, editForm } = this.state;
    Meteor.call('rides.update', editingRide._id, editForm, (error) => {
      if (error) {
        swal('Error', error.message, 'error');
      } else {
        swal('Success!', 'The ride has been updated.', 'success');
        this.setState({ editModalOpen: false, editingRide: null });
      }
    });
  };

  /** If the subscription(s) have been received, render the page, otherwise show a loading icon. */
  render() {
    return (this.props.ready) ? this.renderPage() : <Loader active>Getting data</Loader>;
  }

  /** Render the page once subscriptions have been received. */
  renderPage() {
    const { editModalOpen, editForm } = this.state;
    
    return (
      <Container>
        <Header as="h2" textAlign="center">Admin - Manage All Rides</Header>
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Ride Name</Table.HeaderCell>
              <Table.HeaderCell>Date</Table.HeaderCell>
              <Table.HeaderCell>Time</Table.HeaderCell>
              <Table.HeaderCell>From</Table.HeaderCell>
              <Table.HeaderCell>To</Table.HeaderCell>
              <Table.HeaderCell>Seats</Table.HeaderCell>
              <Table.HeaderCell>Price</Table.HeaderCell>
              <Table.HeaderCell>Driver</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.props.rides.map((ride) => (
              <Table.Row key={ride._id}>
                <Table.Cell>{ride.rideName}</Table.Cell>
                <Table.Cell>{ride.rideDate}</Table.Cell>
                <Table.Cell>{ride.rideTime}</Table.Cell>
                <Table.Cell>{ride.rideLocation}</Table.Cell>
                <Table.Cell>{ride.rideDestination}</Table.Cell>
                <Table.Cell>{ride.rideSeats}</Table.Cell>
                <Table.Cell>${ride.ridePrice}</Table.Cell>
                <Table.Cell>{ride.owner}</Table.Cell>
                <Table.Cell>
                  <Button
                    icon
                    size="small"
                    color="blue"
                    onClick={() => this.handleEdit(ride)}
                  >
                    <Icon name="edit" />
                  </Button>
                  <Button
                    icon
                    size="small"
                    color="red"
                    onClick={() => this.handleDelete(ride._id)}
                  >
                    <Icon name="trash" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        {/* Edit Modal */}
        <Modal open={editModalOpen} onClose={() => this.setState({ editModalOpen: false })}>
          <Modal.Header>Edit Ride</Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Input
                label="Ride Name"
                name="rideName"
                value={editForm.rideName}
                onChange={this.handleFormChange}
              />
              <Form.Input
                label="Date"
                name="rideDate"
                type="date"
                value={editForm.rideDate}
                onChange={this.handleFormChange}
              />
              <Form.Input
                label="Time"
                name="rideTime"
                type="time"
                value={editForm.rideTime}
                onChange={this.handleFormChange}
              />
              <Form.Input
                label="From Location"
                name="rideLocation"
                value={editForm.rideLocation}
                onChange={this.handleFormChange}
              />
              <Form.Input
                label="To Destination"
                name="rideDestination"
                value={editForm.rideDestination}
                onChange={this.handleFormChange}
              />
              <Form.Input
                label="Available Seats"
                name="rideSeats"
                type="number"
                value={editForm.rideSeats}
                onChange={this.handleFormChange}
              />
              <Form.Input
                label="Price"
                name="ridePrice"
                type="number"
                step="0.01"
                value={editForm.ridePrice}
                onChange={this.handleFormChange}
              />
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => this.setState({ editModalOpen: false })}>
              Cancel
            </Button>
            <Button color="green" onClick={this.handleSaveEdit}>
              <Icon name="save" /> Save Changes
            </Button>
          </Modal.Actions>
        </Modal>
      </Container>
    );
  }
}

/** Require an array of Ride documents in the props. */
AdminRides.propTypes = {
  rides: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

/** withTracker connects Meteor data to React components. */
export default withTracker(() => {
  // Get access to all Rides documents (admin view)
  const subscription = Meteor.subscribe('Rides'); // Using existing subscription
  return {
    rides: Rides.find({}).fetch(),
    ready: subscription.ready(),
  };
})(AdminRides);
