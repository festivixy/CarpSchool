import React from 'react';
import { Grid, Segment, Header } from 'semantic-ui-react';
import AutoForm from 'uniforms-semantic/AutoForm';
import HiddenField from 'uniforms-semantic/HiddenField';
import SelectField from 'uniforms-semantic/SelectField';
import SubmitField from 'uniforms-semantic/SubmitField';
import ErrorsField from 'uniforms-semantic/ErrorsField';
import DateField from 'uniforms-semantic/DateField';
import swal from 'sweetalert';
import { Meteor } from 'meteor/meteor';
import 'uniforms-bridge-simple-schema-2'; // required for Uniforms
import SimpleSchema from 'simpl-schema';
import { Rides } from '../../api/ride/Rides';


/** Create a schema to specify the structure of the data to appear in the form. */
const formSchema = new SimpleSchema({
  rider: String,
  origin: {
    type: String,
    allowedValues: [
      'Aiea', 'Ewa Beach', 'Hale`iwa', 'Hau`ula',
      'Hawaii Kai', 'Honolulu', 'Ka`a`awa', 'Kahala',
      'Kahuku', 'Kailua', 'Kane`ohe', 'Kapolei',
      'La`ie', 'Lanikai', 'Ma`ili', 'Makaha',
      'Manoa', 'Mililani', 'Nanakuli', 'Pearl City',
      'University of Hawaii Manoa', 'Wahiawa', 'Waialua',
      'Wai`anae', 'Waikiki', 'Waimanalo', 'Waipahu',
    ],
  },
  destination: {
    type: String,
    allowedValues: [
      'Aiea', 'Ewa Beach', 'Hale`iwa', 'Hau`ula',
      'Hawaii Kai', 'Honolulu', 'Ka`a`awa', 'Kahala',
      'Kahuku', 'Kailua', 'Kane`ohe', 'Kapolei',
      'La`ie', 'Lanikai', 'Ma`ili', 'Makaha',
      'Manoa', 'Mililani', 'Nanakuli', 'Pearl City',
      'University of Hawaii Manoa', 'Wahiawa', 'Waialua',
      'Wai`anae', 'Waikiki', 'Waimanalo', 'Waipahu',
    ],
  },
  date: Date,
});

/** Renders the Page for adding a document. */
class AddRide extends React.Component {

  /** On submit, insert the data. */
  submit(data, formRef) {
    const { rider, origin, destination, date } = data;
    const driver = Meteor.user().username;
    Rides.insert({ driver, rider, origin, destination, date },
        (error) => {
          if (error) {
            swal('Error', error.message, 'error');
          } else {
            swal('Success', 'Ride added successfully', 'success');
            formRef.reset();
          }
        });
  }

  /** Render the form. Use Uniforms: https://github.com/vazco/uniforms */
  render() {
    let fRef = null;

    return (
        <div className='signUpBackground'>
        <Grid container centered >
          <Grid.Column>
            <Header as="h2" textAlign="center">Create Your Ride</Header>
            <AutoForm ref={ref => { fRef = ref; }} schema={formSchema} onSubmit={data => this.submit(data, fRef)} >
              <Segment >
                <SelectField name='origin' placeholder='Select origin'/>
                <SelectField name='destination' placeholder='Select destination'/>
                <DateField name='date'/>
                <SubmitField value='Submit'/>
                <ErrorsField/>
                <HiddenField name='rider' value='TBD'/>
              </Segment>
            </AutoForm>
          </Grid.Column>
        </Grid>
        </div>
    );
  }
}

export default AddRide;
