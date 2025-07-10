import React from 'react';
import { Grid, Container, Image, Menu, Item, Header, Segment } from 'semantic-ui-react';
import { AutoForm, TextField, NumField, SelectField, SubmitField, ErrorsField } from 'uniforms-semantic';
import { JoiBridge } from '../forms/JoiBridge';
import { Stuffs, StuffSchema } from '../../api/stuff/Stuff';
import Avatar from 'react-avatar';
import swal from 'sweetalert';
import { Meteor } from 'meteor/meteor';

const bridge = new JoiBridge(StuffSchema);

/** A simple static component to render some text for the landing page. */
class Profile extends React.Component {

  /** On submit, insert the data. */
  submit(data, formRef) {
    const { name, quantity, condition } = data;
    const owner = Meteor.user().username;
    Stuffs.insert({ name, quantity, condition, owner },
        (error) => {
          if (error) {
            swal('Error', error.message, 'error');
          } else {
            swal('Success', 'Item added successfully', 'success');
            formRef.reset();
          }
        });
  }
  render() {
    let fRef = null;
    return (
        <Container>
          <Grid divided='vertically'>
            <Grid.Row columns={2} border={0}>
              <Grid.Column>
                <Grid.Row centered columns={4}>
                  <Header as="h2" textAlign="center">Edit Profile</Header>
                  <AutoForm ref={ref => { fRef = ref; }} schema={bridge} onSubmit={data => this.submit(data, fRef)}>
                    <Segment border={0}>
                      <TextField name='name'/>
                      <NumField name='quantity' decimal={false}/>
                      <SelectField name='condition' options={[
                        { key: 'excellent', text: 'Excellent', value: 'excellent' },
                        { key: 'good', text: 'Good', value: 'good' },
                        { key: 'fair', text: 'Fair', value: 'fair' },
                        { key: 'poor', text: 'Poor', value: 'poor' }
                      ]}/>
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
