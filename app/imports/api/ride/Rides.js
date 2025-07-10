import { Mongo } from 'meteor/mongo';
import Joi from 'joi';

/** Define a Mongo collection to hold the data. */
const Rides = new Mongo.Collection('Rides');

const RidesSchema = Joi.object({
  _id: Joi.string().optional(),
  driver: Joi.string().required(),
  rider: Joi.string().required(),
  origin: Joi.string().valid(
    'Aiea', 'Ewa Beach', 'Hale`iwa', 'Hau`ula',
    'Hawaii Kai', 'Honolulu', 'Ka`a`awa', 'Kahala',
    'Kahuku', 'Kailua', 'Kane`ohe', 'Kapolei',
    'La`ie', 'Lanikai', 'Ma`ili', 'Makaha',
    'Manoa', 'Mililani', 'Nanakuli', 'Pearl City',
    'University of Hawaii Manoa', 'Wahiawa', 'Waialua',
    'Wai`anae', 'Waikiki', 'Waimanalo', 'Waipahu'
  ).required(),
  destination: Joi.string().valid(
    'Aiea', 'Ewa Beach', 'Hale`iwa', 'Hau`ula',
    'Hawaii Kai', 'Honolulu', 'Ka`a`awa', 'Kahala',
    'Kahuku', 'Kailua', 'Kane`ohe', 'Kapolei',
    'La`ie', 'Lanikai', 'Ma`ili', 'Makaha',
    'Manoa', 'Mililani', 'Nanakuli', 'Pearl City',
    'University of Hawaii Manoa', 'Wahiawa', 'Waialua',
    'Wai`anae', 'Waikiki', 'Waimanalo', 'Waipahu'
  ).required(),
  date: Joi.date().required(),
});

/** Make the collection available to other code. */
export { Rides, RidesSchema };
