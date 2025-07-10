import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Container, Table, Header, Loader, Button, Icon, Modal, Form } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import swal from 'sweetalert';

/** Admin page for managing all users */
class AdminUsers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editModalOpen: false,
      editingUser: null,
      editForm: {
        username: '',
        firstName: '',
        lastName: '',
        email: ''
      }
    };
  }

  handleDelete = (userId) => {
    swal({
      title: 'Are you sure?',
      text: 'Once deleted, you will not be able to recover this user account!',
      icon: 'warning',
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        Meteor.call('users.remove', userId, (error) => {
          if (error) {
            swal('Error', error.message, 'error');
          } else {
            swal('Deleted!', 'The user has been deleted.', 'success');
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
        username: user.username || '',
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        email: user.emails?.[0]?.address || ''
      }
    });
  };

  handleFormChange = (e, { name, value }) => {
    this.setState({
      editForm: { ...this.state.editForm, [name]: value }
    });
  };

  handleSaveEdit = () => {
    const { editingUser, editForm } = this.state;
    Meteor.call('users.update', editingUser._id, editForm, (error) => {
      if (error) {
        swal('Error', error.message, 'error');
      } else {
        swal('Success!', 'The user has been updated.', 'success');
        this.setState({ editModalOpen: false, editingUser: null });
      }
    });
  };

  toggleAdminRole = (userId, isCurrentlyAdmin) => {
    const action = isCurrentlyAdmin ? 'remove' : 'add';
    const actionText = isCurrentlyAdmin ? 'remove admin role from' : 'grant admin role to';
    
    swal({
      title: `Are you sure?`,
      text: `This will ${actionText} this user.`,
      icon: 'warning',
      buttons: true,
    }).then((willProceed) => {
      if (willProceed) {
        Meteor.call('users.toggleAdmin', userId, action, (error) => {
          if (error) {
            swal('Error', error.message, 'error');
          } else {
            swal('Success!', `Admin role ${action}ed successfully.`, 'success');
          }
        });
      }
    });
  };

  /** If the subscription(s) have been received, render the page, otherwise show a loading icon. */
  render() {
    return (this.props.ready) ? this.renderPage() : <Loader active>Getting data</Loader>;
  }

  /** Render the page once subscriptions have been received. */
  renderPage() {
    const { editModalOpen, editForm } = this.state;
    
    return (
      <Container>
        <Header as="h2" textAlign="center">Admin - Manage All Users</Header>
        <Table celled striped>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Username</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Email</Table.HeaderCell>
              <Table.HeaderCell>Admin</Table.HeaderCell>
              <Table.HeaderCell>Created</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {this.props.users.map((user) => {
              const isAdmin = user.roles && user.roles.includes('admin');
              return (
                <Table.Row key={user._id}>
                  <Table.Cell>{user.username}</Table.Cell>
                  <Table.Cell>
                    {user.profile?.firstName} {user.profile?.lastName}
                  </Table.Cell>
                  <Table.Cell>{user.emails?.[0]?.address}</Table.Cell>
                  <Table.Cell>
                    <Icon name={isAdmin ? 'check' : 'close'} color={isAdmin ? 'green' : 'red'} />
                    {isAdmin ? 'Yes' : 'No'}
                  </Table.Cell>
                  <Table.Cell>{new Date(user.createdAt).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <Button
                      icon
                      size="small"
                      color="blue"
                      onClick={() => this.handleEdit(user)}
                    >
                      <Icon name="edit" />
                    </Button>
                    <Button
                      icon
                      size="small"
                      color={isAdmin ? 'orange' : 'green'}
                      onClick={() => this.toggleAdminRole(user._id, isAdmin)}
                      title={isAdmin ? 'Remove Admin' : 'Make Admin'}
                    >
                      <Icon name={isAdmin ? 'minus circle' : 'plus circle'} />
                    </Button>
                    <Button
                      icon
                      size="small"
                      color="red"
                      onClick={() => this.handleDelete(user._id)}
                      disabled={user._id === Meteor.userId()} // Prevent self-deletion
                    >
                      <Icon name="trash" />
                    </Button>
                  </Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>

        {/* Edit Modal */}
        <Modal open={editModalOpen} onClose={() => this.setState({ editModalOpen: false })}>
          <Modal.Header>Edit User</Modal.Header>
          <Modal.Content>
            <Form>
              <Form.Input
                label="Username"
                name="username"
                value={editForm.username}
                onChange={this.handleFormChange}
              />
              <Form.Input
                label="First Name"
                name="firstName"
                value={editForm.firstName}
                onChange={this.handleFormChange}
              />
              <Form.Input
                label="Last Name"
                name="lastName"
                value={editForm.lastName}
                onChange={this.handleFormChange}
              />
              <Form.Input
                label="Email"
                name="email"
                type="email"
                value={editForm.email}
                onChange={this.handleFormChange}
              />
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => this.setState({ editModalOpen: false })}>
              Cancel
            </Button>
            <Button color="green" onClick={this.handleSaveEdit}>
              <Icon name="save" /> Save Changes
            </Button>
          </Modal.Actions>
        </Modal>
      </Container>
    );
  }
}

/** Require an array of User documents in the props. */
AdminUsers.propTypes = {
  users: PropTypes.array.isRequired,
  ready: PropTypes.bool.isRequired,
};

/** withTracker connects Meteor data to React components. */
export default withTracker(() => {
  // Get access to all Users documents (admin view)
  const subscription = Meteor.subscribe('AllUsers'); // We'll need to create this subscription
  return {
    users: Meteor.users.find({}).fetch(),
    ready: subscription.ready(),
  };
})(AdminUsers);
