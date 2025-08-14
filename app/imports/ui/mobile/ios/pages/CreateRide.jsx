import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import { Rides } from "../../../../api/ride/Rides";
import { Places } from "../../../../api/places/Places";
import { MobileOnly } from "../../../layouts/Devices";
import { Spacer } from "../../../components";
import { CreateRideSkeleton } from "../../../skeleton";
import {
  CreateRidePageContainer,
  CreateRideHeader,
  CreateRideHeaderTitle,
  CreateRideContent,
  Content,
  Form,
  Section,
  SectionTitle,
  Field,
  Label,
  Input,
  Select,
  Textarea,
  CharCount,
  DateTimeRow,
  FieldHalf,
  DropdownContainer,
  DropdownTrigger,
  DropdownInput,
  DropdownArrow,
  DropdownMenu,
  DropdownItem,
  SwapContainer,
  SwapButton,
  ErrorMessage,
  Actions,
  ButtonPrimary,
  Success,
  SuccessIcon,
  SuccessTitle,
  SuccessMessage,
  SuccessDetails,
  SuccessDetailItem,
} from "../styles/CreateRide";

/**
 * iOS-specific Create Ride page
 * Uses AddRides component logic adapted for page layout
 */
class CreateRide extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      origin: "",
      destination: "",
      date: "",
      time: "",
      seats: "1",
      notes: "",
      isSubmitting: false,
      error: "",
      success: false,
      showOriginDropdown: false,
      showDestinationDropdown: false,
      filteredOrigins: [],
      filteredDestinations: [],
      originSearch: "",
      destinationSearch: "",
    };
  }

  componentDidMount() {
    // Set minimum date to today
    const today = new Date();
    const minDate = today.toISOString().split("T")[0];
    this.setState({
      minDate,
      filteredOrigins: this.props.places || [],
      filteredDestinations: this.props.places || [],
    });

    // Add event listener for clicks outside dropdown
    document.addEventListener("click", this.handleOutsideClick);
  }

  componentDidUpdate(prevProps) {
    // Update places when they change
    if (prevProps.places !== this.props.places) {
      this.setState({
        filteredOrigins: this.props.places || [],
        filteredDestinations: this.props.places || [],
      });
    }
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
  }

  handleOutsideClick = (event) => {
    if (!event.target.closest(".mobile-addrides-dropdown-container")) {
      this.setState({
        showOriginDropdown: false,
        showDestinationDropdown: false,
      });
    }
  };

  handleInputChange = (field, value) => {
    this.setState({ [field]: value, error: "" });
  };

  handlePlaceSearch = (field, searchValue) => {
    const searchField =
      field === "origin" ? "originSearch" : "destinationSearch";
    const filteredField =
      field === "origin" ? "filteredOrigins" : "filteredDestinations";

    const places = this.props.places || [];
    const filtered = places.filter((place) => place.text.toLowerCase().includes(searchValue.toLowerCase()));

    this.setState({
      [searchField]: searchValue,
      [filteredField]: filtered,
    });
  };

  handlePlaceSelect = (field, place) => {
    const searchField =
      field === "origin" ? "originSearch" : "destinationSearch";
    const dropdownField =
      field === "origin" ? "showOriginDropdown" : "showDestinationDropdown";

    // Store place ID for database, but display place name for user
    this.setState({
      [field]: place._id, // Store place ID
      [searchField]: place.text, // Display place name
      [dropdownField]: false,
      error: "",
    });
  };

  toggleDropdown = (field) => {
    const dropdownField =
      field === "origin" ? "showOriginDropdown" : "showDestinationDropdown";
    const searchField =
      field === "origin" ? "originSearch" : "destinationSearch";
    const currentValue = this.state[field];

    this.setState({
      [dropdownField]: !this.state[dropdownField],
      showOriginDropdown:
        field === "origin" ? !this.state.showOriginDropdown : false,
      showDestinationDropdown:
        field === "destination" ? !this.state.showDestinationDropdown : false,
      [searchField]: currentValue,
    });
  };

  swapLocations = () => {
    const { origin, destination } = this.state;
    this.setState({
      origin: destination,
      destination: origin,
      originSearch: destination,
      destinationSearch: origin,
      error: "",
    });
  };

  validateForm = () => {
    const { origin, destination, date, time } = this.state;
    const { places } = this.props;

    if (!origin.trim()) {
      this.setState({ error: "Please select an origin location" });
      return false;
    }

    if (!destination.trim()) {
      this.setState({ error: "Please select a destination location" });
      return false;
    }

    // Validate that selected places are from available options
    const placeIds = places.map((place) => place._id);
    if (!placeIds.includes(origin)) {
      this.setState({
        error: "Please select a valid origin from the available options",
      });
      return false;
    }

    if (!placeIds.includes(destination)) {
      this.setState({
        error: "Please select a valid destination from the available options",
      });
      return false;
    }

    if (origin === destination) {
      this.setState({ error: "Origin and destination cannot be the same" });
      return false;
    }

    if (!date) {
      this.setState({ error: "Please select a date for your ride" });
      return false;
    }

    if (!time) {
      this.setState({ error: "Please select a time for your ride" });
      return false;
    }

    // Check if date/time is not in the past
    const selectedDateTime = new Date(`${date}T${time}`);
    const now = new Date();

    if (selectedDateTime <= now) {
      this.setState({ error: "Please select a future date and time" });
      return false;
    }

    return true;
  };

  handleSubmit = (e) => {
    e.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    const { origin, destination, date, time, seats, notes } = this.state;

    this.setState({ isSubmitting: true, error: "" });

    const rideData = {
      driver: Meteor.user().username,
      riders: [], // Start with empty riders array
      origin: origin.trim(),
      destination: destination.trim(),
      date: new Date(`${date}T${time}`),
      seats: parseInt(seats), // eslint-disable-line
      notes: notes.trim(),
      createdAt: new Date(),
    };

    Rides.insert(rideData, (error) => {
      this.setState({ isSubmitting: false });

      if (error) {
        this.setState({
          error: error.message || "Failed to create ride. Please try again.",
        });
      } else {
        this.setState({ success: true });

        // Redirect after showing success
        setTimeout(() => {
          this.props.history.push("/myRides");
        }, 2000);
      }
    });
  };

  getPlaceNameById = (placeId) => {
    const place = this.props.places.find((p) => p._id === placeId);
    return place ? place.text : "Unknown location";
  };

  render() {
    const { ready } = this.props;
    const {
      origin,
      destination,
      date,
      time,
      seats,
      notes,
      isSubmitting,
      error,
      success,
      minDate,
      showOriginDropdown,
      showDestinationDropdown,
      filteredOrigins,
      filteredDestinations,
      originSearch,
      destinationSearch,
    } = this.state;

    if (!ready) {
      return <CreateRideSkeleton showBackButton={true} />;
    }

    return (
      <CreateRidePageContainer>
        {/* Gradient Header */}
        <CreateRideHeader>
          <CreateRideHeaderTitle>Create Your Ride</CreateRideHeaderTitle>
        </CreateRideHeader>

        <CreateRideContent>

          <Content>
            {success ? (
              <Success>
                <SuccessIcon>✓</SuccessIcon>
                <SuccessTitle>Ride Created!</SuccessTitle>
                <SuccessMessage>
                  Your ride from {this.getPlaceNameById(origin)} to{" "}
                  {this.getPlaceNameById(destination)} has been added
                  successfully.
                </SuccessMessage>
                <SuccessDetails>
                  <SuccessDetailItem>
                    <strong>Date:</strong> {new Date(date).toLocaleDateString()}
                  </SuccessDetailItem>
                  <SuccessDetailItem>
                    <strong>Time:</strong> {time}
                  </SuccessDetailItem>
                  <SuccessDetailItem>
                    <strong>Seats:</strong> {seats}
                  </SuccessDetailItem>
                </SuccessDetails>
              </Success>
            ) : (
            <Form onSubmit={this.handleSubmit}>
              {/* Route Section */}
              <Section>
                <SectionTitle>📍 Route</SectionTitle>

                {/* Origin */}
                <Field>
                  <Label>From</Label>
                  <DropdownContainer className="mobile-addrides-dropdown-container">
                    <DropdownTrigger
                      onClick={() => this.toggleDropdown("origin")}
                    >
                      <DropdownInput
                        type="text"
                        value={originSearch}
                        onChange={(e) => this.handlePlaceSearch("origin", e.target.value)
                        }
                        placeholder="Search origin..."
                        autoComplete="off"
                      />
                      <DropdownArrow>▼</DropdownArrow>
                    </DropdownTrigger>

                    {showOriginDropdown && (
                      <DropdownMenu>
                        {filteredOrigins.length > 0 ? (
                          filteredOrigins.map((place) => (
                            <DropdownItem
                              key={place._id}
                              onClick={() => this.handlePlaceSelect("origin", place)
                              }
                            >
                              {place.text}
                            </DropdownItem>
                          ))
                        ) : (
                          <DropdownItem className="no-results">
                            No locations found
                          </DropdownItem>
                        )}
                      </DropdownMenu>
                    )}
                  </DropdownContainer>
                </Field>

                {/* Swap Button */}
                <SwapContainer>
                  <SwapButton
                    type="button"
                    onClick={this.swapLocations}
                    title="Swap locations"
                  >
                    ⇅
                  </SwapButton>
                </SwapContainer>

                {/* Destination */}
                <Field>
                  <Label>To</Label>
                  <DropdownContainer className="mobile-addrides-dropdown-container">
                    <DropdownTrigger
                      onClick={() => this.toggleDropdown("destination")}
                    >
                      <DropdownInput
                        type="text"
                        value={destinationSearch}
                        onChange={(e) => this.handlePlaceSearch(
                            "destination",
                            e.target.value,
                          )
                        }
                        placeholder="Search destination..."
                        autoComplete="off"
                      />
                      <DropdownArrow>▼</DropdownArrow>
                    </DropdownTrigger>

                    {showDestinationDropdown && (
                      <DropdownMenu>
                        {filteredDestinations.length > 0 ? (
                          filteredDestinations.map((place) => (
                            <DropdownItem
                              key={place._id}
                              onClick={() => this.handlePlaceSelect("destination", place)
                              }
                            >
                              {place.text}
                            </DropdownItem>
                          ))
                        ) : (
                          <DropdownItem className="no-results">
                            No locations found
                          </DropdownItem>
                        )}
                      </DropdownMenu>
                    )}
                  </DropdownContainer>
                </Field>
              </Section>

              {/* DateTime Section */}
              <Section>
                <SectionTitle>🕒 When</SectionTitle>

                <DateTimeRow>
                  <FieldHalf>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={date}
                      min={minDate}
                      onChange={(e) => this.handleInputChange("date", e.target.value)
                      }
                      required
                    />
                  </FieldHalf>

                  <FieldHalf>
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => this.handleInputChange("time", e.target.value)
                      }
                      required
                    />
                  </FieldHalf>
                </DateTimeRow>
              </Section>

              {/* Details Section */}
              <Section>
                <SectionTitle>👥 Details</SectionTitle>

                <Field>
                  <Label>Available Seats</Label>
                  <Select
                    value={seats}
                    onChange={(e) => this.handleInputChange("seats", e.target.value)
                    }
                  >
                    <option value="1">1 seat</option>
                    <option value="2">2 seats</option>
                    <option value="3">3 seats</option>
                    <option value="4">4 seats</option>
                    <option value="5">5 seats</option>
                    <option value="6">6 seats</option>
                    <option value="7">7 seats</option>
                  </Select>
                </Field>

                <Field>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => this.handleInputChange("notes", e.target.value)
                    }
                    placeholder="Additional details..."
                    rows="2"
                    maxLength="200"
                  />
                  <CharCount>{notes.length}/200</CharCount>
                </Field>
              </Section>

              {/* Error Display */}
              {error && <ErrorMessage>{error}</ErrorMessage>}

              {/* Action Buttons */}
              <Actions>
                <ButtonPrimary type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Ride"}
                </ButtonPrimary>
              </Actions>
            </Form>
          )}
          </Content>
        </CreateRideContent>

        <MobileOnly>
          <Spacer />
        </MobileOnly>
      </CreateRidePageContainer>
    );
  }
}

CreateRide.propTypes = {
  history: PropTypes.object.isRequired,
  places: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

export default withRouter(
  withTracker(() => {
    const placesSubscription = Meteor.subscribe("places.options");

    const places = Places.find({}, { sort: { text: 1 } }).fetch();

    return {
      places: places, // Return full place objects instead of just names
      ready: placesSubscription.ready(),
    };
  })(CreateRide),
);
