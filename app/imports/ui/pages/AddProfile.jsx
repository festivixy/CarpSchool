import React from 'react';
import Avatar from 'react-avatar';
import { Grid, Loader, Menu, Header, Segment } from 'semantic-ui-react';
import swal from 'sweetalert';
import AutoForm from 'uniforms-semantic/AutoForm';
import TextField from 'uniforms-semantic/TextField';
import SubmitField from 'uniforms-semantic/SubmitField';
import SelectField from 'uniforms-semantic/SelectField';
import ErrorsField from 'uniforms-semantic/ErrorsField';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { Profiles, ProfileSchema } from '../../api/profile/Profile';
import 'uniforms-bridge-simple-schema-2'; // required for Uniforms
import SimpleSchema from 'simpl-schema';
import Footer from '../components/Footer';
import { Roles } from 'meteor/alanning:roles';

/** Create a schema to specify the structure of the data to appear in the form. */
const ProfileformSchema = new SimpleSchema({
  Name: String,
  Location: String,
  Phone: String,
  Email: {
    type:String,
    defaultValue:'',
    optional: true,
    required: false,
  },
  Other:  {
    type:String,
    defaultValue:'',
    optional: true,
    required: false,
  },
  UserType: {
    type: String,
    allowedValues: ['Driver', 'Rider', 'Both'],
    defaultValue: 'Driver',
  },
});

let check = {
  Name: String,
  Location: String,
  Phone: String,
  Email: String,
  Other: String,
  UserType: String,
  Owner: String
}

/** Renders the Page for editing a single document. */
class AddProfile extends React.Component {

  check(data){

    check = Profiles.findOne(
        {
          Owner : Meteor.user().username
        },
        {
          Owner: 1, _id: 0
        }
    );

    if (check === undefined){
      check = {};
      check.Owner = '';
    }
  }

  /** On successful submit, insert the data. */
  submit(data, formRef) {
    const {
      Name,
      Location,
      Phone,
      Email,
      Other,
      UserType
    } = data;
    const Owner = Meteor.user()._id;
    // For Insert or create new Profile
    let check = Profiles.findOne(
        {
          Owner: Meteor.user()._id
        },
        {
          Owner: 1, _id: 0
        }
    );
    console.log('Owner');
    console.log(Owner);
    if (check === undefined){
      check = {};
      check.Owner = '';
    }

    // If inside database then Update
    if (check.Owner == Meteor.user()._id){
      const ID = check._id;
      Profiles.update(
          ID,
          {
            $set: {
              Name,
              Location,
              Phone,
              Email,
              Other,
              UserType
            }
          }, (error) => (error ?
              swal('Error', error.message, 'error') :
              swal('Success', 'Item updated successfully', 'success')));
    }
    // Else, Insert
    else{
      console.log('inserting')
      Profiles.insert(
          {
            Name,
            Location,
            Phone,
            Email,
            Other,
            UserType,
            Owner
          }, (error) => {
            if (error) {
              swal('Error', error.message, 'error');
            } else {
              swal('Success', 'Item added successfully', 'success');
            }
          });
    }
  }

  /** If the subscription(s) have been received, render the page, otherwise show a loading icon. */
  render() {
    return (this.props.ready) ? this.renderPage() : <Loader active>Getting data</Loader>;
  }

  /** Render the form. Use Uniforms: https://github.com/vazco/uniforms */
  renderPage() {
    //this.check(data);
    let fRef = null;
    return (
        <Grid container centered>
          <Grid.Column>
            <Header as="h1" textAlign="center" inverted>Profile</Header>
            <AutoForm ref={ref => { fRef = ref; }} schema={ProfileformSchema} onSubmit={data => this.submit(data, fRef)} model={this.props.check}>
              <Segment>
              <TextField name='Name' placeholder='Write your First and Last Name.'/>
              <TextField name='Location'/>
              <bold>Contact Information</bold>
              <Segment.Group>
                <Segment>
                  <TextField name='Phone'/>
                  <TextField disabled name='Email' placeholder={this.props.currentUser}/>
                  <TextField name='Other' required={0}/>
                </Segment>
              </Segment.Group>
              <SelectField name='UserType'/>
              <SubmitField value='Submit'/>
              </Segment>
              <ErrorsField/>
            </AutoForm>
          </Grid.Column>
        </Grid>
    );
  }
}

/** Require the presence of a Stuff document in the props object. Uniforms adds 'model' to the props, which we use. */
AddProfile.propTypes = {
  check: PropTypes.object,
  model: PropTypes.object,
  ready: PropTypes.bool.isRequired,
  currentUser: PropTypes.string,
  currentId: PropTypes.string,
};

const AddProfileContainer = withTracker(() => ({
  currentUser: Meteor.user() ? Meteor.user().username : '',
}))(AddProfile);

/** withTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker */
export default withTracker(({ match }) => {
  // Get the ProfileID from the URL fields. See imports/ui/layouts/App.jsx for the route containing :_id.
  const usersID = match.params._id;

  // Get access to Stuff documents.
  const subscription = Meteor.subscribe('Profiles');

  return{
    check: Profiles.findOne(
        {
          Owner: usersID
        }
    ),
    ready: subscription.ready(),
  };
})(AddProfileContainer);
