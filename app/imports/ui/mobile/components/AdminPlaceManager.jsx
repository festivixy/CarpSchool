import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import swal from "sweetalert";
import { Places } from "../../../api/places/Places";
import InteractiveMapPicker from "./InteractiveMapPicker";
import {
  Container,
  Header,
  Title,
  TitleIcon,
  AdminBadge,
  AddButton,
  Content,
  SearchContainer,
  SearchInput,
  SearchIcon,
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
  PlaceDetails,
  PlaceDetail,
  DetailLabel,
  DetailValue,
  CreatorName,
  UpdatedInfo,
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
  ButtonContainer,
} from "../../styles/AdminPlaceManager";

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
      showMapPicker: false,
      selectedCoordinates: null,
    };
  }

  fixLegacyPlaces = () => {
    swal({
      title: "Fix Legacy Places?",
      text: "This will add missing createdBy and createdAt fields to existing places. Continue?",
      icon: "warning",
      buttons: ["Cancel", "Fix Places"],
    }).then((willFix) => {
      if (willFix) {
        Meteor.call("places.fixLegacyPlaces", (error, result) => {
          if (error) {
            swal("Error", error.message, "error");
          } else {
            swal("Success", result.message, "success");
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

  getCreatorName = (createdBy) => {
    const user = this.props.users.find((u) => u._id === createdBy);
    if (!user) return "Unknown";
    return (
      user.username ||
      `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
      "Unknown"
    );
  };

  getFilteredPlaces = () => {
    const { places } = this.props;
    const { searchQuery } = this.state;

    if (!searchQuery.trim()) return places;

    const query = searchQuery.toLowerCase();
    return places.filter(
      (place) => place.text.toLowerCase().includes(query) ||
        place.value.toLowerCase().includes(query) ||
        this.getCreatorName(place.createdBy).toLowerCase().includes(query),
    );
  };

  render() {
    const { ready } = this.props;
    const { modalOpen, editingPlace, formData, errors, loading, searchQuery } =
      this.state;

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

    const filteredPlaces = this.getFilteredPlaces();

    return (
      <Container>
        <Header>
          <Title>
            <TitleIcon>🗺️</TitleIcon>
            Manage All Places
            <AdminBadge>Admin</AdminBadge>
          </Title>
          <ButtonContainer>
            <AddButton onClick={this.fixLegacyPlaces} style={{ backgroundColor: "#ff9800" }}>
              🔧 Fix Legacy Places
            </AddButton>
            <AddButton onClick={this.openAddModal}>➕ Add Place</AddButton>
          </ButtonContainer>
        </Header>

        <Content>
          <SearchContainer>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput
              placeholder="Search by location name, coordinates, or creator..."
              value={searchQuery}
              onChange={(e) => this.handleSearchChange(e, { value: e.target.value })
              }
            />
          </SearchContainer>

          {filteredPlaces.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>📍</EmptyStateIcon>
              <EmptyStateTitle>No places found</EmptyStateTitle>
              <EmptyStateText>
                {searchQuery
                  ? "Try adjusting your search query."
                  : "No places have been created yet."}
              </EmptyStateText>
            </EmptyState>
          ) : (
            <PlacesGrid>
              {filteredPlaces.map((place) => (
                <PlaceCard key={place._id}>
                  <PlaceHeader>
                    <PlaceInfo>
                      <PlaceName>
                        <PlaceIcon>📍</PlaceIcon>
                        {place.text}
                      </PlaceName>
                      <PlaceCoordinates>{place.value}</PlaceCoordinates>

                      <PlaceDetails>
                        <PlaceDetail>
                          <DetailLabel>Created By</DetailLabel>
                          <DetailValue>
                            <CreatorName>
                              {this.getCreatorName(place.createdBy)}
                            </CreatorName>
                          </DetailValue>
                        </PlaceDetail>
                        <PlaceDetail>
                          <DetailLabel>Created Date</DetailLabel>
                          <DetailValue>
                            {new Date(place.createdAt).toLocaleDateString()}
                            {place.updatedAt && (
                              <UpdatedInfo>
                                Updated:{" "}
                                {new Date(place.updatedAt).toLocaleDateString()}
                              </UpdatedInfo>
                            )}
                          </DetailValue>
                        </PlaceDetail>
                      </PlaceDetails>
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
