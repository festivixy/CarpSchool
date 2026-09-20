import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import swal from "sweetalert";
import { Places } from "../../../api/places/Places";
import InteractiveMapPicker from "./InteractiveMapPicker";
import WaypointMap from "./WaypointMap";
import { formatPlaceValue } from "../../utils/placeCoords";
import { isAdminRole } from "../../desktop/components/NavBarRoleUtils";
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
    this.modalRef = React.createRef();
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
      isDirty: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    // Move focus into the modal as soon as it opens.
    if (this.state.modalOpen && !prevState.modalOpen && this.modalRef.current) {
      this.modalRef.current.focus();
    }
  }

  canManagePlace = (place) => place.createdBy === Meteor.userId()
    || isAdminRole(this.props.currentUser);

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
            swal("Error", error.reason || error.message, "error");
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
      isDirty: false,
    });
  };

  /* Map click: open the usual add form with the clicked point already filled
   * in, so the only thing left to supply is the name. */
  openAddModalAt = (coords) => {
    this.setState({
      modalOpen: true,
      editingPlace: null,
      formData: { text: "", value: formatPlaceValue(coords.lat, coords.lng) },
      errors: {},
      selectedCoordinates: coords,
      showMapPicker: false,
      isDirty: false,
    });
  };

  /* Drag a pin: persist the new position straight away. Only pins the viewer
   * may edit are draggable, so this should not be refused server-side, but the
   * error is surfaced rather than swallowed if it is. */
  handleWaypointMove = (place, coords) => {
    Meteor.call(
      "places.update",
      place._id,
      { value: formatPlaceValue(coords.lat, coords.lng) },
      (error) => {
        if (error) {
          swal("Error", error.reason || "Could not move that waypoint", "error");
        }
      },
    );
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
      isDirty: false,
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
      isDirty: false,
    });
  };

  /* Backdrop click / Escape: close directly unless the form has unsaved
   * changes, in which case confirm first. */
  handleModalDismiss = () => {
    if (!this.state.isDirty) {
      this.closeModal();
      return;
    }

    swal({
      title: "Discard changes?",
      text: "You have unsaved changes. Close without saving?",
      icon: "warning",
      buttons: {
        cancel: "Keep editing",
        confirm: { text: "Discard", className: "swal-button--danger" },
      },
    }).then((confirmed) => {
      if (confirmed) this.closeModal();
    });
  };

  handleModalKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      this.handleModalDismiss();
      return;
    }

    if (e.key === "Tab" && this.modalRef.current) {
      const focusables = this.modalRef.current.querySelectorAll(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex=\"-1\"])",
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
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
      isDirty: true,
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
      isDirty: true,
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
        swal("Error", error.reason || error.message, "error");
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
            swal("Error", error.reason || error.message, "error");
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
    const handle = isInternalUsername(user.username) ? "" : user.username;
    return (
      `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim() ||
      handle ||
      realEmailOf(user).split("@")[0] ||
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
            <TitleIcon></TitleIcon>
            Manage All Places
            <AdminBadge>Admin</AdminBadge>
          </Title>
          <ButtonContainer>
            <AddButton onClick={this.fixLegacyPlaces} style={{ backgroundColor: "#ff9800" }}>
              Fix Legacy Places
            </AddButton>
            <AddButton onClick={this.openAddModal}>Add Place</AddButton>
          </ButtonContainer>
        </Header>

        <Content>
          {/* Shows the filtered set, so map and list always agree. */}
          <WaypointMap
            places={filteredPlaces}
            canEdit
            onCreate={this.openAddModalAt}
            onSelect={this.openEditModal}
            onMove={this.handleWaypointMove}
          />

          <SearchContainer>
            <SearchIcon></SearchIcon>
            <SearchInput
              placeholder="Search by location name, coordinates, or creator..."
              value={searchQuery}
              onChange={(e) => this.handleSearchChange(e, { value: e.target.value })
              }
            />
          </SearchContainer>

          {filteredPlaces.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon></EmptyStateIcon>
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
                        <PlaceIcon></PlaceIcon>
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
                    {this.canManagePlace(place) && (
                      <ActionButtons>
                        <ActionButton
                          aria-label={`Edit ${place.text}`}
                          onClick={() => this.openEditModal(place)}
                        >

                        </ActionButton>
                        <ActionButton
                          aria-label={`Delete ${place.text}`}
                          variant="delete"
                          onClick={() => this.handleDelete(place)}
                        >

                        </ActionButton>
                      </ActionButtons>
                    )}
                  </PlaceHeader>
                </PlaceCard>
              ))}
            </PlacesGrid>
          )}
        </Content>

        {modalOpen && (
          <ModalOverlay onClick={this.handleModalDismiss}>
            <ModalContent
              ref={this.modalRef}
              role="dialog"
              aria-modal="true"
              aria-label={editingPlace ? "Edit Place" : "Add New Place"}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              onKeyDown={this.handleModalKeyDown}
            >
              <ModalHeader>
                <ModalTitle>
                  {editingPlace ? "Edit Place" : "Add New Place"}
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
                        ? "Manual Entry"
                        : "Pick on Map"}
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
  currentUser: PropTypes.object,
};

AdminPlaceManager.defaultProps = {
  currentUser: null,
};

export default withTracker(() => {
  const placesSubscription = Meteor.subscribe("places.admin");
  const usersSubscription = Meteor.subscribe("AllUsers");

  return {
    places: Places.find({}, { sort: { text: 1 } }).fetch(), // Places already filtered by publication
    users: Meteor.users.find({}).fetch(), // Users already filtered by AllUsers publication
    ready: placesSubscription.ready() && usersSubscription.ready(),
    currentUser: Meteor.user(),
  };
})(AdminPlaceManager);
