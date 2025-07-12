import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Images, ImagesSchema } from '../images/Images.js';
import { EJSON } from 'meteor/ejson';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import svgCaptcha from 'svg-captcha';

// Store captcha sessions temporarily
const captchaSessions = new Map();

Meteor.methods({
  /**
   * Generate a new captcha
   * @returns {Object} captcha data with sessionId and svg
   */
  'images.generateCaptcha'() {
    const captcha = svgCaptcha.create({
      size: 6,
      noise: 3,
      color: true,
      background: '#f0f0f0',
    });
    
    const sessionId = uuidv4();
    captchaSessions.set(sessionId, {
      text: captcha.text.toLowerCase(),
      createdAt: new Date(),
    });
    
    // Clean up old sessions (older than 10 minutes)
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    for (const [id, session] of captchaSessions.entries()) {
      if (session.createdAt < tenMinutesAgo) {
        captchaSessions.delete(id);
      }
    }
    
    return {
      sessionId,
      captchaSvg: captcha.data,
    };
  },

  /**
   * Upload an image with captcha verification
   * @param {Object} imageData - The image data
   * @param {String} captchaSessionId - The captcha session ID
   * @param {String} captchaText - The user's captcha input
   */
  async 'images.upload'(imageData, captchaSessionId, captchaText) {
    check(imageData, {
      fileName: String,
      mimeType: String,
      base64Data: String,
    });
    check(captchaSessionId, String);
    check(captchaText, String);

    // Verify captcha
    const captchaSession = captchaSessions.get(captchaSessionId);
    if (!captchaSession) {
      throw new Meteor.Error('captcha-expired', 'Captcha session expired or invalid');
    }
    
    if (captchaSession.text !== captchaText.toLowerCase()) {
      throw new Meteor.Error('captcha-invalid', 'Invalid captcha text');
    }
    
    // Remove the used captcha session
    captchaSessions.delete(captchaSessionId);

    // Validate image type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(imageData.mimeType)) {
      throw new Meteor.Error('invalid-file-type', 'Only image files are allowed');
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    const binaryData = Buffer.from(imageData.base64Data, 'base64');
    const fileSize = binaryData.length;
    if (fileSize > maxSize) {
      throw new Meteor.Error('file-too-large', 'File size must be less than 5MB');
    }

    // Generate UUID and SHA256 hash
    const uuid = uuidv4();
    const sha256Hash = crypto
      .createHash('sha256')
      .update(binaryData)
      .digest('hex');

    // Check if image already exists (duplicate check)
    const existingImage = await Images.findOneAsync({ sha256Hash });
    if (existingImage) {
      throw new Meteor.Error('duplicate-image', 'This image has already been uploaded');
    }

    // Create the image document
    const imageDoc = {
      uuid,
      sha256Hash,
      imageData: binaryData, // Store Buffer directly
      fileName: imageData.fileName,
      mimeType: imageData.mimeType,
      fileSize,
      uploadedAt: new Date(),
      uploadedBy: this.userId || null,
    };

    // Validate the document (skip imageData validation for binary)
    const docForValidation = { ...imageDoc };
    delete docForValidation.imageData; // Remove binary data for Joi validation
    
    const validationSchema = ImagesSchema.fork('imageData', (schema) => schema.optional());
    const { error } = validationSchema.validate(docForValidation);
    if (error) {
      throw new Meteor.Error('validation-error', error.details[0].message);
    }

    // Insert the image
    const imageId = await Images.insertAsync(imageDoc);

    return {
      imageId,
      uuid,
      sha256Hash,
    };
  },

  /**
   * Get image by UUID
   * @param {String} uuid - The image UUID
   */
  async 'images.getByUuid'(uuid) {
    check(uuid, String);
    
    const image = await Images.findOneAsync({ uuid });
    if (!image) {
      throw new Meteor.Error('image-not-found', 'Image not found');
    }
    
    // Convert binary data back to base64 for client
    const base64Data = Buffer.from(image.imageData).toString('base64');
    
    return {
      uuid: image.uuid,
      fileName: image.fileName,
      mimeType: image.mimeType,
      fileSize: image.fileSize,
      uploadedAt: image.uploadedAt,
      imageData: base64Data,
    };
  },

  /**
   * Get image metadata by UUID (without binary data for performance)
   * @param {String} uuid - The image UUID
   */
  async 'images.getMetadataByUuid'(uuid) {
    check(uuid, String);
    
    const image = await Images.findOneAsync({ uuid }, {
      fields: {
        uuid: 1,
        fileName: 1,
        mimeType: 1,
        fileSize: 1,
        uploadedAt: 1,
        sha256Hash: 1,
        // Exclude imageData for performance
      }
    });
    
    if (!image) {
      throw new Meteor.Error('image-not-found', 'Image not found');
    }
    
    return image;
  },

  /**
   * Get multiple images metadata by UUIDs (for listing/admin views)
   * @param {Array} uuids - Array of image UUIDs
   */
  async 'images.getMultipleMetadata'(uuids) {
    check(uuids, [String]);
    
    if (uuids.length > 50) {
      throw new Meteor.Error('too-many-requests', 'Maximum 50 UUIDs allowed per request');
    }
    
    const images = await Images.find(
      { uuid: { $in: uuids } },
      {
        fields: {
          uuid: 1,
          fileName: 1,
          mimeType: 1,
          fileSize: 1,
          uploadedAt: 1,
          sha256Hash: 1,
          uploadedBy: 1,
          // Exclude imageData for performance
        }
      }
    ).fetchAsync();
    
    return images;
  },
});
