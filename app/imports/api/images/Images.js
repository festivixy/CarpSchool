import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import Joi from "joi";

/** Define a Mongo collection to hold image data. */
const Images = new Mongo.Collection("Images");

const ImagesSchema = Joi.object({
  _id: Joi.string().optional(),
  uuid: Joi.string().required(),
  sha256Hash: Joi.string().required(), // Hash of uncompressed PNG
  compressedSha256Hash: Joi.string().optional(), // Hash of compressed PNG
  imageData: Joi.any().required(), // Accept any type for binary data
  fileName: Joi.string().required(),
  mimeType: Joi.string().required(),
  fileSize: Joi.number().required(), // Compressed file size
  originalFileSize: Joi.number().optional(), // Original file size before compression
  uncompressedFileSize: Joi.number().optional(), // Uncompressed PNG file size
  compressionRatio: Joi.number().optional(), // Compression ratio percentage
  uploadedAt: Joi.date().required(),
  uploadedBy: Joi.string().optional(), // user id if available
  // Privacy controls
  private: Joi.boolean().default(false), // Whether image is private
  school: Joi.string().optional(), // School ID for school-restricted images
  user: Joi.string().optional(), // User ID for user-restricted images
});

/* uuid is the public handle for every image fetch; sha256Hash backs the
 * upload dedupe lookup. Failures are logged, never thrown at boot. */
if (Meteor.isServer) {
  Meteor.startup(async () => {
    const indexes = [
      [{ uuid: 1 }, { unique: true }],
      [{ sha256Hash: 1 }],
    ];
    for (const [keys, options] of indexes) { // eslint-disable-line no-restricted-syntax
      try {
        await Images.createIndexAsync(keys, options); // eslint-disable-line no-await-in-loop
      } catch (error) {
        console.error("[Images] Could not create index", keys, error?.message || error);
      }
    }
  });
}

/** Make the collection available to other code. */
export { Images, ImagesSchema };
