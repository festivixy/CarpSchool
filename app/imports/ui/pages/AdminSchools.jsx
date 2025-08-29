import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import swal from "sweetalert";
import { Schools } from "../../api/schools/Schools";
import {
  Container,
  Header,
  Title,
  TitleIcon,
  Subtitle,
  Content,
  TopActions,
  SearchContainer,
  SearchInput,
  SearchIcon,
  CreateButton,
  SearchResultsCount,
  LoadingContainer,
  LoadingSpinner,
  LoadingText,
  EmptyState,
  EmptyStateIcon,
  EmptyStateTitle,
  EmptyStateText,
  SchoolsGrid,
  SchoolCard,
  SchoolHeader,
  SchoolInfo,
  SchoolName,
  SchoolCode,
  ActionButtons,
  ActionButton,
  SchoolDetails,
  DetailItem,
  DetailLabel,
  DetailValue,
  BadgeContainer,
  StatusBadge,
  UserCountBadge,
  DomainBadge,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalActions,
  Form,
  FormField,
  FormRow,
  Label,
  Input,
  SwitchContainer,
  SwitchLabel,
  Switch,
  SwitchInput,
  SwitchSlider,
  Button,
  ErrorMessage,
  StatusMessage,
} from "../styles/AdminSchools";
import BackButton from "../mobile/components/BackButton";
import InteractiveMapPicker from "../mobile/components/InteractiveMapPicker";

/**
 * AdminSchools component for managing schools (System admins only)
 */
class AdminSchools extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      createModalOpen: false,
      editModalOpen: false,
      editingSchool: null,
      createForm: this.getInitialCreateForm(),
      editForm: {},
      loading: false,
      error: "",
      searchQuery: "",
      statusMessage: "",
      statusType: "",
    };
  }

  getInitialCreateForm = () => ({
    name: "",
    shortName: "",
    code: "",
    domain: "",
    selectedLocation: null,
    allowRegistration: true,
    requireEmailVerification: true,
  });

  handleCreateClick = () => {
    this.setState({
      createModalOpen: true,
      createForm: this.getInitialCreateForm(),
      error: "",
    });
  };

  handleEdit = (school) => {
    this.setState({
      editModalOpen: true,
      editingSchool: school,
      editForm: {
        name: school.name || "",
        shortName: school.shortName || "",
        code: school.code || "",
        domain: school.domain || "",
        selectedLocation: school.location?.coordinates || null,
        allowRegistration: school.settings?.allowRegistration ?? true,
        requireEmailVerification: school.settings?.requireEmailVerification ?? true,
      },
      error: "",
    });
  };

  handleDeactivate = (school) => {
    const actionText = school.isActive ? "deactivate" : "reactivate";

    swal({
      title: `${actionText.charAt(0).toUpperCase() + actionText.slice(1)} School?`,
      text: school.isActive
        ? `This will deactivate ${school.name}. Users won't be able to register and existing rides will be affected.`
        : `This will reactivate ${school.name} and allow new registrations.`,
      icon: "warning",
      buttons: {
        cancel: {
          text: "Cancel",
          visible: true,
          className: "swal-button--cancel",
        },
        confirm: {
          text: actionText.charAt(0).toUpperCase() + actionText.slice(1),
          className: school.isActive ? "swal-button--danger" : "swal-button--confirm",
        },
      },
      dangerMode: school.isActive,
    }).then((willProceed) => {
      if (willProceed) {
        this.setState({ loading: true, error: "" });

        if (school.isActive) {
          Meteor.call("schools.deactivate", school._id, (error) => {
            this.setState({ loading: false });
            if (error) {
              this.setState({ error: error.message });
              swal("Error", error.message, "error");
            } else {
              swal("Deactivated!", `${school.name} has been deactivated.`, "success");
            }
          });
        } else {
          // Reactivate school (update isActive to true)
          Meteor.call("schools.update", school._id, { isActive: true }, (error) => {
            this.setState({ loading: false });
            if (error) {
              this.setState({ error: error.message });
              swal("Error", error.message, "error");
            } else {
              swal("Reactivated!", `${school.name} has been reactivated.`, "success");
            }
          });
        }
      }
    });
  };

  handleCreateFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    this.setState({
      createForm: { ...this.state.createForm, [name]: newValue },
    });
  };

  handleEditFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    this.setState({
      editForm: { ...this.state.editForm, [name]: newValue },
    });
  };

  handleCreateLocationSelect = (location) => {
    this.setState({
      createForm: { ...this.state.createForm, selectedLocation: location },
    });
  };

  handleEditLocationSelect = (location) => {
    this.setState({
      editForm: { ...this.state.editForm, selectedLocation: location },
    });
  };

  handleCreateSubmit = (e) => {
    e.preventDefault();
    const { createForm } = this.state;

    // Validation
    if (!createForm.name.trim()) {
      this.setState({ error: "School name is required" });
      return;
    }
    if (!createForm.code.trim()) {
      this.setState({ error: "School code is required" });
      return;
    }

    this.setState({ loading: true, error: "" });

    const schoolData = {
      name: createForm.name.trim(),
      shortName: createForm.shortName.trim() || createForm.name.trim(),
      code: createForm.code.trim().toUpperCase(),
      domain: createForm.domain.trim() || undefined,
      location: createForm.selectedLocation ? {
        coordinates: {
          lat: createForm.selectedLocation.lat,
          lng: createForm.selectedLocation.lng,
        },
      } : undefined,
      settings: {
        allowRegistration: createForm.allowRegistration,
        requireEmailVerification: createForm.requireEmailVerification,
      },
    };

    Meteor.call("schools.create", schoolData, (error, _schoolId) => {
      this.setState({ loading: false });
      if (error) {
        this.setState({ error: error.message });
      } else {
        swal("Success!", `${schoolData.name} has been created successfully.`, "success");
        this.setState({
          createModalOpen: false,
          createForm: this.getInitialCreateForm(),
          statusMessage: `School "${schoolData.name}" created successfully!`,
          statusType: "success",
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.setState({ statusMessage: "", statusType: "" });
        }, 3000);
      }
    });
  };

  handleEditSubmit = (e) => {
    e.preventDefault();
    const { editForm, editingSchool } = this.state;

    // Validation
    if (!editForm.name.trim()) {
      this.setState({ error: "School name is required" });
      return;
    }
    if (!editForm.code.trim()) {
      this.setState({ error: "School code is required" });
      return;
    }

    this.setState({ loading: true, error: "" });

    const updateData = {
      name: editForm.name.trim(),
      shortName: editForm.shortName.trim() || editForm.name.trim(),
      code: editForm.code.trim().toUpperCase(),
      domain: editForm.domain.trim() || undefined,
      location: editForm.selectedLocation ? {
        coordinates: {
          lat: editForm.selectedLocation.lat,
          lng: editForm.selectedLocation.lng,
        },
      } : editingSchool.location,
      settings: {
        allowRegistration: editForm.allowRegistration,
        requireEmailVerification: editForm.requireEmailVerification,
      },
    };

    Meteor.call("schools.update", editingSchool._id, updateData, (error) => {
      this.setState({ loading: false });
      if (error) {
        this.setState({ error: error.message });
      } else {
        swal("Success!", `${updateData.name} has been updated successfully.`, "success");
        this.setState({
          editModalOpen: false,
          editingSchool: null,
          statusMessage: `School "${updateData.name}" updated successfully!`,
          statusType: "success",
        });

        // Clear success message after 3 seconds
        setTimeout(() => {
          this.setState({ statusMessage: "", statusType: "" });
        }, 3000);
      }
    });
  };

  handleCloseModals = () => {
    this.setState({
      createModalOpen: false,
      editModalOpen: false,
      editingSchool: null,
      error: "",
    });
  };

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value });
  };

  filterSchools = (schools) => {
    const { searchQuery } = this.state;
    if (!searchQuery.trim()) return schools;

    const query = searchQuery.toLowerCase();
    return schools.filter((school) => (
        (school.name && school.name.toLowerCase().includes(query)) ||
        (school.shortName && school.shortName.toLowerCase().includes(query)) ||
        (school.code && school.code.toLowerCase().includes(query)) ||
        (school.domain && school.domain.toLowerCase().includes(query))
      ));
  };

  getUserCount = (schoolId) => {
    const { userCounts } = this.props;
    return userCounts[schoolId] || 0;
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
            <TitleIcon>🏫</TitleIcon>
            Manage Schools
          </Title>
        </Header>
        <Content>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading schools data...</LoadingText>
          </LoadingContainer>
        </Content>
      </Container>
    );
  }

  /** Render the page once subscriptions have been received. */
  renderPage() {
    const { schools, hasPermission } = this.props;
    const { searchQuery, statusMessage, statusType } = this.state;

    if (!hasPermission) {
      return (
        <Container>
          <Header>
            <Title>
              <TitleIcon>🏫</TitleIcon>
              Manage Schools
            </Title>
            <Subtitle>You need system administrator permissions to access this page.</Subtitle>
          </Header>
        </Container>
      );
    }

    const filteredSchools = this.filterSchools(schools);

    return (
      <Container>
        <BackButton />
        <Header>
          <Title>
            <TitleIcon>🏫</TitleIcon>
            Manage Schools
          </Title>
          <Subtitle>Create and manage school organizations</Subtitle>
        </Header>

        <Content>
          {statusMessage && (
            <StatusMessage type={statusType}>
              {statusMessage}
            </StatusMessage>
          )}

          <TopActions>
            <SearchContainer>
              <SearchIcon>🔍</SearchIcon>
              <SearchInput
                type="text"
                placeholder="Search schools by name, code, or domain..."
                value={searchQuery}
                onChange={this.handleSearchChange}
              />
            </SearchContainer>
            <CreateButton onClick={this.handleCreateClick}>
              ➕ Create School
            </CreateButton>
          </TopActions>

          {schools.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>🏫</EmptyStateIcon>
              <EmptyStateTitle>No schools found</EmptyStateTitle>
              <EmptyStateText>
                No schools have been created yet. Create the first school to get started.
              </EmptyStateText>
            </EmptyState>
          ) : filteredSchools.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>🔍</EmptyStateIcon>
              <EmptyStateTitle>No matching schools</EmptyStateTitle>
              <EmptyStateText>
                No schools match your search criteria. Try adjusting your search terms.
              </EmptyStateText>
            </EmptyState>
          ) : (
            <>
              <SearchResultsCount>
                {searchQuery.trim()
                  ? `${filteredSchools.length} of ${schools.length} schools`
                  : `${schools.length} schools`}
              </SearchResultsCount>
              <SchoolsGrid>
                {filteredSchools.map((school) => {
                  const userCount = this.getUserCount(school._id);

                  return (
                    <SchoolCard key={school._id}>
                      <SchoolHeader>
                        <SchoolInfo>
                          <SchoolName>{school.name}</SchoolName>
                          <SchoolCode>{school.code}</SchoolCode>
                          <BadgeContainer>
                            <StatusBadge isActive={school.isActive}>
                              {school.isActive ? "✅ Active" : "❌ Inactive"}
                            </StatusBadge>
                            <UserCountBadge>
                              👥 {userCount} users
                            </UserCountBadge>
                            {school.domain && (
                              <DomainBadge>
                                🌐 {school.domain}
                              </DomainBadge>
                            )}
                          </BadgeContainer>
                        </SchoolInfo>
                        <ActionButtons>
                          <ActionButton
                            variant="edit"
                            onClick={() => this.handleEdit(school)}
                            disabled={this.state.loading}
                            title="Edit school"
                          >
                            ✏️
                          </ActionButton>
                          <ActionButton
                            variant={school.isActive ? "deactivate" : "activate"}
                            onClick={() => this.handleDeactivate(school)}
                            disabled={this.state.loading}
                            title={school.isActive ? "Deactivate school" : "Reactivate school"}
                          >
                            {school.isActive ? "🔴" : "🟢"}
                          </ActionButton>
                        </ActionButtons>
                      </SchoolHeader>

                      <SchoolDetails>
                        <DetailItem>
                          <DetailLabel>Short Name</DetailLabel>
                          <DetailValue>{school.shortName || "Not set"}</DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Registration</DetailLabel>
                          <DetailValue>
                            {school.settings?.allowRegistration ? "Open" : "Closed"}
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Location</DetailLabel>
                          <DetailValue>
                            {school.location?.coordinates
                              ? `${school.location.coordinates.lat.toFixed(4)}, ` +
                              `${school.location.coordinates.lng.toFixed(4)}`
                              : "Not set"
                            }
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Email Verification</DetailLabel>
                          <DetailValue>
                            {school.settings?.requireEmailVerification ? "Required" : "Optional"}
                          </DetailValue>
                        </DetailItem>
                      </SchoolDetails>
                    </SchoolCard>
                  );
                })}
              </SchoolsGrid>
            </>
          )}

          {/* Create School Modal */}
          {this.state.createModalOpen && (
            <ModalOverlay onClick={this.handleCloseModals}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <ModalTitle>Create New School</ModalTitle>
                </ModalHeader>

                <ModalBody>
                  <Form onSubmit={this.handleCreateSubmit}>
                    <FormRow>
                      <FormField>
                        <Label htmlFor="name">School Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          value={this.state.createForm.name}
                          onChange={this.handleCreateFormChange}
                          placeholder="Lincoln High School"
                          disabled={this.state.loading}
                        />
                      </FormField>
                      <FormField>
                        <Label htmlFor="shortName">Short Name</Label>
                        <Input
                          id="shortName"
                          name="shortName"
                          type="text"
                          value={this.state.createForm.shortName}
                          onChange={this.handleCreateFormChange}
                          placeholder="Lincoln HS"
                          disabled={this.state.loading}
                        />
                      </FormField>
                    </FormRow>

                    <FormRow>
                      <FormField>
                        <Label htmlFor="code">School Code *</Label>
                        <Input
                          id="code"
                          name="code"
                          type="text"
                          value={this.state.createForm.code}
                          onChange={this.handleCreateFormChange}
                          placeholder="LHS"
                          disabled={this.state.loading}
                          style={{ textTransform: "uppercase" }}
                        />
                      </FormField>
                      <FormField>
                        <Label htmlFor="domain">Email Domain</Label>
                        <Input
                          id="domain"
                          name="domain"
                          type="text"
                          value={this.state.createForm.domain}
                          onChange={this.handleCreateFormChange}
                          placeholder="lincoln.edu"
                          disabled={this.state.loading}
                        />
                      </FormField>
                    </FormRow>

                    <FormField>
                      <Label>School Location</Label>
                      <InteractiveMapPicker
                        onLocationSelect={this.handleCreateLocationSelect}
                        selectedLocation={this.state.createForm.selectedLocation}
                        height="300px"
                        initialLat={49.345196}
                        initialLng={-123.149805}
                      />
                    </FormField>

                    <FormRow>
                      <FormField>
                        <Label>Registration Settings</Label>
                        <SwitchContainer>
                          <SwitchLabel>
                            Allow new registrations
                          </SwitchLabel>
                          <Switch disabled={this.state.loading}>
                            <SwitchInput
                              name="allowRegistration"
                              checked={this.state.createForm.allowRegistration}
                              onChange={this.handleCreateFormChange}
                              disabled={this.state.loading}
                            />
                            <SwitchSlider />
                          </Switch>
                        </SwitchContainer>
                      </FormField>
                      <FormField>
                        <Label>Email Verification</Label>
                        <SwitchContainer>
                          <SwitchLabel>
                            Require email verification
                          </SwitchLabel>
                          <Switch disabled={this.state.loading}>
                            <SwitchInput
                              name="requireEmailVerification"
                              checked={this.state.createForm.requireEmailVerification}
                              onChange={this.handleCreateFormChange}
                              disabled={this.state.loading}
                            />
                            <SwitchSlider />
                          </Switch>
                        </SwitchContainer>
                      </FormField>
                    </FormRow>

                    {this.state.error && (
                      <ErrorMessage>{this.state.error}</ErrorMessage>
                    )}
                  </Form>
                </ModalBody>

                <ModalActions>
                  <Button
                    type="button"
                    onClick={this.handleCloseModals}
                    disabled={this.state.loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={this.handleCreateSubmit}
                    disabled={this.state.loading}
                  >
                    {this.state.loading ? "Creating..." : "Create School"}
                  </Button>
                </ModalActions>
              </ModalContent>
            </ModalOverlay>
          )}

          {/* Edit School Modal */}
          {this.state.editModalOpen && this.state.editingSchool && (
            <ModalOverlay onClick={this.handleCloseModals}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <ModalTitle>Edit School</ModalTitle>
                </ModalHeader>

                <ModalBody>
                  <Form onSubmit={this.handleEditSubmit}>
                    <FormRow>
                      <FormField>
                        <Label htmlFor="editName">School Name *</Label>
                        <Input
                          id="editName"
                          name="name"
                          type="text"
                          value={this.state.editForm.name}
                          onChange={this.handleEditFormChange}
                          placeholder="Lincoln High School"
                          disabled={this.state.loading}
                        />
                      </FormField>
                      <FormField>
                        <Label htmlFor="editShortName">Short Name</Label>
                        <Input
                          id="editShortName"
                          name="shortName"
                          type="text"
                          value={this.state.editForm.shortName}
                          onChange={this.handleEditFormChange}
                          placeholder="Lincoln HS"
                          disabled={this.state.loading}
                        />
                      </FormField>
                    </FormRow>

                    <FormRow>
                      <FormField>
                        <Label htmlFor="editCode">School Code *</Label>
                        <Input
                          id="editCode"
                          name="code"
                          type="text"
                          value={this.state.editForm.code}
                          onChange={this.handleEditFormChange}
                          placeholder="LHS"
                          disabled={this.state.loading}
                          style={{ textTransform: "uppercase" }}
                        />
                      </FormField>
                      <FormField>
                        <Label htmlFor="editDomain">Email Domain</Label>
                        <Input
                          id="editDomain"
                          name="domain"
                          type="text"
                          value={this.state.editForm.domain}
                          onChange={this.handleEditFormChange}
                          placeholder="lincoln.edu"
                          disabled={this.state.loading}
                        />
                      </FormField>
                    </FormRow>

                    <FormField>
                      <Label>School Location</Label>
                      <InteractiveMapPicker
                        onLocationSelect={this.handleEditLocationSelect}
                        selectedLocation={this.state.editForm.selectedLocation}
                        height="300px"
                        initialLat={this.state.editingSchool?.location?.coordinates?.lat || 49.345196}
                        initialLng={this.state.editingSchool?.location?.coordinates?.lng || -123.149805}
                      />
                    </FormField>

                    <FormRow>
                      <FormField>
                        <Label>Registration Settings</Label>
                        <SwitchContainer>
                          <SwitchLabel>
                            Allow new registrations
                          </SwitchLabel>
                          <Switch disabled={this.state.loading}>
                            <SwitchInput
                              name="allowRegistration"
                              checked={this.state.editForm.allowRegistration}
                              onChange={this.handleEditFormChange}
                              disabled={this.state.loading}
                            />
                            <SwitchSlider />
                          </Switch>
                        </SwitchContainer>
                      </FormField>
                      <FormField>
                        <Label>Email Verification</Label>
                        <SwitchContainer>
                          <SwitchLabel>
                            Require email verification
                          </SwitchLabel>
                          <Switch disabled={this.state.loading}>
                            <SwitchInput
                              name="requireEmailVerification"
                              checked={this.state.editForm.requireEmailVerification}
                              onChange={this.handleEditFormChange}
                              disabled={this.state.loading}
                            />
                            <SwitchSlider />
                          </Switch>
                        </SwitchContainer>
                      </FormField>
                    </FormRow>

                    {this.state.error && (
                      <ErrorMessage>{this.state.error}</ErrorMessage>
                    )}
                  </Form>
                </ModalBody>

                <ModalActions>
                  <Button
                    type="button"
                    onClick={this.handleCloseModals}
                    disabled={this.state.loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={this.handleEditSubmit}
                    disabled={this.state.loading}
                  >
                    {this.state.loading ? "Saving..." : "Save Changes"}
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

/** Require props */
AdminSchools.propTypes = {
  schools: PropTypes.array.isRequired,
  userCounts: PropTypes.object.isRequired,
  ready: PropTypes.bool.isRequired,
  hasPermission: PropTypes.bool.isRequired,
};

/** withTracker connects Meteor data to React components. */
export default withTracker(() => {
  // Get access to all schools (admin only)
  const schoolsSubscription = Meteor.subscribe("schools.all");
  const usersSubscription = Meteor.subscribe("AllUsers");

  // Check if user has system permission
  const currentUser = Meteor.user();
  const hasPermission = currentUser && currentUser.roles &&
    currentUser.roles.includes("system");

  // Get schools data
  const schools = Schools.find({}, { sort: { name: 1 } }).fetch();

  // Count users by school
  const userCounts = {};
  if (usersSubscription.ready()) {
    schools.forEach(school => {
      const count = Meteor.users.find({ schoolId: school._id }).count();
      userCounts[school._id] = count;
    });
  }

  return {
    schools,
    userCounts,
    ready: schoolsSubscription.ready() && usersSubscription.ready(),
    hasPermission,
  };
})(AdminSchools);
