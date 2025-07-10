import React from 'react';
import { Modal, Button, Header, Icon, Message } from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import swal from 'sweetalert';

class JoinRideModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      codeInputs: ['', '', '', '', '', '', '', ''], // 8 separate inputs
      isJoining: false,
      error: null,
    };
    this.inputRefs = [];
  }

  componentDidMount() {
    this.prefillCodeIfProvided();
  }

  componentDidUpdate(prevProps) {
    // If prefillCode prop changed, update the inputs
    if (prevProps.prefillCode !== this.props.prefillCode) {
      this.prefillCodeIfProvided();
    }
  }

  prefillCodeIfProvided = () => {
    const { prefillCode } = this.props;
    if (prefillCode && prefillCode.length >= 8) {
      // Remove dash and take first 8 characters
      const cleanCode = prefillCode.replace(/-/g, '').slice(0, 8);
      const newInputs = ['', '', '', '', '', '', '', ''];

      for (let i = 0; i < cleanCode.length && i < 8; i++) {
        newInputs[i] = cleanCode[i].toUpperCase();
      }

      this.setState({ codeInputs: newInputs, error: null });
    }
  };

  handleInputChange = (index, e) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (value.length <= 1) {
      const newInputs = [...this.state.codeInputs];
      newInputs[index] = value;
      this.setState({ codeInputs: newInputs, error: null });

      // Auto-advance to next input if character was entered
      if (value.length === 1 && index < 7) {
        setTimeout(() => {
          if (this.inputRefs[index + 1]) {
            this.inputRefs[index + 1].focus();
          }
        }, 50);
      }
    }
  };

  handleKeyDown = (index, e) => {
    // Handle backspace to move to previous input
    if (e.key === 'Backspace' && this.state.codeInputs[index] === '' && index > 0) {
      setTimeout(() => {
        if (this.inputRefs[index - 1]) {
          this.inputRefs[index - 1].focus();
        }
      }, 50);
    }
  };

  handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (pastedText.length <= 8) {
      const newInputs = ['', '', '', '', '', '', '', ''];
      for (let i = 0; i < pastedText.length; i++) {
        newInputs[i] = pastedText[i];
      }
      this.setState({ codeInputs: newInputs, error: null });

      // Focus the next empty input or the last one
      const nextIndex = Math.min(pastedText.length, 7);
      setTimeout(() => {
        if (this.inputRefs[nextIndex]) {
          this.inputRefs[nextIndex].focus();
        }
      }, 50);
    }
  };

  handleJoinRide = () => {
    const shareCode = this.state.codeInputs.join('');

    if (shareCode.length !== 8) {
      this.setState({ error: 'Please enter all 8 characters of the code' });
      return;
    }

    // Format as XXXX-XXXX for server
    const formattedCode = `${shareCode.slice(0, 4)}-${shareCode.slice(4)}`;

    this.setState({ isJoining: true, error: null });

    Meteor.call('rides.joinWithCode', formattedCode, (error, result) => {
      this.setState({ isJoining: false });

      if (error) {
        this.setState({ error: error.message });
      } else {
        swal('Success!', result.message, 'success');
        this.setState({ codeInputs: ['', '', '', '', '', '', '', ''], error: null });
        this.props.onClose();
        // Optionally redirect to the ride page
        // this.props.history.push('/userRides');
      }
    });
  };

  handleClose = () => {
    this.setState({ codeInputs: ['', '', '', '', '', '', '', ''], error: null });
    this.props.onClose();
  };

  render() {
    const { open } = this.props;
    const { codeInputs, isJoining, error } = this.state;

    const inputStyle = {
      width: '40px',
      height: '50px',
      fontSize: '1.5em',
      fontFamily: 'monospace',
      textAlign: 'center',
      fontWeight: 'bold',
      margin: '0 2px',
      border: '2px solid #ddd',
      borderRadius: '6px',
      outline: 'none',
      backgroundColor: '#fff',
      transition: 'border-color 0.2s ease',
    };

    const dashStyle = {
      fontSize: '1.5em',
      fontWeight: 'bold',
      margin: '0 8px',
      color: '#333',
    };

    const isComplete = codeInputs.every(input => input.length === 1);

    return (
      <Modal open={open} onClose={this.handleClose} size="small">
        <Header icon="car" content="Join a Ride" />
        <Modal.Content>
          <div style={{ textAlign: 'center' }}>
            <p>Enter the 8-character code shared by the driver:</p>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '20px 0',
            }}>
              {codeInputs.map((value, index) => (
                <React.Fragment key={index}>
                  <input
                    ref={ref => this.inputRefs[index] = ref}
                    value={value}
                    onChange={(e) => this.handleInputChange(index, e)}
                    onKeyDown={(e) => this.handleKeyDown(index, e)}
                    onPaste={index === 0 ? this.handlePaste : undefined}
                    onFocus={(e) => e.target.style.borderColor = '#2185d0'}
                    onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    style={inputStyle}
                    maxLength={1}
                    type="text"
                  />
                  {index === 3 && <span style={dashStyle}>-</span>}
                </React.Fragment>
              ))}
            </div>
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
            disabled={isJoining || !isComplete}
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
  prefillCode: PropTypes.string,
};

export default JoinRideModal;
