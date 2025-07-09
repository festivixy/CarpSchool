import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

/** Define a Mongo Notes to hold the data. */
const Notes = new Mongo.Collection('Notes');

/** Define a schema to specify the structure of each document in the Notes. */
const NotesSchema = new SimpleSchema({
  note: String,
  owner: String,
  profileId: String,
  createdAt: Date,
}, { tracker: Tracker });

/** Attach this schema to the Notes. */
Notes.attachSchema(NotesSchema);

/** Make the Notes and schema available to other code. */
export { Notes, NotesSchema };
