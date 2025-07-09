import React from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Container, Form, Grid, Header, Message, Segment, Input } from 'semantic-ui-react';

/**
 * Signin page overrides the form’s submit event and call Meteor’s loginWithPassword().
 * Authentication errors modify the component’s state to be displayed
 */
export default class Signin extends React.Component {

  /** Initialize component state with properties for login and redirection. */
  constructor(props) {
    super(props);
    this.state = { email: '', password: '', error: '', redirectToReferer: false };
  }

  /** Update the form controls each time the user interacts with them. */
  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value });
  }

  /** Handle Signin submission using Meteor's account mechanism. */
  submit = () => {
    const { email, password } = this.state;
    Meteor.loginWithPassword(email, password, (err) => {
      if (err) {
        this.setState({ error: err.reason });
      } else {
        this.setState({ error: '', redirectToReferer: true });
      }
    });
  }

  /** Render the signin form. */
  render() {
    const { from } = this.props.location.state || { from: { pathname: '/' } };
    // if correct authentication, redirect to page instead of login screen
    if (this.state.redirectToReferer) {
      return <Redirect to={'/list'}/>;
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
          </Container>
        </div>
    );
  }
}

/** Ensure that the React Router location object is available in case we need to redirect. */
Signin.propTypes = {
  location: PropTypes.object,
};
