import React from 'react';
import { Grid, Segment, Header } from 'semantic-ui-react';
import AutoForm from 'uniforms-semantic/AutoForm';
import TextField from 'uniforms-semantic/TextField';
import SubmitField from 'uniforms-semantic/SubmitField';
import ErrorsField from 'uniforms-semantic/ErrorsField';
import swal from 'sweetalert';
import 'uniforms-bridge-simple-schema-2'; // required for Uniforms
import SimpleSchema from 'simpl-schema';
import { Accounts } from 'meteor/accounts-base';

/** Create a schema to specify the structure of the data to appear in the form. */
const formSchema = new SimpleSchema({
  email: String,
});

/** Renders the Page for adding a document. */
class ForgotPassword extends React.Component {

  /** On submit, insert the data. */
  submit(data, formRef) {
    const { email } = data;
    Accounts.forgotPassword({ email },
        (error) => {
          if (error) {
            swal('Error', error.message, 'error');
          } else {
            swal('Success', 'An email has been set to reset your password.', 'success');
            formRef.reset();
          }
        });
  }

  /** Render the form. Use Uniforms: https://github.com/vazco/uniforms */
  render() {
    let fRef = null;
    return (
        <div className='forgot-background'>
          <Grid container centered>
            <Grid.Column>
              <AutoForm ref={ref => {
                fRef = ref;
              }} schema={formSchema} onSubmit={data => this.submit(data, fRef)}>
                <Segment>
                  <Header as="h2" textAlign="center">Forgot Your Password?</Header>
                  <TextField name='email'/>
                  <SubmitField value='Submit'/>
                  <ErrorsField/>
                </Segment>
              </AutoForm>
            </Grid.Column>
          </Grid>
        </div>
    );
  }
}

export default ForgotPassword;
