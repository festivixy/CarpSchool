import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Container, Table, Header, Loader, Button, Icon, Modal, Form, Message, Dropdown } from 'semantic-ui-react';
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
        driver: '',
        rider: '',
        origin: '',
        destination: '',
        date: ''
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
        driver: ride.driver || '',
        rider: ride.rider || '',
        origin: ride.origin || '',
        destination: ride.destination || '',
        date: ride.date ? new Date(ride.date).toISOString().split('T')[0] : ''
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
    const { rides, users } = this.props;
    
    return (
      <Container>
        <Header as="h2" textAlign="center">
          <Icon name="car" />
          Manage Rides
        </Header>
        
        {rides.length === 0 ? (
          <Message info>
            <Message.Header>No rides found</Message.Header>
            <p>There are currently no rides in the system.</p>
          </Message>
        ) : (
          <Table celled>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Driver</Table.HeaderCell>
                <Table.HeaderCell>Rider</Table.HeaderCell>
                <Table.HeaderCell>Origin</Table.HeaderCell>
                <Table.HeaderCell>Destination</Table.HeaderCell>
                <Table.HeaderCell>Date</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rides.map((ride) => (
                <Table.Row key={ride._id}>
                  <Table.Cell>{ride.driver}</Table.Cell>
                  <Table.Cell>{ride.rider}</Table.Cell>
                  <Table.Cell>{ride.origin}</Table.Cell>
                  <Table.Cell>{ride.destination}</Table.Cell>
                  <Table.Cell>{ride.date ? new Date(ride.date).toLocaleDateString() : ''}</Table.Cell>
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
        )}

        {/* Edit Modal */}
        <Modal open={editModalOpen} onClose={() => this.setState({ editModalOpen: false })}>
          <Modal.Header>Edit Ride</Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Field>
                <label>Driver</label>
                <Dropdown
                  placeholder="Select Driver"
                  fluid
                  search
                  selection
                  value={editForm.driver}
                  onChange={(e, { value }) => this.handleFormChange(e, { name: 'driver', value })}
                  options={[
                    { key: 'TBD', value: 'TBD', text: 'TBD' },
                    ...users.map(user => ({
                      key: user._id,
                      value: user.username,
                      text: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''} (${user.username})`
                    }))
                  ]}
                />
              </Form.Field>
              <Form.Field>
                <label>Rider</label>
                <Dropdown
                  placeholder="Select Rider"
                  fluid
                  search
                  selection
                  value={editForm.rider}
                  onChange={(e, { value }) => this.handleFormChange(e, { name: 'rider', value })}
                  options={[
                    { key: 'TBD', value: 'TBD', text: 'TBD' },
                    ...users.map(user => ({
                      key: user._id,
                      value: user.username,
                      text: `${user.profile?.firstName || ''} ${user.profile?.lastName || ''} (${user.username})`
                    }))
                  ]}
                />
              </Form.Field>
              <Form.Select
                label="Origin"
                name="origin"
                value={editForm.origin}
                onChange={this.handleFormChange}
                options={[
                  { key: 'aiea', value: 'Aiea', text: 'Aiea' },
                  { key: 'ewa', value: 'Ewa Beach', text: 'Ewa Beach' },
                  { key: 'haleiwa', value: 'Hale`iwa', text: 'Hale`iwa' },
                  { key: 'hauula', value: 'Hau`ula', text: 'Hau`ula' },
                  { key: 'hawaiikai', value: 'Hawaii Kai', text: 'Hawaii Kai' },
                  { key: 'honolulu', value: 'Honolulu', text: 'Honolulu' },
                  { key: 'kaaawa', value: 'Ka`a`awa', text: 'Ka`a`awa' },
                  { key: 'kahala', value: 'Kahala', text: 'Kahala' },
                  { key: 'kahuku', value: 'Kahuku', text: 'Kahuku' },
                  { key: 'kailua', value: 'Kailua', text: 'Kailua' },
                  { key: 'kaneohe', value: 'Kane`ohe', text: 'Kane`ohe' },
                  { key: 'kapolei', value: 'Kapolei', text: 'Kapolei' },
                  { key: 'laie', value: 'La`ie', text: 'La`ie' },
                  { key: 'lanikai', value: 'Lanikai', text: 'Lanikai' },
                  { key: 'maili', value: 'Ma`ili', text: 'Ma`ili' },
                  { key: 'makaha', value: 'Makaha', text: 'Makaha' },
                  { key: 'manoa', value: 'Manoa', text: 'Manoa' },
                  { key: 'mililani', value: 'Mililani', text: 'Mililani' },
                  { key: 'nanakuli', value: 'Nanakuli', text: 'Nanakuli' },
                  { key: 'pearlcity', value: 'Pearl City', text: 'Pearl City' },
                  { key: 'uh', value: 'University of Hawaii Manoa', text: 'University of Hawaii Manoa' },
                  { key: 'wahiawa', value: 'Wahiawa', text: 'Wahiawa' },
                  { key: 'waialua', value: 'Waialua', text: 'Waialua' },
                  { key: 'waianae', value: 'Wai`anae', text: 'Wai`anae' },
                  { key: 'waikiki', value: 'Waikiki', text: 'Waikiki' },
                  { key: 'waimanalo', value: 'Waimanalo', text: 'Waimanalo' },
                  { key: 'waipahu', value: 'Waipahu', text: 'Waipahu' }
                ]}
              />
              <Form.Select
                label="Destination"
                name="destination"
                value={editForm.destination}
                onChange={this.handleFormChange}
                options={[
                  { key: 'aiea', value: 'Aiea', text: 'Aiea' },
                  { key: 'ewa', value: 'Ewa Beach', text: 'Ewa Beach' },
                  { key: 'haleiwa', value: 'Hale`iwa', text: 'Hale`iwa' },
                  { key: 'hauula', value: 'Hau`ula', text: 'Hau`ula' },
                  { key: 'hawaiikai', value: 'Hawaii Kai', text: 'Hawaii Kai' },
                  { key: 'honolulu', value: 'Honolulu', text: 'Honolulu' },
                  { key: 'kaaawa', value: 'Ka`a`awa', text: 'Ka`a`awa' },
                  { key: 'kahala', value: 'Kahala', text: 'Kahala' },
                  { key: 'kahuku', value: 'Kahuku', text: 'Kahuku' },
                  { key: 'kailua', value: 'Kailua', text: 'Kailua' },
                  { key: 'kaneohe', value: 'Kane`ohe', text: 'Kane`ohe' },
                  { key: 'kapolei', value: 'Kapolei', text: 'Kapolei' },
                  { key: 'laie', value: 'La`ie', text: 'La`ie' },
                  { key: 'lanikai', value: 'Lanikai', text: 'Lanikai' },
                  { key: 'maili', value: 'Ma`ili', text: 'Ma`ili' },
                  { key: 'makaha', value: 'Makaha', text: 'Makaha' },
                  { key: 'manoa', value: 'Manoa', text: 'Manoa' },
                  { key: 'mililani', value: 'Mililani', text: 'Mililani' },
                  { key: 'nanakuli', value: 'Nanakuli', text: 'Nanakuli' },
                  { key: 'pearlcity', value: 'Pearl City', text: 'Pearl City' },
                  { key: 'uh', value: 'University of Hawaii Manoa', text: 'University of Hawaii Manoa' },
                  { key: 'wahiawa', value: 'Wahiawa', text: 'Wahiawa' },
                  { key: 'waialua', value: 'Waialua', text: 'Waialua' },
                  { key: 'waianae', value: 'Wai`anae', text: 'Wai`anae' },
                  { key: 'waikiki', value: 'Waikiki', text: 'Waikiki' },
                  { key: 'waimanalo', value: 'Waimanalo', text: 'Waimanalo' },
                  { key: 'waipahu', value: 'Waipahu', text: 'Waipahu' }
                ]}
              />
              <Form.Input
                label="Date"
                name="date"
                type="date"
                value={editForm.date}
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
  users: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

/** withTracker connects Meteor data to React components. */
export default withTracker(() => {
  // Get access to all Rides documents and Users for dropdowns
  const ridesSubscription = Meteor.subscribe('Rides');
  const usersSubscription = Meteor.subscribe('AllUsers');
  
  return {
    rides: Rides.find({}).fetch(),
    users: Meteor.users.find({}).fetch(),
    ready: ridesSubscription.ready() && usersSubscription.ready(),
  };
})(AdminRides);
