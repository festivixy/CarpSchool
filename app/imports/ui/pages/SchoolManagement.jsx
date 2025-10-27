import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import { Schools } from "../../api/schools/Schools";
import BackButton from "../mobile/components/BackButton";
import {
  Container,
  Header,
  Title,
  Subtitle,
  Content,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  Form,
  Section,
  SectionTitle,
  FormRow,
  FormGroup,
  Label,
  Input,
  Textarea,
  CheckboxGroup,
  CheckboxLabel,
  Checkbox,
  LocationSection,
  LocationGrid,
  SuccessMessage,
  ErrorMessage,
  ButtonContainer,
  SaveButton,
  CancelButton,
} from "../styles/SchoolManagement";

/**
 * SchoolManagement component for school admins to manage their own school
 */
class SchoolManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      saving: false,
      error: "",
      success: "",
      formData: null, // Will be populated from props
    };
  }

  componentDidMount() {
    this.populateFormData();
  }

  componentDidUpdate(prevProps) {
    if (this.props.schoolData && !prevProps.schoolData) {
      this.populateFormData();
    }
  }

  populateFormData = () => {
    if (this.props.schoolData && !this.state.formData) {
      const school = this.props.schoolData;
      this.setState({
        formData: {
          name: school.name || "",
          shortName: school.shortName || "",
          code: school.code || "",
          domain: school.domain || "",
          location: {
            city: school.location?.city || "",
            province: school.location?.province || "",
            country: school.location?.country || "Canada",
            address: school.location?.address || "",
            coordinates: {
              lat: school.location?.coordinates?.lat || 0,
              lng: school.location?.coordinates?.lng || 0,
            },
          },
          settings: {
            allowPublicRegistration: school.settings?.allowPublicRegistration ?? true,
            requireEmailVerification: school.settings?.requireEmailVerification ?? true,
            requireDomainMatch: school.settings?.requireDomainMatch ?? false,
            maxRideDistance: school.settings?.maxRideDistance || 50,
          },
        },
      });
    }
  };

  handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const actualValue = type === "checkbox" ? checked : value;

    if (name.includes(".")) {
      // Handle nested fields like "location.city" or "settings.allowPublicRegistration"
      const [parent, child] = name.split(".");
      this.setState((prevState) => ({
        formData: {
          ...prevState.formData,
          [parent]: {
            ...prevState.formData[parent],
            [child]: actualValue,
          },
        },
      }));
    } else if (name.includes("coordinates.")) {
      // Handle coordinates specifically
      const [, coordinate] = name.split(".");
      this.setState((prevState) => ({
        formData: {
          ...prevState.formData,
          location: {
            ...prevState.formData.location,
            coordinates: {
              ...prevState.formData.location.coordinates,
              [coordinate]: parseFloat(actualValue) || 0,
            },
          },
        },
      }));
    } else {
      this.setState((prevState) => ({
        formData: {
          ...prevState.formData,
          [name]: actualValue,
        },
      }));
    }
  };

  handleSubmit = (e) => {
    e.preventDefault();

    if (this.state.saving) return;

    // Basic validation
    if (!this.state.formData.name.trim()) {
      this.setState({ error: "School name is required" });
      return;
    }

    if (!this.state.formData.shortName.trim()) {
      this.setState({ error: "Short name is required" });
      return;
    }

    if (!this.state.formData.code.trim()) {
      this.setState({ error: "School code is required" });
      return;
    }

    this.setState({ saving: true, error: "", success: "" });

    const updateData = {
      ...this.state.formData,
      code: this.state.formData.code.toUpperCase(),
    };

    Meteor.call("schools.updateMySchool", updateData, (err, result) => {
      this.setState({ saving: false });

      if (err) {
        this.setState({ error: err.reason || "Failed to update school information" });
      } else {
        this.setState({
          success: result.message || "School information updated successfully!",
          formData: {
            ...this.state.formData,
            code: this.state.formData.code.toUpperCase(),
          },
        });

        // Clear success message after 5 seconds
        setTimeout(() => {
          this.setState({ success: "" });
        }, 5000);
      }
    });
  };

  handleCancel = () => {
    // Reset to original data from props
    this.setState({ formData: null, error: "", success: "" });
    this.populateFormData();
  };

  render() {
    const { saving, error, success, formData } = this.state;
    const { ready, schoolData } = this.props;

    if (!ready) {
      return (
        <Container>
          <BackButton />
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading school information...</LoadingText>
          </LoadingContainer>
        </Container>
      );
    }

    if (ready && !schoolData) {
      return (
        <Container>
          <BackButton />
          <Header>
            <Title>Access Denied</Title>
            <Subtitle>You don't have permission to manage school settings</Subtitle>
          </Header>
          <Content>
            <ErrorMessage>
              Only school administrators can access school management settings.
              Please contact a system administrator if you believe this is an error.
            </ErrorMessage>
          </Content>
        </Container>
      );
    }

    if (!formData) {
      return (
        <Container>
          <BackButton />
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Preparing school information...</LoadingText>
          </LoadingContainer>
        </Container>
      );
    }

    return (
      <Container>
        <BackButton />
        <Header>
          <Title>School Management</Title>
          <Subtitle>Manage your school's information and settings</Subtitle>
        </Header>

        <Content>
          <Form onSubmit={this.handleSubmit}>
            {/* Basic Information */}
            <Section>
              <SectionTitle>Basic Information</SectionTitle>

              <FormRow>
                <FormGroup>
                  <Label>School Name *</Label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={this.handleInputChange}
                    placeholder="e.g., Simon Fraser University"
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Short Name *</Label>
                  <Input
                    type="text"
                    name="shortName"
                    value={formData.shortName}
                    onChange={this.handleInputChange}
                    placeholder="e.g., SFU"
                    maxLength="20"
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>School Code *</Label>
                  <Input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={this.handleInputChange}
                    placeholder="e.g., SFU"
                    maxLength="10"
                    style={{ textTransform: "uppercase" }}
                    required
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Email Domain</Label>
                  <Input
                    type="text"
                    name="domain"
                    value={formData.domain}
                    onChange={this.handleInputChange}
                    placeholder="e.g., sfu.ca"
                  />
                </FormGroup>
              </FormRow>
            </Section>

            {/* Location Information */}
            <Section>
              <SectionTitle>Location Information</SectionTitle>

              <LocationSection>
                <LocationGrid>
                  <FormGroup>
                    <Label>City</Label>
                    <Input
                      type="text"
                      name="location.city"
                      value={formData.location.city}
                      onChange={this.handleInputChange}
                      placeholder="e.g., Burnaby"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Province/State</Label>
                    <Input
                      type="text"
                      name="location.province"
                      value={formData.location.province}
                      onChange={this.handleInputChange}
                      placeholder="e.g., British Columbia"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Country</Label>
                    <Input
                      type="text"
                      name="location.country"
                      value={formData.location.country}
                      onChange={this.handleInputChange}
                      placeholder="e.g., Canada"
                    />
                  </FormGroup>
                </LocationGrid>

                <FormGroup>
                  <Label>Address</Label>
                  <Textarea
                    name="location.address"
                    value={formData.location.address}
                    onChange={this.handleInputChange}
                    placeholder="Full school address"
                    rows="3"
                  />
                </FormGroup>

                <LocationGrid>
                  <FormGroup>
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      name="coordinates.lat"
                      value={formData.location.coordinates.lat}
                      onChange={this.handleInputChange}
                      placeholder="e.g., 49.2781"
                      step="any"
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      name="coordinates.lng"
                      value={formData.location.coordinates.lng}
                      onChange={this.handleInputChange}
                      placeholder="e.g., -122.9199"
                      step="any"
                    />
                  </FormGroup>
                </LocationGrid>
              </LocationSection>
            </Section>

            {/* Registration Settings */}
            <Section>
              <SectionTitle>Registration & Verification Settings</SectionTitle>

              <CheckboxGroup>
                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    name="settings.allowPublicRegistration"
                    checked={formData.settings.allowPublicRegistration}
                    onChange={this.handleInputChange}
                  />
                  Allow Public Registration
                  <span style={{ fontSize: "14px", color: "#666", display: "block" }}>
                    Allow new users to register and join this school
                  </span>
                </CheckboxLabel>

                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    name="settings.requireEmailVerification"
                    checked={formData.settings.requireEmailVerification}
                    onChange={this.handleInputChange}
                  />
                  Require Email Verification
                  <span style={{ fontSize: "14px", color: "#666", display: "block" }}>
                    Users must verify their email before accessing the platform
                  </span>
                </CheckboxLabel>

                <CheckboxLabel>
                  <Checkbox
                    type="checkbox"
                    name="settings.requireDomainMatch"
                    checked={formData.settings.requireDomainMatch}
                    onChange={this.handleInputChange}
                  />
                  Require Email Domain Match
                  <span style={{ fontSize: "14px", color: "#666", display: "block" }}>
                    Users must use an email from the school domain to register
                  </span>
                </CheckboxLabel>
              </CheckboxGroup>

              <FormGroup style={{ marginTop: "20px" }}>
                <Label>Maximum Ride Distance (km)</Label>
                <Input
                  type="number"
                  name="settings.maxRideDistance"
                  value={formData.settings.maxRideDistance}
                  onChange={this.handleInputChange}
                  min="1"
                  max="500"
                  placeholder="50"
                />
              </FormGroup>
            </Section>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <ButtonContainer>
              <CancelButton type="button" onClick={this.handleCancel} disabled={saving}>
                Cancel Changes
              </CancelButton>

              <SaveButton type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </SaveButton>
            </ButtonContainer>
          </Form>
        </Content>
      </Container>
    );
  }
}

SchoolManagement.propTypes = {
  schoolData: PropTypes.object,
  ready: PropTypes.bool.isRequired,
};

export default withTracker(() => {
  const subscription = Meteor.subscribe("schools.mySchool");
  const user = Meteor.user();
  const schoolData = user?.schoolId ? Schools.findOne(user.schoolId) : null;

  return {
    ready: subscription.ready(),
    schoolData: schoolData,
  };
})(SchoolManagement);
