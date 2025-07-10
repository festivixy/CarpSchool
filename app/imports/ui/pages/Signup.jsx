import React from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { Container, Form, Grid, Header, Message, Segment, Button, Divider, Modal, Input } from 'semantic-ui-react';
import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

/**
 * Signup component is similar to signin component, but we create a new user instead.
 */
class Signup extends React.Component {
  /** Initialize state fields. */
  constructor(props) {
    super(props);
    this.state = { 
      email: '', 
      firstName: '', 
      lastName: '', 
      password: '', 
      captchaInput: '',
      captchaSvg: '',
      captchaSessionId: '',
      error: '', 
      redirectToReferer: false,
      isLoadingCaptcha: false,
      showCaptchaErrorModal: false
    };
  }

  componentDidMount() {
    this.generateNewCaptcha();
  }

  /** Update the form controls each time the user interacts with them. */
  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  }

  /** Generate a new CAPTCHA */
  generateNewCaptcha = () => {
    this.setState({ isLoadingCaptcha: true });
    Meteor.call('captcha.generate', (error, result) => {
      if (error) {
        this.setState({ error: 'Failed to load CAPTCHA. Please try again.', isLoadingCaptcha: false });
      } else {
        this.setState({
          captchaSvg: result.svg,
          captchaSessionId: result.sessionId,
          captchaInput: '',
          isLoadingCaptcha: false,
          error: ''
        });
      }
    });
  }

  /** Handle Signup submission. Create user account and a profile entry, then redirect to the home page. */
  submit = () => {
    const { email, password, firstName, lastName, captchaInput, captchaSessionId } = this.state;
    
    // First verify CAPTCHA
    Meteor.call('captcha.verify', captchaSessionId, captchaInput, (captchaError, isValidCaptcha) => {
      if (captchaError || !isValidCaptcha) {
        this.setState({ showCaptchaErrorModal: true });
        this.generateNewCaptcha(); // Generate new CAPTCHA
        return;
      }
      
      // CAPTCHA is valid, proceed with account creation
      Accounts.createUser({ 
        email, 
        username: email, 
        password,
        profile: {
          firstName: firstName,
          lastName: lastName
        }
      }, (err) => {
        if (err) {
          this.setState({ error: err.reason });
          this.generateNewCaptcha(); // Generate new CAPTCHA on error
        } else {
          this.setState({ error: '', redirectToReferer: true });
        }
      });
    });
  }

  /** Close the CAPTCHA error modal */
  closeCaptchaErrorModal = () => {
    this.setState({ showCaptchaErrorModal: false });
  }

  /** Display the signup form. Redirect to add page after successful registration and login. */
  render() {
    const { from } = this.props.location.state || { from: { pathname: '/listMyRides' } };
    // if correct authentication, redirect to from: page instead of signup screen
    if (this.state.redirectToReferer) {
      return <Redirect to={from}/>;
    }
    return (
        <div className='signUpBackground'>
      <Container>
        <Grid textAlign="center" verticalAlign="middle" centered columns={2}>
          <Grid.Column>
            <Header as="h2" textAlign="center">
              Sign - Up
            </Header>
            <Form onSubmit={this.submit}>
              <Segment stacked>
                <Form.Input
                  label="UH Email"
                  icon="user"
                  iconPosition="left"
                  name="email"
                  type="email"
                  placeholder="UH E-mail address"
                  onChange={this.handleChange}
                />
                <Grid columns='equal'>
                  <Grid.Column>
                <Form.Input
                    label="First Name"
                    name="firstName"
                    type="text"
                    placeholder="Enter First Name"
                    onChange={this.handleChange}
                />
                  </Grid.Column>
                    <Grid.Column>
                <Form.Input
                    label="Last Name"
                    name="lastName"
                    type="text"
                    placeholder="Enter Last Name"
                    onChange={this.handleChange}
                />
                  </Grid.Column>
                </Grid>
                <Form.Input
                  label="Password"
                  icon="lock"
                  iconPosition="left"
                  name="password"
                  placeholder="Password"
                  type="password"
                  onChange={this.handleChange}
                />

                <Divider />
                
                {/* CAPTCHA Section */}
                <div style={{ textAlign: 'center', marginBottom: '1em' }}>
                  <label style={{ display: 'block', marginBottom: '0.5em', fontWeight: 'bold' }}>
                    Security Verification
                  </label>
                  <div style={{ 
                    border: '1px solid #ccc', 
                    borderRadius: '4px', 
                    padding: '10px', 
                    marginBottom: '0.5em',
                    backgroundColor: '#f9f9f9',
                    display: 'inline-block'
                  }}>
                    {this.state.isLoadingCaptcha ? (
                      <div>Loading CAPTCHA...</div>
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: this.state.captchaSvg }} />
                    )}
                  </div>
                  <br />
                  <Button 
                    type="button" 
                    size="small" 
                    onClick={this.generateNewCaptcha}
                    loading={this.state.isLoadingCaptcha}
                  >
                    Refresh CAPTCHA
                  </Button>
                </div>

                <Form.Field>
                  <Input
                      label={{ basic: true, content: 'Enter the characters shown above' }}
                      name="captchaInput"
                      placeholder="Enter CAPTCHA"
                      value={this.state.captchaInput}
                      onChange={this.handleChange}
                      style={{ textAlign: 'center' }}
                  />
                </Form.Field>

                <Form.Button content="Submit"/>
              </Segment>
            </Form>
            <Message>
              Already have an account? Login <Link to="/signin">here</Link>
            </Message>
            {this.state.error === '' ? (
              ''
            ) : (
              <Message
                error
                header="Registration was not successful"
                content={this.state.error}
              />
            )}
          </Grid.Column>
        </Grid>
        
        {/* CAPTCHA Error Modal */}
        <Modal
          open={this.state.showCaptchaErrorModal}
          onClose={this.closeCaptchaErrorModal}
          size="small"
        >
          <Modal.Header>Invalid CAPTCHA</Modal.Header>
          <Modal.Content>
            <p>The security verification code you entered is incorrect. Please try again with the new code that has been generated.</p>
          </Modal.Content>
          <Modal.Actions>
            <Button 
              positive 
              onClick={this.closeCaptchaErrorModal}
              content="OK"
            />
          </Modal.Actions>
        </Modal>
      </Container>
        </div>
    );
  }
}

/** Ensure that the React Router location object is available in case we need to redirect. */
Signup.propTypes = {
  location: PropTypes.object,
};

export default Signup;
