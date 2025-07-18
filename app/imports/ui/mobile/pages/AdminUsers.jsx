import React from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import swal from "sweetalert";
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
  UsersGrid,
  UserCard,
  UserHeader,
  UserInfo,
  UserName,
  UserUsername,
  ActionButtons,
  ActionButton,
  UserDetails,
  DetailItem,
  DetailLabel,
  DetailValue,
  AdminBadge,
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
  Button,
  ErrorMessage,
} from "../styles/AdminUsers";

/**
 * Modern mobile AdminUsers component for managing all users
 */
class MobileAdminUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editModalOpen: false,
      editingUser: null,
      editForm: {
        username: "",
        firstName: "",
        lastName: "",
        email: "",
      },
      loading: false,
      error: "",
      searchQuery: "",
    };
  }

  handleDelete = (userId) => {
    if (userId === Meteor.userId()) {
      swal("Error", "You cannot delete your own account!", "error");
      return;
    }

    swal({
      title: "Delete User?",
      text: "This action cannot be undone. The user account will be permanently deleted.",
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
        Meteor.call("users.remove", userId, (error) => {
          this.setState({ loading: false });
          if (error) {
            this.setState({ error: error.message });
            swal("Error", error.message, "error");
          } else {
            swal(
              "Deleted!",
              "The user has been successfully deleted.",
              "success",
            );
          }
        });
      }
    });
  };

  handleEdit = (user) => {
    this.setState({
      editModalOpen: true,
      editingUser: user,
      editForm: {
        username: user.username || "",
        firstName: user.profile?.firstName || "",
        lastName: user.profile?.lastName || "",
        email: user.emails?.[0]?.address || "",
      },
      error: "",
    });
  };

  handleFormChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      editForm: { ...this.state.editForm, [name]: value },
    });
  };

  handleSaveEdit = (e) => {
    e.preventDefault();
    const { editingUser, editForm } = this.state;

    this.setState({ loading: true, error: "" });

    Meteor.call("users.update", editingUser._id, editForm, (error) => {
      this.setState({ loading: false });
      if (error) {
        this.setState({ error: error.message });
      } else {
        swal("Success!", "The user has been successfully updated.", "success");
        this.setState({ editModalOpen: false, editingUser: null, error: "" });
      }
    });
  };

  handleCloseModal = () => {
    this.setState({
      editModalOpen: false,
      editingUser: null,
      error: "",
    });
  };

  toggleAdminRole = (userId, isCurrentlyAdmin) => {
    if (userId === Meteor.userId()) {
      swal("Error", "You cannot modify your own admin role!", "error");
      return;
    }

    const action = isCurrentlyAdmin ? "remove" : "add";
    const actionText = isCurrentlyAdmin
      ? "remove admin role from"
      : "grant admin role to";

    swal({
      title: "Change Admin Role?",
      text: `This will ${actionText} this user.`,
      icon: "warning",
      buttons: {
        cancel: {
          text: "Cancel",
          visible: true,
          className: "swal-button--cancel",
        },
        confirm: {
          text: isCurrentlyAdmin ? "Remove Admin" : "Make Admin",
          className: isCurrentlyAdmin
            ? "swal-button--danger"
            : "swal-button--confirm",
        },
      },
    }).then((willProceed) => {
      if (willProceed) {
        this.setState({ loading: true, error: "" });
        Meteor.call("users.toggleAdmin", userId, action, (error) => {
          this.setState({ loading: false });
          if (error) {
            this.setState({ error: error.message });
            swal("Error", error.message, "error");
          } else {
            swal("Success!", `Admin role ${action}ed successfully.`, "success");
          }
        });
      }
    });
  };

  handleSearchChange = (e) => {
    this.setState({ searchQuery: e.target.value });
  };

  filterUsers = (users) => {
    const { searchQuery } = this.state;
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        (user.username && user.username.toLowerCase().includes(query)) ||
        (user.profile?.firstName &&
          user.profile.firstName.toLowerCase().includes(query)) ||
        (user.profile?.lastName &&
          user.profile.lastName.toLowerCase().includes(query)) ||
        (user.emails?.[0]?.address &&
          user.emails[0].address.toLowerCase().includes(query)) ||
        (user.roles && user.roles.includes("admin") && "admin".includes(query)),
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
            <TitleIcon>👥</TitleIcon>
            Manage Users
          </Title>
        </Header>
        <Content>
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Loading users data...</LoadingText>
          </LoadingContainer>
        </Content>
      </Container>
    );
  }

  /** Render the page once subscriptions have been received. */
  renderPage() {
    const { editModalOpen, editForm, loading, error, searchQuery } = this.state;
    const { users } = this.props;
    const filteredUsers = this.filterUsers(users);

    return (
      <Container>
        <Header>
          <Title>
            <TitleIcon>👥</TitleIcon>
            Manage Users
          </Title>
        </Header>

        <Content>
          <SearchContainer>
            <SearchIcon>🔍</SearchIcon>
            <SearchInput
              type="text"
              placeholder="Search users by name, username, email, or role..."
              value={searchQuery}
              onChange={this.handleSearchChange}
            />
          </SearchContainer>

          {users.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>👤</EmptyStateIcon>
              <EmptyStateTitle>No users found</EmptyStateTitle>
              <EmptyStateText>
                No user data is available. This could indicate a data loading
                issue.
              </EmptyStateText>
            </EmptyState>
          ) : filteredUsers.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>🔍</EmptyStateIcon>
              <EmptyStateTitle>No matching users</EmptyStateTitle>
              <EmptyStateText>
                No users match your search criteria. Try adjusting your search
                terms.
              </EmptyStateText>
            </EmptyState>
          ) : (
            <>
              <SearchResultsCount>
                {searchQuery.trim()
                  ? `${filteredUsers.length} of ${users.length} users`
                  : `${users.length} users`}
              </SearchResultsCount>
              <UsersGrid>
                {filteredUsers.map((user) => {
                  const isAdmin = user.roles && user.roles.includes("admin");
                  const isCurrentUser = user._id === Meteor.userId();
                  const fullName =
                    `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim();

                  return (
                    <UserCard key={user._id}>
                      <UserHeader>
                        <UserInfo>
                          <UserName>
                            {fullName || "No name set"}
                            {isCurrentUser && " (You)"}
                          </UserName>
                          <UserUsername>@{user.username}</UserUsername>
                          <AdminBadge isAdmin={isAdmin}>
                            {isAdmin ? "✅ Admin" : "👤 User"}
                          </AdminBadge>
                        </UserInfo>
                        <ActionButtons>
                          <ActionButton
                            onClick={() => this.handleEdit(user)}
                            disabled={loading}
                            title="Edit user"
                          >
                            ✏️
                          </ActionButton>
                          <ActionButton
                            variant={isAdmin ? "remove-admin" : "admin"}
                            onClick={() =>
                              this.toggleAdminRole(user._id, isAdmin)
                            }
                            disabled={loading || isCurrentUser}
                            title={
                              isAdmin ? "Remove admin role" : "Grant admin role"
                            }
                          >
                            {isAdmin ? "⬇️" : "⬆️"}
                          </ActionButton>
                          <ActionButton
                            variant="delete"
                            onClick={() => this.handleDelete(user._id)}
                            disabled={loading || isCurrentUser}
                            title="Delete user"
                          >
                            🗑️
                          </ActionButton>
                        </ActionButtons>
                      </UserHeader>

                      <UserDetails>
                        <DetailItem>
                          <DetailLabel>Email</DetailLabel>
                          <DetailValue>
                            {user.emails?.[0]?.address || "No email"}
                          </DetailValue>
                        </DetailItem>
                        <DetailItem>
                          <DetailLabel>Created</DetailLabel>
                          <DetailValue>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  },
                                )
                              : "Unknown"}
                          </DetailValue>
                        </DetailItem>
                      </UserDetails>
                    </UserCard>
                  );
                })}
              </UsersGrid>
            </>
          )}

          {/* Edit Modal */}
          {editModalOpen && (
            <ModalOverlay onClick={this.handleCloseModal}>
              <ModalContent onClick={(e) => e.stopPropagation()}>
                <ModalHeader>
                  <ModalTitle>Edit User</ModalTitle>
                </ModalHeader>

                <ModalBody>
                  <Form onSubmit={this.handleSaveEdit}>
                    <FormField>
                      <Label>Username</Label>
                      <Input
                        type="text"
                        name="username"
                        value={editForm.username}
                        onChange={this.handleFormChange}
                        disabled={loading}
                        placeholder="Enter username"
                      />
                    </FormField>

                    <FormField>
                      <Label>First Name</Label>
                      <Input
                        type="text"
                        name="firstName"
                        value={editForm.firstName}
                        onChange={this.handleFormChange}
                        disabled={loading}
                        placeholder="Enter first name"
                      />
                    </FormField>

                    <FormField>
                      <Label>Last Name</Label>
                      <Input
                        type="text"
                        name="lastName"
                        value={editForm.lastName}
                        onChange={this.handleFormChange}
                        disabled={loading}
                        placeholder="Enter last name"
                      />
                    </FormField>

                    <FormField>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={this.handleFormChange}
                        disabled={loading}
                        placeholder="Enter email address"
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

/** Require an array of User documents in the props. */
MobileAdminUsers.propTypes = {
  users: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

/** withTracker connects Meteor data to React components. */
export default withTracker(() => {
  // Get access to all Users documents (admin view)
  const subscription = Meteor.subscribe("AllUsers");
  return {
    users: Meteor.users.find({}, { sort: { createdAt: -1 } }).fetch(),
    ready: subscription.ready(),
  };
})(MobileAdminUsers);
