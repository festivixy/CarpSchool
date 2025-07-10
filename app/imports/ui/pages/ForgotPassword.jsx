import React from 'react';
import { Grid, Segment, Header } from 'semantic-ui-react';
import { AutoForm, TextField, SubmitField, ErrorsField } from 'uniforms-semantic';
import swal from 'sweetalert';
import Joi from 'joi';
import { Accounts } from 'meteor/accounts-base';
import { JoiBridge } from '../forms/JoiBridge';

/** Create a schema to specify the structure of the data to appear in the form. */
const formSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required().label('Email'),
});

const bridge = new JoiBridge(formSchema);

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
        <div>
          <Grid container centered>
            <Grid.Column>
              <AutoForm ref={ref => {
                fRef = ref;
              }} schema={bridge} onSubmit={data => this.submit(data, fRef)}>
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
