import React from "react";
import { Stuffs, StuffSchema } from "/imports/api/stuff/Stuff";
import { Grid, Segment, Header } from "semantic-ui-react";
import { AutoForm, TextField, NumField, SelectField, SubmitField, ErrorsField } from "uniforms-semantic";
import swal from "sweetalert";
import { Meteor } from "meteor/meteor";
import { JoiBridge } from "../forms/JoiBridge";

const bridge = new JoiBridge(StuffSchema);

/** Renders the Page for adding a document. */
class AddStuff extends React.Component {

  /** On submit, insert the data. */
  submit(data, formRef) {
    const { name, quantity, condition } = data;
    const owner = Meteor.user().username;
    Stuffs.insert({ name, quantity, condition, owner },
      (error) => {
        if (error) {
          swal("Error", error.message, "error");
        } else {
          swal("Success", "Item added successfully", "success");
          formRef.reset();
        }
      });
  }

  /** Render the form. Use Uniforms: https://github.com/vazco/uniforms */
  render() {
    let fRef = null;
    return (
        <Grid container centered>
          <Grid.Column>
            <Header as="h2" textAlign="center">Create Your Ride</Header>
            <AutoForm ref={ref => { fRef = ref; }} schema={bridge} onSubmit={data => this.submit(data, fRef)} >
              <Segment>
                <TextField name='name'/>
                <NumField name='quantity' decimal={false}/>
                <SelectField name='condition' options={[
                  { key: "excellent", text: "Excellent", value: "excellent" },
                  { key: "good", text: "Good", value: "good" },
                  { key: "fair", text: "Fair", value: "fair" },
                  { key: "poor", text: "Poor", value: "poor" },
                ]}/>
                <SubmitField value='Submit'/>
                <ErrorsField/>
              </Segment>
            </AutoForm>
          </Grid.Column>
        </Grid>
    );
  }
}

export default AddStuff;
