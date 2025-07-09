import React from 'react';
import { Grid, Container, Image, Menu, Item, Header, Segment } from 'semantic-ui-react';
import AutoForm from 'uniforms-semantic/AutoForm';
import TextField from 'uniforms-semantic/TextField';
import NumField from 'uniforms-semantic/NumField';
import SelectField from 'uniforms-semantic/SelectField';
import SubmitField from 'uniforms-semantic/SubmitField';
import ErrorsField from 'uniforms-semantic/ErrorsField';
import SimpleSchema from 'simpl-schema';

/** Create a schema to specify the structure of the data to appear in the form. */
const formSchema = new SimpleSchema({
  name: String,
  quantity: Number,
  condition: {
    type: String,
    allowedValues: ['excellent', 'good', 'fair', 'poor'],
    defaultValue: 'good',
  },
});

/** A simple static component to render some text for the landing page. */
class Profile extends React.Component {
  render() {
    let fRef = null;
    return (
        <Container>
          <Grid divided='vertically'>
            <Grid.Row columns={2} border={0}>
              <Grid.Column>
                <Grid.Row centered columns={4}>
                  <Header as="h2" textAlign="center">Edit Profile</Header>
                  <AutoForm ref={ref => { fRef = ref; }} schema={formSchema} onSubmit={data => this.submit(data, fRef)}>
                    <Segment border={0}>
                      <TextField name='name'/>
                      <NumField name='quantity' decimal={false}/>
                      <SelectField name='condition'/>
                      <SubmitField value='Submit'/>
                      <ErrorsField/>
                    </Segment>
                  </AutoForm>
                </Grid.Row>
              </Grid.Column>
              <Grid.Column textAlign='right' divided = {0}>
                <Menu fluid vertical inverted>
                  <Avatar skypeId="sitebase" size="200" />
                </Menu>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
    );
  }
}

export default Profile;
