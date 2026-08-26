import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import Joi from "joi";
import { createSafeStringSchema } from "../../ui/utils/validation";

/**
 * Star ratings and written feedback one participant leaves for another after a
 * ride they shared. Additive: no existing collection or document changes.
 *
 * `subject` is the user being reviewed, `author` the one writing it.
 */
const Reviews = new Mongo.Collection("Reviews");

const ReviewSchema = Joi.object({
  _id: Joi.string().optional(),
  rideId: Joi.string().required().label("Ride"),
  subject: Joi.string().required().label("Reviewed User"),
  author: Joi.string().required().label("Author"),
  stars: Joi.number().integer().min(1).max(5)
    .required()
    .label("Stars"),
  text: createSafeStringSchema({
    pattern: "generalText",
    min: 0,
    max: 300,
    required: false,
    allowEmpty: true,
    label: "Review",
  }),
  createdAt: Joi.date().required().label("Created Date"),
});

if (Meteor.isServer) {
  Meteor.startup(async () => {
    // Serves reviews.forUser, which sorts newest-first for one subject.
    await Reviews.createIndexAsync({ subject: 1, createdAt: -1 });
    // One author reviews a given person at most once per ride. Enforced in the
    // database so two concurrent submissions cannot both pass the read check.
    await Reviews.createIndexAsync(
      { rideId: 1, author: 1, subject: 1 },
      { unique: true },
    );
  });
}

export { Reviews, ReviewSchema };
