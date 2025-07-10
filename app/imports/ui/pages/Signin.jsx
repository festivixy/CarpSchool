import React from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Container, Form, Grid, Header, Message, Segment, Input, Button, Divider, Modal } from 'semantic-ui-react';

/**
 * Signin page overrides the form’s submit event and call Meteor’s loginWithPassword().
 * Authentication errors modify the component’s state to be displayed
 */
export default class Signin extends React.Component {

  /** Initialize component state with properties for login and redirection. */
  constructor(props) {
    super(props);
    this.state = { 
      email: '', 
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

  /** Close the CAPTCHA error modal */
  closeCaptchaErrorModal = () => {
    this.setState({ showCaptchaErrorModal: false });
  }

  /** Handle Signin submission using Meteor's account mechanism. */
  submit = () => {
    const { email, password, captchaInput, captchaSessionId } = this.state;
    
    // First verify CAPTCHA
    Meteor.call('captcha.verify', captchaSessionId, captchaInput, (captchaError, isValidCaptcha) => {
      if (captchaError || !isValidCaptcha) {
        this.setState({ showCaptchaErrorModal: true });
        this.generateNewCaptcha(); // Generate new CAPTCHA
        return;
      }
      
      // CAPTCHA is valid, proceed with login
      Meteor.loginWithPassword(email, password, (err) => {
        if (err) {
          this.setState({ error: err.reason });
          this.generateNewCaptcha(); // Generate new CAPTCHA on error
        } else {
          this.setState({ error: '', redirectToReferer: true });
        }
      });
    });
  }

  /** Render the signin form. */
  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } };
    // if correct authentication, redirect to page instead of login screen
    if (this.state.redirectToReferer) {
      return <Redirect to={'/listMyRides'}/>;
    }
    // Otherwise return the Login form.
    return (
        <div className='sign-in-background'>
          <Container>
            <Grid textAlign="center" verticalAlign="middle" centered columns={2}>
              <Grid.Column className='column-margin'>
                <Form onSubmit={this.submit} className='login-form'>
                  <Segment stacked>
                    <Header as="h2" textAlign="center"> Sign-In </Header>
                    <Form.Field>
                      <Input
                          label={{ basic: true, content: 'Email' }}
                          name="email"
                          type="email"
                          placeholder="Enter email"
                          onChange={this.handleChange}
                      />
                    </Form.Field>
                    <Form.Field>
                      <Input
                          label={{ basic: true, content: 'Password' }}
                          name="password"
                          placeholder="Enter password"
                          type="password"
                          onChange={this.handleChange}
                      />
                    </Form.Field>
                    
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
                    <Form.Button content="Submit" className='submit-button'/>
                    <span className='forgot-text'>
                  <Link to="/signup">Click here to Register</Link>
                  <span>
                    <Link to="/forgot">Forgot Password</Link>
                  </span>
                </span>
                    <br/>
                  </Segment>
                </Form>
                {this.state.error === '' ? (
                    ''
                ) : (
                    <Message
                        error
                        header="Login was not successful"
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
Signin.propTypes = {
  location: PropTypes.object,
};
