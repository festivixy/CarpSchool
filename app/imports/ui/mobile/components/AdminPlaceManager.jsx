import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Button, Card, Form, Modal, Table, Icon, Header, Message, Input } from "semantic-ui-react";
import swal from "sweetalert";
import { Places } from "../../../api/places/Places";

/**
 * Component for admins to manage all places in the system
 */
class AdminPlaceManager extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      editingPlace: null,
      formData: {
        text: "",
        value: "",
      },
      errors: {},
      loading: false,
      searchQuery: "",
    };
  }

  openAddModal = () => {
    this.setState({
      modalOpen: true,
      editingPlace: null,
      formData: { text: "", value: "" },
      errors: {},
    });
  };

  openEditModal = (place) => {
    this.setState({
      modalOpen: true,
      editingPlace: place,
      formData: {
        text: place.text,
        value: place.value,
      },
      errors: {},
    });
  };

  closeModal = () => {
    this.setState({
      modalOpen: false,
      editingPlace: null,
      formData: { text: "", value: "" },
      errors: {},
      loading: false,
    });
  };

  handleInputChange = (e, { name, value }) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value,
      },
      errors: {
        ...this.state.errors,
        [name]: null,
      },
    });
  };

  handleSearchChange = (e, { value }) => {
    this.setState({ searchQuery: value });
  };

  validateForm = () => {
    const { text, value } = this.state.formData;
    const errors = {};

    if (!text.trim()) {
      errors.text = "Location name is required";
    }

    if (!value.trim()) {
      errors.value = "Coordinates are required";
    } else if (!/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(value.trim())) {
      errors.value = "Coordinates must be in format: latitude,longitude";
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  };

  handleSubmit = () => {
    if (!this.validateForm()) {
      return;
    }

    this.setState({ loading: true });

    const { text, value } = this.state.formData;
    const { editingPlace } = this.state;

    const method = editingPlace ? "places.update" : "places.insert";
    const args = editingPlace 
      ? [editingPlace._id, { text: text.trim(), value: value.trim() }]
      : [{ text: text.trim(), value: value.trim() }];

    Meteor.call(method, ...args, (error) => {
      this.setState({ loading: false });
      
      if (error) {
        swal("Error", error.message, "error");
      } else {
        swal("Success", `Place ${editingPlace ? "updated" : "created"} successfully!`, "success");
        this.closeModal();
      }
    });
  };

  handleDelete = (place) => {
    swal({
      title: "Delete Place?",
      text: `Are you sure you want to delete "${place.text}"?`,
      icon: "warning",
      buttons: {
        cancel: "Cancel",
        confirm: {
          text: "Delete",
          className: "swal-button--danger",
        },
      },
    }).then((willDelete) => {
      if (willDelete) {
        Meteor.call("places.remove", place._id, (error) => {
          if (error) {
            swal("Error", error.message, "error");
          } else {
            swal("Deleted", "Place deleted successfully!", "success");
          }
        });
      }
    });
  };

  getCreatorName = (createdBy) => {
    const user = this.props.users.find(u => u._id === createdBy);
    if (!user) return "Unknown";
    return user.username || `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() || "Unknown";
  };

  getFilteredPlaces = () => {
    const { places } = this.props;
    const { searchQuery } = this.state;
    
    if (!searchQuery.trim()) return places;
    
    const query = searchQuery.toLowerCase();
    return places.filter(place => 
      place.text.toLowerCase().includes(query) ||
      place.value.toLowerCase().includes(query) ||
      this.getCreatorName(place.createdBy).toLowerCase().includes(query)
    );
  };

  render() {
    const { ready } = this.props;
    const { modalOpen, editingPlace, formData, errors, loading, searchQuery } = this.state;

    if (!ready) {
      return <div>Loading places...</div>;
    }

    const filteredPlaces = this.getFilteredPlaces();

    return (
      <Card fluid>
        <Card.Content>
          <Card.Header>
            <Icon name="map marker alternate" />
            Manage All Places (Admin)
            <Button
              primary
              floated="right"
              icon="plus"
              content="Add Place"
              onClick={this.openAddModal}
            />
          </Card.Header>
        </Card.Content>
        
        <Card.Content>
          <Input
            icon="search"
            placeholder="Search by location name, coordinates, or creator..."
            value={searchQuery}
            onChange={this.handleSearchChange}
            fluid
            style={{ marginBottom: "1rem" }}
          />

          {filteredPlaces.length === 0 ? (
            <Message info>
              <Message.Header>No places found</Message.Header>
              <p>{searchQuery ? "Try adjusting your search query." : "No places have been created yet."}</p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Location Name</Table.HeaderCell>
                  <Table.HeaderCell>Coordinates</Table.HeaderCell>
                  <Table.HeaderCell>Created By</Table.HeaderCell>
                  <Table.HeaderCell>Created Date</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredPlaces.map((place) => (
                  <Table.Row key={place._id}>
                    <Table.Cell>
                      <Icon name="map pin" />
                      {place.text}
                    </Table.Cell>
                    <Table.Cell>{place.value}</Table.Cell>
                    <Table.Cell>{this.getCreatorName(place.createdBy)}</Table.Cell>
                    <Table.Cell>
                      {new Date(place.createdAt).toLocaleDateString()}
                      {place.updatedAt && (
                        <div style={{ fontSize: "0.8em", color: "#666" }}>
                          Updated: {new Date(place.updatedAt).toLocaleDateString()}
                        </div>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        icon="edit"
                        size="mini"
                        onClick={() => this.openEditModal(place)}
                      />
                      <Button
                        icon="trash"
                        size="mini"
                        color="red"
                        onClick={() => this.handleDelete(place)}
                      />
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}
        </Card.Content>

        <Modal open={modalOpen} onClose={this.closeModal} size="small">
          <Header icon="map marker alternate" content={editingPlace ? "Edit Place" : "Add New Place"} />
          
          <Modal.Content>
            <Form loading={loading}>
              <Form.Input
                label="Location Name"
                name="text"
                value={formData.text}
                onChange={this.handleInputChange}
                error={errors.text}
                placeholder="e.g., Downtown Honolulu"
              />
              <Form.Input
                label="Coordinates (Latitude, Longitude)"
                name="value"
                value={formData.value}
                onChange={this.handleInputChange}
                error={errors.value}
                placeholder="e.g., 21.3099,-157.8581"
              />
              <Message info>
                <Message.Header>Need coordinates?</Message.Header>
                <p>You can find coordinates by searching for a location on Google Maps and clicking on the map.</p>
              </Message>
            </Form>
          </Modal.Content>

          <Modal.Actions>
            <Button onClick={this.closeModal}>Cancel</Button>
            <Button
              primary
              onClick={this.handleSubmit}
              loading={loading}
              disabled={loading}
            >
              {editingPlace ? "Update" : "Create"} Place
            </Button>
          </Modal.Actions>
        </Modal>
      </Card>
    );
  }
}

AdminPlaceManager.propTypes = {
  places: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const placesSubscription = Meteor.subscribe("places.admin");
  const usersSubscription = Meteor.subscribe("AllUsers");
  
  return {
    places: Places.find({}, { sort: { text: 1 } }).fetch(),
    users: Meteor.users.find({}).fetch(),
    ready: placesSubscription.ready() && usersSubscription.ready(),
  };
})(AdminPlaceManager);
