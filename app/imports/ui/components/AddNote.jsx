import React from "react";
import { Segment } from "semantic-ui-react";
import { AutoForm, TextField, HiddenField, SubmitField, ErrorsField } from "uniforms-semantic";
import swal from "sweetalert";
import PropTypes from "prop-types";
import { JoiBridge } from "../forms/JoiBridge";
import { Notes, NotesSchema } from "../../api/note/Notes";

const bridge = new JoiBridge(NotesSchema);

/** Renders the Page for adding a document. */
class AddNote extends React.Component {

  /** On submit, insert the data. */
  submit(data, formRef) {
    const {
      note,
      owner,
      profileId,
      createdAt,
    } = data;
    Notes.insert({
          note,
          owner,
          profileId,
          createdAt,
        },
        (error) => {
          if (error) {
            swal("Note Error", error.message, "error");
          } else {
            swal("Success", "Note added successfully", "success");
            formRef.reset();
          }
        });
  }

  /** Render the form. Use Uniforms: https://github.com/vazco/uniforms */
  render() {
    let fRef = null;
    return (
        <AutoForm ref={ref => { fRef = ref; }} schema={bridge} onSubmit={data => this.submit(data, fRef)} >
          <Segment>
            <TextField label="Add a timestamped note" name='note'/>
            <SubmitField value='Submit'/>
            <ErrorsField/>
            <HiddenField name='owner' value={this.props.owner}/>
            <HiddenField name='profileId' value={this.props.profileId}/>
            <HiddenField name='createdAt' value={new Date()}/>
          </Segment>
        </AutoForm>
    );
  }
}

AddNote.propTypes = {
  owner: PropTypes.string.isRequired,
  profileId: PropTypes.string.isRequired,
};

export default AddNote;
