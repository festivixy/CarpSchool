import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import swal from "sweetalert";
import { Rides } from "../../api/ride/Rides";
import { Places } from "../../api/places/Places";
import {
  Container,
  Header,
  Title,
  TitleIcon,
  Content,
  SearchContainer,
  SearchInput,
  SearchIcon,
  SearchResultsCount,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateText,
  RidesGrid,
  RideCard,
  RideHeader,
  RideRoute,
  RouteText,
  RouteDate,
  ActionButtons,
  ActionButton,
  RideDetails,
  DetailItem,
  DetailLabel,
  DetailValue,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalActions,
  Form,
  FormField,
  Label,
  Select,
  Input,
  Button,
  ErrorMessage,
} from "../styles/AdminRides";
import BackButton from "../mobile/components/BackButton";
import Icon from "../components/Icon";

/**
 * Modern mobile AdminRides component for managing all rides
 */
class MobileAdminRides extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editModalOpen: false,
      editingRide: null,
      editForm: {
        driver: "",
        riders: [],
        origin: "",
        destination: "",
        date: "",
        seats: "",
        notes: "",
      },
      loading: false,
      error: "",
      searchQuery: "",
    };
  }

  handleDelete = (rideId) => {
    swal({
      title: "Delete Ride?",
      text: "This action cannot be undone. The ride will be permanently deleted.",
      icon: "warning",
      buttons: {
        cancel: {
          text: "Cancel",
          visible: true,
          className: "swal-button--cancel",
        },
        confirm: {
          text: "Delete",
          className: "swal-button--danger",
        },
      },
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        this.setState({ loading: true, error: "" });
        Meteor.call("rides.remove", rideId, (error) => {
          this.setState({ loading: false });
          if (error) {
            const message = error.reason || error.message;
            this.setState({ error: message });
            swal("Error", message, "error");
          } else {
            swal(
              "Deleted!",
              "The ride has been successfully deleted.",
              "success",
            );
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
        driver: ride.driver || "",
        riders: Array.isArray(ride.riders) ? ride.riders : [],
        origin: ride.origin || "",
        destination: ride.destination || "",
        date: ride.date ? new Date(ride.date).toISOString().split("T")[0] : "",
        seats: ride.seats !== undefined ? String(ride.seats) : "",
        notes: ride.notes || "",
      },
      error: "",
    });
  };

  handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "riders") {
      this.setState({
        editForm: { ...this.state.editForm, riders: value ? [value] : [] },
      });
      return;
    }
    this.setState({
      editForm: { ...this.state.editForm, [name]: value },
    });
  };

  handleSaveEdit = (e) => {
    e.preventDefault();
    const { editingRide, editForm } = this.state;

    this.setState({ loading: true, error: "" });

    // Match the rides.update method's check() shape exactly: driver, riders,
    // origin, destination, date (ISO string), seats, notes.
    const payload = {
      driver: editForm.driver,
      riders: editForm.riders,
      origin: editForm.origin,
      destination: editForm.destination,
      date: editForm.date ? new Date(editForm.date).toISOString() : "",
      seats: parseInt(editForm.seats, 10) || 0,
      notes: editForm.notes,
    };

    Meteor.call("rides.update", editingRide._id, payload, (error) => {
      this.setState({ loading: false });
      if (error) {
        this.setState({ error: error.reason || error.message });
      } else {
        swal("Success!", "The ride has been successfully updated.", "success");
        this.setState({ editModalOpen: false, editingRide: null, error: "" });
      }
    });
  };

  handleCloseModal = () => {
    this.setState({
      editModalOpen: false,
      editingRide: null,
      error: "",
    });
  };

  formatUserOption = (user) => {
    const fullName =
      `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim();
    return fullName ? `${fullName} (${user.username})` : user.username;
  };

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value });
  };

  getPlaceName = (placeId) => {
    const place = this.props.places.find((p) => p._id === placeId);
    return place ? place.text : placeId; // Fallback to ID if place not found
  };

  filterRides = (rides) => {
    const { searchQuery } = this.state;
    if (!searchQuery.trim()) return rides;

    const query = searchQuery.toLowerCase();
    return rides.filter(
      (ride) => (ride.driver && ride.driver.toLowerCase().includes(query)) ||
        (ride.rider && ride.rider.toLowerCase().includes(query)) ||
        (ride.origin && ride.origin.toLowerCase().includes(query)) ||
        (ride.destination && ride.destination.toLowerCase().includes(query)) ||
        (ride.date && new Date(ride.date).toLocaleDateString().includes(query)),
    );
  };

  /** If the subscription(s) have been received, render the page, otherwise show a loading icon. */
  render() {
    return this.props.ready ? this.renderPage() : this.renderLoading();
  }

  renderLoading() {
    return (
      <Container>
        <Header>
          <Title>
            <TitleIcon><Icon name="car" size={20} /></TitleIcon>
            Manage Rides
          </Title>
        </Header>
        <Content>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading rides data...</LoadingText>
          </LoadingContainer>
        </Content>
      </Container>
    );
  }

  /** Render the page once subscriptions have been received. */
  renderPage() {
    const { editModalOpen, editForm, loading, error, searchQuery } = this.state;
    const { rides, users } = this.props;
    const filteredRides = this.filterRides(rides);

    return (
      <Container>
        <BackButton />
        <Header>
          <Title>
            <TitleIcon><Icon name="car" size={20} /></TitleIcon>
            Manage Rides
          </Title>
        </Header>

        <Content>
          <SearchContainer>
            <SearchIcon><Icon name="search" size={16} /></SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search rides by driver, rider, origin, destination, or date..."
              value={searchQuery}
              onChange={this.handleSearchChange}
            />
          </SearchContainer>

          {rides.length === 0 ? ( // eslint-disable-line
            <EmptyState>
              <EmptyStateIcon><Icon name="car" size={32} /></EmptyStateIcon>
              <EmptyStateTitle>No rides found</EmptyStateTitle>
              <EmptyStateText>
                There are currently no rides in the system. Rides will appear
                here once users start creating them.
              </EmptyStateText>
            </EmptyState>
          ) : filteredRides.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon><Icon name="search" size={32} /></EmptyStateIcon>
              <EmptyStateTitle>No matching rides</EmptyStateTitle>
              <EmptyStateText>
                No rides match your search criteria. Try adjusting your search
                terms.
              </EmptyStateText>
            </EmptyState>
          ) : (
            <>
              <SearchResultsCount>
                {searchQuery.trim()
                  ? `${filteredRides.length} of ${rides.length} rides`
                  : `${rides.length} rides`}
              </SearchResultsCount>
              <RidesGrid>
                {filteredRides.map((ride) => (
                  <RideCard key={ride._id}>
                    <RideHeader>
                      <RideRoute>
                        <RouteText>
                          {this.getPlaceName(ride.origin)} →{" "}
                          {this.getPlaceName(ride.destination)}
                        </RouteText>
                        <RouteDate>
                          {ride.date
                            ? new Date(ride.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                            : "No date set"}
                        </RouteDate>
                      </RideRoute>
                      <ActionButtons>
                        <ActionButton
                          onClick={() => this.handleEdit(ride)}
                          disabled={loading}
                          title="Edit ride"
                        >

                        </ActionButton>
                        <ActionButton
                          variant="delete"
                          onClick={() => this.handleDelete(ride._id)}
                          disabled={loading}
                          title="Delete ride"
                        >
                          Delete
                        </ActionButton>
                      </ActionButtons>
                    </RideHeader>

                    <RideDetails>
                      <DetailItem>
                        <DetailLabel>Driver</DetailLabel>
                        <DetailValue>{ride.driver || "TBD"}</DetailValue>
                      </DetailItem>
                      <DetailItem>
                        <DetailLabel>
                          {ride.riders !== undefined && ride.seats !== undefined
                            ? `Riders (${ride.riders.length}/${ride.seats})`
                            : "Rider"}
                        </DetailLabel>
                        <DetailValue>
                          {/* eslint-disable-next-line no-nested-ternary */}
                          {ride.riders !== undefined && ride.seats !== undefined
                            ? ride.riders.length > 0
                              ? ride.riders.join(", ")
                              : "None yet"
                            : ride.rider || "TBD"}
                        </DetailValue>
                      </DetailItem>
                    </RideDetails>
                  </RideCard>
                ))}
              </RidesGrid>
            </>
          )}

          {/* Edit Modal */}
          {editModalOpen && (
            <ModalOverlay onClick={this.handleCloseModal}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <ModalTitle>Edit Ride</ModalTitle>
                </ModalHeader>

                <ModalBody>
                  <Form onSubmit={this.handleSaveEdit}>
                    <FormField>
                      <Label>Driver</Label>
                      <Select
                        name="driver"
                        value={editForm.driver}
                        onChange={this.handleFormChange}
                        disabled={loading}
                      >
                        <option value="">Select Driver</option>
                        <option value="TBD">TBD</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {this.formatUserOption(user)}
                          </option>
                        ))}
                      </Select>
                    </FormField>

                    <FormField>
                      <Label>Rider</Label>
                      <Select
                        name="riders"
                        value={editForm.riders[0] || ""}
                        onChange={this.handleFormChange}
                        disabled={loading}
                      >
                        <option value="">Select Rider</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {this.formatUserOption(user)}
                          </option>
                        ))}
                      </Select>
                    </FormField>

                    <FormField>
                      <Label>Origin</Label>
                      <Select
                        name="origin"
                        value={editForm.origin}
                        onChange={this.handleFormChange}
                        disabled={loading}
                      >
                        <option value="">Select Origin</option>
                        {this.props.places.map((place) => (
                          <option key={place._id} value={place._id}>
                            {place.text}
                          </option>
                        ))}
                      </Select>
                    </FormField>

                    <FormField>
                      <Label>Destination</Label>
                      <Select
                        name="destination"
                        value={editForm.destination}
                        onChange={this.handleFormChange}
                        disabled={loading}
                      >
                        <option value="">Select Destination</option>
                        {this.props.places.map((place) => (
                          <option key={place._id} value={place._id}>
                            {place.text}
                          </option>
                        ))}
                      </Select>
                    </FormField>

                    <FormField>
                      <Label>Date</Label>
                      <Input
                        type="date"
                        name="date"
                        value={editForm.date}
                        onChange={this.handleFormChange}
                        disabled={loading}
                      />
                    </FormField>

                    <FormField>
                      <Label>Seats</Label>
                      <Input
                        type="number"
                        name="seats"
                        value={editForm.seats}
                        onChange={this.handleFormChange}
                        disabled={loading}
                      />
                    </FormField>

                    <FormField>
                      <Label>Notes</Label>
                      <Input
                        type="text"
                        name="notes"
                        value={editForm.notes}
                        onChange={this.handleFormChange}
                        disabled={loading}
                      />
                    </FormField>

                    {error && <ErrorMessage>{error}</ErrorMessage>}
                  </Form>
                </ModalBody>

                <ModalActions>
                  <Button
                    type="button"
                    onClick={this.handleCloseModal}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={this.handleSaveEdit}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </ModalActions>
              </ModalContent>
            </ModalOverlay>
          )}
        </Content>
      </Container>
    );
  }
}

/** Require an array of Ride documents in the props. */
MobileAdminRides.propTypes = {
  rides: PropTypes.array.isRequired,
  users: PropTypes.array.isRequired,
  places: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

/** withTracker connects Meteor data to React components. */
export default withTracker(() => {
  // Get access to all Rides documents and Users for dropdowns
  const ridesSubscription = Meteor.subscribe("rides.admin");
  const usersSubscription = Meteor.subscribe("AllUsers");
  const placesSubscription = Meteor.subscribe("places.options");

  return {
    rides: Rides.find({}, { sort: { date: -1 } }).fetch(),
    users: Meteor.users.find({}).fetch(),
    places: Places.find({}).fetch(),
    ready:
      ridesSubscription.ready() &&
      usersSubscription.ready() &&
      placesSubscription.ready(),
  };
})(MobileAdminRides);
