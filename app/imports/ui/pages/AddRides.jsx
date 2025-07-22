import React from "react";
import { Grid, Segment, Header } from "semantic-ui-react";
import { AutoForm, SelectField, SubmitField, ErrorsField } from "uniforms-semantic";
import swal from "sweetalert";
import { Meteor } from "meteor/meteor";
import { withRouter } from "react-router-dom";
import { withTracker } from "meteor/react-meteor-data";
import PropTypes from "prop-types";
import Joi from "joi";
import { JoiBridge } from "../forms/JoiBridge";
import { Rides } from "../../api/ride/Rides";
import { Places } from "../../api/places/Places";

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
    const { ready, placesOptions } = this.props;

    if (!ready) {
      return <div>Loading places...</div>;
    }

    // Create schema with dynamic places validation
    const AddRideSchema = Joi.object({
      origin: Joi.string().valid(...placesOptions.map(p => p.value)).required().label("Origin"),
      destination: Joi.string().valid(...placesOptions.map(p => p.value)).required().label("Destination"),
    });

    let fRef = null;
    let localBridge;
    try {
      localBridge = new JoiBridge(AddRideSchema);
    } catch (error) {
      console.error("Error creating Joi bridge:", error);
      return <div>Error: Could not create form. Check console for details.</div>;
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

AddRide.propTypes = {
  ready: PropTypes.bool.isRequired,
  placesOptions: PropTypes.array.isRequired,
  history: PropTypes.object.isRequired,
};

export default withRouter(withTracker(() => {
  const placesSubscription = Meteor.subscribe("places.options");

  const places = Places.find({}, { sort: { text: 1 } }).fetch();
  const placesOptions = places.map(place => ({
    key: place._id,
    text: place.text,
    value: place.text, // Use text as value to maintain compatibility
  }));

  return {
    ready: placesSubscription.ready(),
    placesOptions,
  };
})(AddRide));
