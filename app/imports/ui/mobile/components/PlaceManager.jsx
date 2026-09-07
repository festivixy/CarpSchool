import React from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import swal from "sweetalert";
import { Places } from "../../../api/places/Places";
import InteractiveMapPicker from "./InteractiveMapPicker";
import WaypointMap from "./WaypointMap";
import { formatPlaceValue, canEditPlace } from "../../utils/placeCoords";
import { isAdminRole } from "../../desktop/components/NavBarRoleUtils";
import { PlaceManagerSkeleton } from "../../skeleton";
import { SkeletonPulse } from "../../skeleton/styles/PlaceManagerSkeleton";
import {
  Container,
  Header,
  Title,
  TitleIcon,
  AddButton,
  Content,
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
  CreatorNameSkeleton,
} from "../styles/PlaceManager";

/**
 * Component for users to manage their own places
 */
class PlaceManager extends React.Component {
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
      showMapPicker: false,
      selectedCoordinates: null,
      creatorNames: {}, // Cache for creator usernames
      isDirty: false,
    };
  }

  componentDidMount() {
    this.fetchCreatorNames();
  }

  componentDidUpdate(prevProps, prevState) {
    // Fetch creator names when places change
    if (prevProps.places !== this.props.places) {
      this.fetchCreatorNames();
    }

    // Move focus into the modal as soon as it opens.
    if (this.state.modalOpen && !prevState.modalOpen && this.modalRef.current) {
      this.modalRef.current.focus();
    }
  }

  canManagePlace = (place) => place.createdBy === Meteor.userId()
    || isAdminRole(this.props.currentUser);

  fetchCreatorNames = () => {
    const { places } = this.props;
    const creatorIds = [...new Set(places.map(place => place.createdBy).filter(Boolean))];

    // Filter out IDs we already have
    const idsToFetch = creatorIds.filter(id => !this.state.creatorNames[id]);

    if (idsToFetch.length === 0) return;

    // Use bulk method for better performance
    Meteor.call("users.getDisplayNames", idsToFetch, (error, displayNames) => {
      if (!error && displayNames) {
        this.setState(prevState => ({
          creatorNames: {
            ...prevState.creatorNames,
            ...displayNames,
          },
        }));
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

  render() {
    const { places, ready } = this.props;
    const { modalOpen, editingPlace, formData, errors, loading } = this.state;

    if (!ready) {
      return <PlaceManagerSkeleton numberOfPlaces={6} />;
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
          <WaypointMap
            places={places}
            canEdit={place => canEditPlace(place, Meteor.userId())}
            onCreate={this.openAddModalAt}
            onSelect={this.openEditModal}
            onMove={this.handleWaypointMove}
          />

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
                        {place.createdAt
                          ? new Date(place.createdAt).toLocaleDateString()
                          : "Legacy place"}
                      </PlaceDate>
                      <PlaceDate style={{ marginTop: "4px", fontWeight: "600", color: "#007bff" }}>
                        Creator: {place.createdBy ? ( // eslint-disable-line no-nested-ternary
                          place.createdBy === Meteor.userId()
                            ? "You"
                            : (this.state.creatorNames[place.createdBy] || (
                              <CreatorNameSkeleton>
                                <SkeletonPulse />
                              </CreatorNameSkeleton>
                            ))
                        ) : "Legacy user"}
                      </PlaceDate>
                    </PlaceInfo>
                    {this.canManagePlace(place) && (
                      <ActionButtons>
                        <ActionButton
                          aria-label={`Edit ${place.text}`}
                          onClick={() => this.openEditModal(place)}
                        >
                          ✏️
                        </ActionButton>
                        <ActionButton
                          aria-label={`Delete ${place.text}`}
                          variant="delete"
                          onClick={() => this.handleDelete(place)}
                        >
                          🗑️
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
  currentUser: PropTypes.object,
};

PlaceManager.defaultProps = {
  currentUser: null,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe("places.mine");
  const ready = subscription.ready();

  return {
    places: ready ? Places.find({}, { sort: { text: 1 } }).fetch() : [],
    ready,
    currentUser: Meteor.user(),
  };
})(PlaceManager);
