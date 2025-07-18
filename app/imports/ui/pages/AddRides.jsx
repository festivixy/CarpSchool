import React from "react";
import { Grid, Segment, Header } from "semantic-ui-react";
import { AutoForm, SelectField, SubmitField, ErrorsField } from "uniforms-semantic";
import swal from "sweetalert";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import Joi from "joi";
import { JoiBridge } from "../forms/JoiBridge";
import { Rides } from "../../api/ride/Rides";
import { placesOptions } from "../../api/places/Places.mjs";

// Create a minimal test schema using Joi
const AddRideSchema = Joi.object({
  origin: Joi.string().required().label("Origin"),
  destination: Joi.string().required().label("Destination"),
});

/** Renders the Page for adding a document. */
class AddRide extends React.Component {

  /** On submit, insert the data. */
  submit(data, formRef) {
    const { origin, destination } = data;
    const driver = Meteor.user().username;
    const rider = "TBD";
    const date = new Date();
    Rides.insert({ driver, rider, origin, destination, date },
        (error) => {
          if (error) {
            swal("Error", error.message, "error");
          } else {
            swal("Success", "Ride added successfully", "success");
            formRef.reset();
            // Redirect to imRiding page after successful ride creation
            this.props.history.push("/imRiding"); // eslint-disable-line
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
      console.log("Local Joi bridge created successfully in render");
    } catch (error) {
      console.error("Error creating local Joi bridge in render:", error);
      return <div>Error: Could not create Joi form bridge in render. Check console for details.</div>;
    }

    return (
        <div>
        <Grid container centered >
          <Grid.Column>
            <Header as="h2" textAlign="center">Create Your Ride</Header>
            <AutoForm ref={ref => { fRef = ref; }} schema={localBridge} onSubmit={data => this.submit(data, fRef)} >
              <Segment >
                <SelectField name='origin' placeholder='Select origin' options={placesOptions}/>
                <SelectField name='destination' placeholder='Select destination' options={placesOptions}/>
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

export default withRouter(AddRide);
