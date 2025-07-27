import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import swal from "sweetalert";
import { Places } from "../../../api/places/Places.js";
import InteractiveMapPicker from "./InteractiveMapPicker";
import {
  Container,
  Header,
  Title,
  TitleIcon,
  AddButton,
  Content,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateText,
  PlacesGrid,
  PlaceCard,
  PlaceHeader,
  PlaceInfo,
  PlaceName,
  PlaceIcon,
  PlaceCoordinates,
  PlaceDate,
  ActionButtons,
  ActionButton,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalActions,
  Form,
  FormField,
  Label,
  Input,
  ErrorText,
  Button,
  LoadingButton,
} from "../styles/PlaceManager";

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
      showMapPicker: false,
      selectedCoordinates: null,
      creatorNames: {}, // Cache for creator usernames
    };
  }

  componentDidMount() {
    this.fetchCreatorNames();
  }

  componentDidUpdate(prevProps) {
    // Fetch creator names when places change
    if (prevProps.places !== this.props.places) {
      this.fetchCreatorNames();
    }
  }

  fetchCreatorNames = () => {
    const { places } = this.props;
    const creatorIds = [...new Set(places.map(place => place.createdBy).filter(Boolean))];

    creatorIds.forEach(creatorId => {
      if (!this.state.creatorNames[creatorId]) {
        // Call method to get username
        Meteor.call("users.getUsername", creatorId, (error, username) => {
          if (!error && username) {
            this.setState(prevState => ({
              creatorNames: {
                ...prevState.creatorNames,
                [creatorId]: username,
              },
            }));
          }
        });
      }
    });
  };

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
      showMapPicker: false,
      selectedCoordinates: null,
    });
  };

  toggleMapPicker = () => {
    const { editingPlace, formData } = this.state;
    let coordinates = null;

    // If editing and has coordinates, parse them
    if (editingPlace && editingPlace.value) {
      const [lat, lng] = editingPlace.value
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        coordinates = { lat, lng };
      }
    } else if (
      formData.value &&
      /^-?\d+\.?\d*,-?\d+\.?\d*$/.test(formData.value.trim())
    ) {
      const [lat, lng] = formData.value
        .split(",")
        .map((coord) => parseFloat(coord.trim()));
      if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
        coordinates = { lat, lng };
      }
    }

    this.setState((prevState) => ({
      showMapPicker: !prevState.showMapPicker,
      selectedCoordinates: coordinates,
    }));
  };

  handleLocationSelect = (location) => {
    const coordinateString = `${location.lat},${location.lng}`;
    this.setState({
      formData: {
        ...this.state.formData,
        value: coordinateString,
      },
      selectedCoordinates: location,
      errors: {
        ...this.state.errors,
        value: null,
      },
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
      errors.value =
        "Coordinates must be in format: latitude,longitude (e.g., 21.3099,-157.8581)";
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
        swal(
          "Success",
          `Place ${editingPlace ? "updated" : "created"} successfully!`,
          "success",
        );
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
      return (
        <Container>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading places...</LoadingText>
          </LoadingContainer>
        </Container>
      );
    }

    return (
      <Container>
        <Header>
          <Title>
            <TitleIcon>📍</TitleIcon>
            My Places
          </Title>
          <AddButton onClick={this.openAddModal}>➕ Add Place</AddButton>
        </Header>

        <Content>
          {places.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>📍</EmptyStateIcon>
              <EmptyStateTitle>No places yet</EmptyStateTitle>
              <EmptyStateText>
                Create your first place to get started with ride sharing!
              </EmptyStateText>
            </EmptyState>
          ) : (
            <PlacesGrid>
              {places.map((place) => (
                <PlaceCard key={place._id}>
                  <PlaceHeader>
                    <PlaceInfo>
                      <PlaceName>
                        <PlaceIcon>📍</PlaceIcon>
                        {place.text}
                      </PlaceName>
                      <PlaceCoordinates>{place.value}</PlaceCoordinates>
                      <PlaceDate>
                        Created:{" "}
                        {new Date(place.createdAt).toLocaleDateString()}
                        {place.createdBy && (
                          <span style={{ marginLeft: "8px", color: "#666" }}>
                            by {place.createdBy === Meteor.userId()
                              ? "You"
                              : (this.state.creatorNames[place.createdBy] || "Loading...")}
                          </span>
                        )}
                      </PlaceDate>
                    </PlaceInfo>
                    <ActionButtons>
                      <ActionButton onClick={() => this.openEditModal(place)}>
                        ✏️
                      </ActionButton>
                      <ActionButton
                        variant="delete"
                        onClick={() => this.handleDelete(place)}
                      >
                        🗑️
                      </ActionButton>
                    </ActionButtons>
                  </PlaceHeader>
                </PlaceCard>
              ))}
            </PlacesGrid>
          )}
        </Content>

        {modalOpen && (
          <ModalOverlay onClick={this.closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>
                  📍 {editingPlace ? "Edit Place" : "Add New Place"}
                </ModalTitle>
              </ModalHeader>

              <ModalBody>
                <Form
                  onSubmit={(e) => {
                    e.preventDefault();
                    this.handleSubmit();
                  }}
                >
                  <FormField>
                    <Label>Location Name</Label>
                    <Input
                      name="text"
                      value={formData.text}
                      onChange={(e) => this.handleInputChange(e, {
                          name: e.target.name,
                          value: e.target.value,
                        })
                      }
                      placeholder="e.g., Downtown Honolulu"
                    />
                    {errors.text && <ErrorText>{errors.text}</ErrorText>}
                  </FormField>

                  <FormField>
                    <Label>Coordinates (Latitude, Longitude)</Label>
                    <Input
                      name="value"
                      value={formData.value}
                      onChange={(e) => this.handleInputChange(e, {
                          name: e.target.name,
                          value: e.target.value,
                        })
                      }
                      placeholder="e.g., 21.3099,-157.8581"
                    />
                    {errors.value && <ErrorText>{errors.value}</ErrorText>}
                    <Button
                      type="button"
                      onClick={this.toggleMapPicker}
                      style={{ marginTop: "8px" }}
                    >
                      {this.state.showMapPicker
                        ? "📝 Manual Entry"
                        : "🗺️ Pick on Map"}
                    </Button>
                  </FormField>

                  {this.state.showMapPicker && (
                    <FormField>
                      <Label>Select location on map:</Label>
                      <InteractiveMapPicker
                        onLocationSelect={this.handleLocationSelect}
                        selectedLocation={this.state.selectedCoordinates}
                        height="300px"
                      />
                    </FormField>
                  )}
                </Form>
              </ModalBody>

              <ModalActions>
                <Button onClick={this.closeModal}>Cancel</Button>
                <LoadingButton
                  variant="primary"
                  onClick={this.handleSubmit}
                  disabled={loading}
                >
                  {editingPlace ? "Update" : "Create"} Place
                </LoadingButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
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
