import React from 'react';
import { Grid, Segment, Header } from 'semantic-ui-react';
import { AutoForm, HiddenField, SelectField, SubmitField, ErrorsField, DateField, TextField } from 'uniforms-semantic';
import swal from 'sweetalert';
import { Meteor } from 'meteor/meteor';
import Joi from 'joi';
import { JoiBridge } from '../forms/JoiBridge';
import { Rides } from '../../api/ride/Rides';

// Create a minimal test schema using Joi
const AddRideSchema = Joi.object({
  origin: Joi.string().required().label('Origin'),
  destination: Joi.string().required().label('Destination'),
});

console.log('Joi AddRideSchema created:', AddRideSchema);

// Create bridge with proper error handling
let bridge;
try {
  bridge = new JoiBridge(AddRideSchema);
  console.log('Joi Bridge created successfully:', bridge);
} catch (error) {
  console.error('Error creating Joi bridge:', error);
  console.error('Error details:', error.message, error.stack);
}

/** Renders the Page for adding a document. */
class AddRide extends React.Component {

  /** On submit, insert the data. */
  submit(data, formRef) {
    const { origin, destination } = data;
    const driver = Meteor.user().username;
    const rider = 'TBD';
    const date = new Date();
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

    // Try creating the bridge inside the render method
    let localBridge;
    try {
      localBridge = new JoiBridge(AddRideSchema);
      console.log('Local Joi bridge created successfully in render');
    } catch (error) {
      console.error('Error creating local Joi bridge in render:', error);
      return <div>Error: Could not create Joi form bridge in render. Check console for details.</div>;
    }

    return (
        <div className='signUpBackground'>
        <Grid container centered >
          <Grid.Column>
            <Header as="h2" textAlign="center">Create Your Ride</Header>
            <AutoForm ref={ref => { fRef = ref; }} schema={localBridge} onSubmit={data => this.submit(data, fRef)} >
              <Segment >
                <SelectField name='origin' placeholder='Select origin' options={[
                  { key: 'Aiea', text: 'Aiea', value: 'Aiea' },
                  { key: 'Ewa Beach', text: 'Ewa Beach', value: 'Ewa Beach' },
                  { key: 'Hale`iwa', text: 'Hale`iwa', value: 'Hale`iwa' },
                  { key: 'Hau`ula', text: 'Hau`ula', value: 'Hau`ula' },
                  { key: 'Hawaii Kai', text: 'Hawaii Kai', value: 'Hawaii Kai' },
                  { key: 'Honolulu', text: 'Honolulu', value: 'Honolulu' },
                  { key: 'Ka`a`awa', text: 'Ka`a`awa', value: 'Ka`a`awa' },
                  { key: 'Kahala', text: 'Kahala', value: 'Kahala' },
                  { key: 'Kahuku', text: 'Kahuku', value: 'Kahuku' },
                  { key: 'Kailua', text: 'Kailua', value: 'Kailua' },
                  { key: 'Kane`ohe', text: 'Kane`ohe', value: 'Kane`ohe' },
                  { key: 'Kapolei', text: 'Kapolei', value: 'Kapolei' },
                  { key: 'La`ie', text: 'La`ie', value: 'La`ie' },
                  { key: 'Lanikai', text: 'Lanikai', value: 'Lanikai' },
                  { key: 'Ma`ili', text: 'Ma`ili', value: 'Ma`ili' },
                  { key: 'Makaha', text: 'Makaha', value: 'Makaha' },
                  { key: 'Manoa', text: 'Manoa', value: 'Manoa' },
                  { key: 'Mililani', text: 'Mililani', value: 'Mililani' },
                  { key: 'Nanakuli', text: 'Nanakuli', value: 'Nanakuli' },
                  { key: 'Pearl City', text: 'Pearl City', value: 'Pearl City' },
                  { key: 'University of Hawaii Manoa', text: 'University of Hawaii Manoa', value: 'University of Hawaii Manoa' },
                  { key: 'Wahiawa', text: 'Wahiawa', value: 'Wahiawa' },
                  { key: 'Waialua', text: 'Waialua', value: 'Waialua' },
                  { key: 'Wai`anae', text: 'Wai`anae', value: 'Wai`anae' },
                  { key: 'Waikiki', text: 'Waikiki', value: 'Waikiki' },
                  { key: 'Waimanalo', text: 'Waimanalo', value: 'Waimanalo' },
                  { key: 'Waipahu', text: 'Waipahu', value: 'Waipahu' }
                ]}/>
                <SelectField name='destination' placeholder='Select destination' options={[
                  { key: 'Aiea', text: 'Aiea', value: 'Aiea' },
                  { key: 'Ewa Beach', text: 'Ewa Beach', value: 'Ewa Beach' },
                  { key: 'Hale`iwa', text: 'Hale`iwa', value: 'Hale`iwa' },
                  { key: 'Hau`ula', text: 'Hau`ula', value: 'Hau`ula' },
                  { key: 'Hawaii Kai', text: 'Hawaii Kai', value: 'Hawaii Kai' },
                  { key: 'Honolulu', text: 'Honolulu', value: 'Honolulu' },
                  { key: 'Ka`a`awa', text: 'Ka`a`awa', value: 'Ka`a`awa' },
                  { key: 'Kahala', text: 'Kahala', value: 'Kahala' },
                  { key: 'Kahuku', text: 'Kahuku', value: 'Kahuku' },
                  { key: 'Kailua', text: 'Kailua', value: 'Kailua' },
                  { key: 'Kane`ohe', text: 'Kane`ohe', value: 'Kane`ohe' },
                  { key: 'Kapolei', text: 'Kapolei', value: 'Kapolei' },
                  { key: 'La`ie', text: 'La`ie', value: 'La`ie' },
                  { key: 'Lanikai', text: 'Lanikai', value: 'Lanikai' },
                  { key: 'Ma`ili', text: 'Ma`ili', value: 'Ma`ili' },
                  { key: 'Makaha', text: 'Makaha', value: 'Makaha' },
                  { key: 'Manoa', text: 'Manoa', value: 'Manoa' },
                  { key: 'Mililani', text: 'Mililani', value: 'Mililani' },
                  { key: 'Nanakuli', text: 'Nanakuli', value: 'Nanakuli' },
                  { key: 'Pearl City', text: 'Pearl City', value: 'Pearl City' },
                  { key: 'University of Hawaii Manoa', text: 'University of Hawaii Manoa', value: 'University of Hawaii Manoa' },
                  { key: 'Wahiawa', text: 'Wahiawa', value: 'Wahiawa' },
                  { key: 'Waialua', text: 'Waialua', value: 'Waialua' },
                  { key: 'Wai`anae', text: 'Wai`anae', value: 'Wai`anae' },
                  { key: 'Waikiki', text: 'Waikiki', value: 'Waikiki' },
                  { key: 'Waimanalo', text: 'Waimanalo', value: 'Waimanalo' },
                  { key: 'Waipahu', text: 'Waipahu', value: 'Waipahu' }
                ]}/>
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

export default AddRide;
