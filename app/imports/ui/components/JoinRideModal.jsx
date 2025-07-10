import React from 'react';
import { Modal, Button, Input, Header, Icon, Message } from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import swal from 'sweetalert';

class JoinRideModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      shareCode: '',
      isJoining: false,
      error: null
    };
  }

  handleInputChange = (e) => {
    let value = e.target.value.toUpperCase();
    
    // Remove any non-alphanumeric characters except dash
    value = value.replace(/[^A-Z0-9-]/g, '');
    
    // Remove existing dashes to reformat properly
    const cleanValue = value.replace(/-/g, '');
    
    // Auto-format with dash: XXXX-XXXX
    if (cleanValue.length > 4) {
      value = cleanValue.slice(0, 4) + '-' + cleanValue.slice(4, 8);
    } else {
      value = cleanValue;
    }
    
    // Limit to 9 characters total (XXXX-XXXX)
    if (value.length <= 9) {
      this.setState({ shareCode: value, error: null });
    }
  };

  handleJoinRide = () => {
    const { shareCode } = this.state;
    
    if (shareCode.length !== 9) {
      this.setState({ error: 'Please enter a complete 8-character code' });
      return;
    }
    
    this.setState({ isJoining: true, error: null });
    
    Meteor.call('rides.joinWithCode', shareCode, (error, result) => {
      this.setState({ isJoining: false });
      
      if (error) {
        this.setState({ error: error.message });
      } else {
        swal('Success!', result.message, 'success');
        this.setState({ shareCode: '', error: null });
        this.props.onClose();
        // Optionally redirect to the ride page
        // this.props.history.push('/userRides');
      }
    });
  };

  handleClose = () => {
    this.setState({ shareCode: '', error: null });
    this.props.onClose();
  };

  render() {
    const { open } = this.props;
    const { shareCode, isJoining, error } = this.state;
    
    return (
      <Modal open={open} onClose={this.handleClose} size="small">
        <Header icon="car" content="Join a Ride" />
        <Modal.Content>
          <div style={{ textAlign: 'center' }}>
            <p>Enter the 8-character code shared by the driver:</p>
            <Input
              placeholder="XXXX-XXXX"
              value={shareCode}
              onChange={this.handleInputChange}
              style={{ 
                fontSize: '1.2em',
                fontFamily: 'monospace',
                letterSpacing: '2px',
                textAlign: 'center',
                width: '200px'
              }}
              maxLength={9}
            />
            {error && (
              <Message negative style={{ marginTop: '10px' }}>
                <Message.Header>Error</Message.Header>
                <p>{error}</p>
              </Message>
            )}
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.handleClose}>
            Cancel
          </Button>
          <Button 
            color="green"
            onClick={this.handleJoinRide}
            loading={isJoining}
            disabled={isJoining || shareCode.length !== 9}
          >
            <Icon name="car" /> Join Ride
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

JoinRideModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default JoinRideModal;
