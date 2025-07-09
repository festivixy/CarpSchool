import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Tracker } from 'meteor/tracker';

/** Define a Mongo collection to hold the data. */
const Profiles = new Mongo.Collection('Profiles');

/** Define a schema to specify the structure of each document in the collection. */
const ProfileSchema = new SimpleSchema({
  Name: String,
  Location: String,
  Image: String,
  Ride: {
    type:String,
    defaultValue:'',
    optional: true,
    required: false,
  },
  Phone: String,
  Other: {
    type:String,
    defaultValue:'',
    optional: true,
    required: false,
  },
  Owner: String,
  UserType: {
    type: String,
    allowedValues: ['Driver', 'Rider', 'Both'],
    defaultValue: 'Driver',
  },
}, { tracker: Tracker });

/** Attach this schema to the collection. */
Profiles.attachSchema(ProfileSchema);

/** Make the collection and schema available to other code. */
export { Profiles, ProfileSchema };
