import { Mongo } from 'meteor/mongo';
import Joi from 'joi';

/** Define a Mongo collection to hold image data. */
const Images = new Mongo.Collection('Images');

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
});

/** Make the collection available to other code. */
export { Images, ImagesSchema };
