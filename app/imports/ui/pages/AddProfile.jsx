import React from 'react';
import { Grid, Loader, Header, Segment } from 'semantic-ui-react';
import swal from 'sweetalert';
import { AutoForm, TextField, SubmitField, SelectField, ErrorsField, HiddenField } from 'uniforms-semantic';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { Profiles, ProfileSchema } from '../../api/profile/Profile';
import { JoiBridge } from '../forms/JoiBridge';

const bridge = new JoiBridge(ProfileSchema);

/** Renders the Page for adding a profile. */
class AddProfile extends React.Component {

  /** On successful submit, insert the data. */
  submit(data, formRef) {
    const {
      Name,
      Location,
      Image,
      Ride,
      Phone,
      Other,
      UserType
    } = data;
    const Owner = Meteor.user()._id;
    
    // Check if profile already exists
    let existingProfile = Profiles.findOne({
      Owner: Meteor.user()._id
    });
    
    if (!existingProfile) {
      // Insert new profile
      Profiles.insert(
          {
            Name,
            Location,
            Image,
            Ride,
            Phone,
            Other,
            UserType,
            Owner
          }, (error) => {
            if (error) {
              swal('Error', error.message, 'error');
            } else {
              swal('Success', 'Profile added successfully', 'success');
            }
          });
    } else {
      // Update existing profile
      Profiles.update(
          existingProfile._id,
          {
            $set: {
              Name,
              Location,
              Image,
              Ride,
              Phone,
              Other,
              UserType
            }
          }, (error) => (error ?
              swal('Error', error.message, 'error') :
              swal('Success', 'Profile updated successfully', 'success')));
    }
  }

  /** If the subscription(s) have been received, render the page, otherwise show a loading icon. */
  render() {
    return (this.props.ready) ? this.renderPage() : <Loader active>Getting data</Loader>;
  }

  /** Render the form. Use Uniforms: https://github.com/vazco/uniforms */
  renderPage() {
    let fRef = null;
    return (
        <Grid container centered>
          <Grid.Column>
            <Header as="h1" textAlign="center" inverted>Add Profile</Header>
            <AutoForm ref={ref => { fRef = ref; }} schema={bridge} onSubmit={data => this.submit(data, fRef)} model={this.props.profileData}>
              <Segment>
                <TextField name='Name' placeholder='Write your First and Last Name'/>
                <TextField name='Location' placeholder='Home city'/>
                <TextField name='Image' placeholder='Profile image url'/>
                <TextField name='Ride' placeholder='Ride image url'/>
                <strong>Contact Information</strong>
                <Segment.Group>
                  <Segment>
                    <TextField name='Phone'/>
                    <TextField name='Other' placeholder='Other contact'/>
                  </Segment>
                </Segment.Group>
                <SelectField name='UserType' options={[
                  { key: 'Driver', text: 'Driver', value: 'Driver' },
                  { key: 'Rider', text: 'Rider', value: 'Rider' },
                  { key: 'Both', text: 'Both', value: 'Both' }
                ]}/>
                <HiddenField name='Owner' value={Meteor.user()._id}/>
                <SubmitField value='Submit'/>
              </Segment>
              <ErrorsField/>
            </AutoForm>
          </Grid.Column>
        </Grid>
    );
  }
}

/** Require the presence of a Profile document in the props object. */
AddProfile.propTypes = {
  profileData: PropTypes.object,
  ready: PropTypes.bool.isRequired,
  currentUser: PropTypes.string,
};

/** withTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker */
export default withTracker(({ match }) => {
  // Get the ProfileID from the URL fields. See imports/ui/layouts/App.jsx for the route containing :_id.
  const usersID = match.params._id;

  // Get access to Profile documents.
  const subscription = Meteor.subscribe('Profiles');

  return{
    profileData: Profiles.findOne({
      Owner: usersID
    }),
    currentUser: Meteor.user() ? Meteor.user().username : '',
    ready: subscription.ready(),
  };
})(AddProfile);
