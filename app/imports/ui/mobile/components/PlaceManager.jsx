import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { Button, Card, Form, Modal, Table, Icon, Header, Message } from "semantic-ui-react";
import swal from "sweetalert";
import { Places } from "../../../api/places/Places";

/**
 * Component for users to manage their own places
 */
class PlaceManager extends React.Component {
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

  validateForm = () => {
    const { text, value } = this.state.formData;
    const errors = {};

    if (!text.trim()) {
      errors.text = "Location name is required";
    }

    if (!value.trim()) {
      errors.value = "Coordinates are required";
    } else if (!/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(value.trim())) {
      errors.value = "Coordinates must be in format: latitude,longitude (e.g., 21.3099,-157.8581)";
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

  render() {
    const { places, ready } = this.props;
    const { modalOpen, editingPlace, formData, errors, loading } = this.state;

    if (!ready) {
      return <div>Loading places...</div>;
    }

    return (
      <Card fluid>
        <Card.Content>
          <Card.Header>
            <Icon name="map marker alternate" />
            My Places
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
          {places.length === 0 ? (
            <Message info>
              <Message.Header>No places yet</Message.Header>
              <p>Create your first place to get started with ride sharing!</p>
            </Message>
          ) : (
            <Table celled>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Location Name</Table.HeaderCell>
                  <Table.HeaderCell>Coordinates</Table.HeaderCell>
                  <Table.HeaderCell>Created</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {places.map((place) => (
                  <Table.Row key={place._id}>
                    <Table.Cell>
                      <Icon name="map pin" />
                      {place.text}
                    </Table.Cell>
                    <Table.Cell>{place.value}</Table.Cell>
                    <Table.Cell>
                      {new Date(place.createdAt).toLocaleDateString()}
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
                <p>You can find coordinates by searching for a location on Google Maps and clicking on the map. The coordinates will appear at the bottom.</p>
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

PlaceManager.propTypes = {
  places: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe("places.mine");
  return {
    places: Places.find({}, { sort: { text: 1 } }).fetch(),
    ready: subscription.ready(),
  };
})(PlaceManager);
