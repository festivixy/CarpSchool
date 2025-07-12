import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Images, ImagesSchema } from '../images/Images.js';
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
    const fileSize = Buffer.byteLength(imageData.base64Data, 'base64');
    if (fileSize > maxSize) {
      throw new Meteor.Error('file-too-large', 'File size must be less than 5MB');
    }

    // Generate UUID and SHA256 hash
    const uuid = uuidv4();
    const sha256Hash = crypto
      .createHash('sha256')
      .update(imageData.base64Data, 'base64')
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
      imageData: imageData.base64Data,
      fileName: imageData.fileName,
      mimeType: imageData.mimeType,
      fileSize,
      uploadedAt: new Date(),
      uploadedBy: this.userId || null,
    };

    // Validate the document
    const { error } = ImagesSchema.validate(imageDoc);
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
    
    return {
      uuid: image.uuid,
      fileName: image.fileName,
      mimeType: image.mimeType,
      fileSize: image.fileSize,
      uploadedAt: image.uploadedAt,
      imageData: image.imageData,
    };
  },
});
