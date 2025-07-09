import React from 'react';
import { Table } from 'semantic-ui-react';
import PropTypes from 'prop-types';

/** Renders a single row in the List Stuff (Admin) table. See pages/ListStuffAdmin.jsx. */
class ProfileItemAdmin extends React.Component {
  render() {
    return (
        <Table.Row>
          <Table.Cell>{this.props.profile.name}</Table.Cell>
          <Table.Cell>{this.props.profile.quantity}</Table.Cell>
          <Table.Cell>{this.props.profile.condition}</Table.Cell>
          <Table.Cell>{this.props.profile.owner}</Table.Cell>
        </Table.Row>
    );
  }
}

/** Require a document to be passed to this component. */
ProfileItemAdmin.propTypes = {
  profile: PropTypes.object.isRequired,
};

export default ProfileItemAdmin;
