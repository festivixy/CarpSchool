import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Images, ImagesSchema } from '../images/Images.js';
import { EJSON } from 'meteor/ejson';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import svgCaptcha from 'svg-captcha';
import sharp from 'sharp';

// Store captcha sessions temporarily
const captchaSessions = new Map();

// Image compression function - converts to PNG and compresses efficiently
const compressImage = async (inputBuffer, targetSizeKB = 750) => {
  try {
    const targetSizeBytes = targetSizeKB * 1024;
    
    // Convert to PNG first and get metadata
    const sharpInstance = sharp(inputBuffer);
    const metadata = await sharpInstance.metadata();
    
    // Resize if image is very large (max dimension 2048px)
    let workingInstance = sharpInstance;
    if (metadata.width > 2048 || metadata.height > 2048) {
      workingInstance = sharpInstance.resize(2048, 2048, { 
        fit: 'inside',
        withoutEnlargement: true 
      });
    }
    
    // Get uncompressed PNG first (for hash calculation)
    const uncompressedPng = await workingInstance
      .png({ compressionLevel: 0 }) // No compression for original hash
      .toBuffer();
    
    // Now compress the PNG efficiently
    let compressionLevel = 6; // Start with medium compression
    let compressed = await sharp(uncompressedPng)
      .png({ compressionLevel, effort: 10 })
      .toBuffer();
    
    // If still too large, increase compression level
    while (compressed.length > targetSizeBytes && compressionLevel < 9) {
      compressionLevel++;
      compressed = await sharp(uncompressedPng)
        .png({ compressionLevel, effort: 10 })
        .toBuffer();
    }
    
    // If still too large even with maximum PNG compression, reduce dimensions
    if (compressed.length > targetSizeBytes) {
      let scaleFactor = 0.9;
      const originalWidth = metadata.width > 2048 ? 2048 : metadata.width;
      const originalHeight = metadata.height > 2048 ? 2048 : metadata.height;
      
      while (compressed.length > targetSizeBytes && scaleFactor > 0.3) {
        const newWidth = Math.round(originalWidth * scaleFactor);
        const newHeight = Math.round(originalHeight * scaleFactor);
        
        const resizedPng = await sharp(inputBuffer)
          .resize(newWidth, newHeight, { fit: 'inside' })
          .png({ compressionLevel: 0 })
          .toBuffer();
        
        compressed = await sharp(resizedPng)
          .png({ compressionLevel: 9, effort: 10 })
          .toBuffer();
        
        scaleFactor -= 0.1;
      }
    }
    
    return {
      uncompressedBuffer: uncompressedPng,
      compressedBuffer: compressed,
      originalSize: inputBuffer.length,
      uncompressedSize: uncompressedPng.length,
      compressedSize: compressed.length,
      compressionRatio: (1 - compressed.length / uncompressedPng.length) * 100
    };
  } catch (error) {
    throw new Meteor.Error('compression-failed', `Image compression failed: ${error.message}`);
  }
};

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

    // Validate file size (max 20MB for upload)
    const maxUploadSize = 20 * 1024 * 1024; // 20MB in bytes
    const originalBinaryData = Buffer.from(imageData.base64Data, 'base64');
    const originalFileSize = originalBinaryData.length;
    if (originalFileSize > maxUploadSize) {
      throw new Meteor.Error('file-too-large', 'File size must be less than 20MB');
    }

    // Convert to PNG and compress the image to target size (0.75MB)
    console.log(`Converting and compressing image: ${imageData.fileName} (${(originalFileSize / 1024 / 1024).toFixed(2)}MB)`);
    const compressionResult = await compressImage(originalBinaryData);
    const binaryData = compressionResult.compressedBuffer;
    const uncompressedData = compressionResult.uncompressedBuffer;
    const fileSize = binaryData.length;
    
    console.log(`Compression complete: ${(originalFileSize / 1024 / 1024).toFixed(2)}MB → ${(fileSize / 1024).toFixed(2)}KB (${compressionResult.compressionRatio.toFixed(1)}% reduction)`);

    // Generate UUID and SHA256 hashes
    const uuid = uuidv4();
    
    // Hash from uncompressed PNG data
    const sha256Hash = crypto
      .createHash('sha256')
      .update(uncompressedData)
      .digest('hex');
    
    // Hash from compressed PNG data  
    const compressedSha256Hash = crypto
      .createHash('sha256')
      .update(binaryData)
      .digest('hex');

    // Check if image already exists (check both hashes)
    const existingImage = await Images.findOneAsync({ 
      $or: [
        { sha256Hash },
        { compressedSha256Hash }
      ]
    });
    if (existingImage) {
      throw new Meteor.Error('duplicate-image', 'This image has already been uploaded');
    }

    // Create the image document
    const imageDoc = {
      uuid,
      sha256Hash, // Hash of uncompressed PNG
      compressedSha256Hash, // Hash of compressed PNG
      imageData: binaryData, // Store compressed PNG Buffer
      fileName: imageData.fileName,
      mimeType: 'image/png', // Always PNG now
      fileSize, // Compressed file size
      originalFileSize, // Original upload file size
      uncompressedFileSize: compressionResult.uncompressedSize, // Uncompressed PNG size
      compressionRatio: compressionResult.compressionRatio,
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
      compressedSha256Hash,
      originalFileSize,
      compressedFileSize: fileSize,
      compressionRatio: compressionResult.compressionRatio,
      finalMimeType: 'image/png',
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
      originalFileSize: image.originalFileSize,
      uncompressedFileSize: image.uncompressedFileSize,
      compressionRatio: image.compressionRatio,
      uploadedAt: image.uploadedAt,
      sha256Hash: image.sha256Hash,
      compressedSha256Hash: image.compressedSha256Hash,
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
        originalFileSize: 1,
        uncompressedFileSize: 1,
        compressionRatio: 1,
        uploadedAt: 1,
        sha256Hash: 1,
        compressedSha256Hash: 1,
        uploadedBy: 1,
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
          originalFileSize: 1,
          uncompressedFileSize: 1,
          compressionRatio: 1,
          uploadedAt: 1,
          sha256Hash: 1,
          compressedSha256Hash: 1,
          uploadedBy: 1,
          // Exclude imageData for performance
        }
      }
    ).fetchAsync();
    
    return images;
  },
});
