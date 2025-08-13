import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
// Note: file-type v16+ is ESM-only, use dynamic import
// import { fileTypeFromBuffer } from "file-type";
import { Images, ImagesSchema } from "./Images";
import { isCaptchaSolved, useCaptcha } from "../captcha/Captcha";

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
        fit: "inside",
        withoutEnlargement: true,
      });
    }

    // Get uncompressed PNG first (for hash calculation)
    const uncompressedPng = await workingInstance
      .png({ compressionLevel: 0 }) // No compression for original hash
      .toBuffer();

    // Now compress the PNG efficiently
    let compressionLevel = 6; // Start with medium compression
    let compressed = await sharp(uncompressedPng).toBuffer();

    // If still too large, increase compression level
    while (compressed.length > targetSizeBytes && compressionLevel < 9) {
      compressionLevel++;
      compressed = await sharp(uncompressedPng)
        .png({ compressionLevel: compressionLevel, effort: 6 })
        .toBuffer();
    }

    // If still too large even with maximum PNG compression, reduce dimensions
    if (compressed.length > targetSizeBytes) {
      let scaleFactor = 0.79;
      const originalWidth = metadata.width > 2048 ? 2048 : metadata.width;
      const originalHeight = metadata.height > 2048 ? 2048 : metadata.height;

      while (compressed.length > targetSizeBytes && scaleFactor > 0.3) {
        const newWidth = Math.round(originalWidth * scaleFactor);
        const newHeight = Math.round(originalHeight * scaleFactor);

        const resizedPng = await sharp(inputBuffer)
          .resize(newWidth, newHeight, {
            fit: "inside",
            kernel: sharp.kernel.nearest,
          })
          .png({ compressionLevel: 0 })
          .toBuffer();

        compressed = await sharp(resizedPng)
          .png({ compressionLevel: 9, effort: 6 })
          .toBuffer();

        scaleFactor -= 0.15;
      }
    }

    return {
      uncompressedBuffer: uncompressedPng,
      compressedBuffer: compressed,
      originalSize: inputBuffer.length,
      uncompressedSize: uncompressedPng.length,
      compressedSize: compressed.length,
      compressionRatio: (1 - compressed.length / uncompressedPng.length) * 100,
    };
  } catch (error) {
    throw new Meteor.Error(
      "compression-failed",
      `Image compression failed: ${error.message}`,
    );
  }
};

Meteor.methods({
  /**
   * Upload an image with captcha verification
   * @param {Object} imageData - The image data
   * @param {String} captchaSessionId - The captcha session ID
   */
  async "images.upload"(imageData, captchaSessionId) {
    check(imageData, {
      fileName: String,
      mimeType: String,
      base64Data: String,
    });
    check(captchaSessionId, String);

    // Verify captcha
    if (!(await isCaptchaSolved(captchaSessionId))) {
      throw new Meteor.Error(
        "captcha-not-solved",
        "Please complete the security verification",
      );
    }

    // Use the captcha (invalidate it)
    await useCaptcha(captchaSessionId);

    // Get binary data for server-side validation
    const originalBinaryData = Buffer.from(imageData.base64Data, "base64");

    // Server-side file type validation using file signatures (magic bytes)
    const { fileTypeFromBuffer } = await import("file-type");
    const fileType = await fileTypeFromBuffer(originalBinaryData);
    const allowedMimeTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    const allowedExtensions = ["jpg", "jpeg", "png", "gif", "webp"];

    // Validate actual file type matches detected signature
    if (!fileType || !allowedMimeTypes.includes(fileType.mime) || !allowedExtensions.includes(fileType.ext)) {
      throw new Meteor.Error(
        "invalid-file-type",
        "File type not allowed. Only JPEG, PNG, GIF, and WebP images are supported.",
      );
    }

    // Additional security: Validate client-provided MIME type matches detected type
    const mimeTypeMismatch = imageData.mimeType !== fileType.mime
      && !(imageData.mimeType === "image/jpg" && fileType.mime === "image/jpeg");

    if (mimeTypeMismatch) {
      throw new Meteor.Error(
        "mime-type-mismatch",
        "File type mismatch detected. Upload rejected for security.",
      );
    }

    // Validate file extension from filename
    const fileExtension = imageData.fileName.split(".").pop()?.toLowerCase();
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      throw new Meteor.Error(
        "invalid-file-extension",
        "Invalid file extension. Only .jpg, .jpeg, .png, .gif, and .webp files are allowed.",
      );
    }

    // Validate file size (max 20MB for upload)
    const maxUploadSize = 20 * 1024 * 1024; // 20MB in bytes
    const originalFileSize = originalBinaryData.length;
    if (originalFileSize > maxUploadSize) {
      throw new Meteor.Error(
        "file-too-large",
        "File size must be less than 20MB",
      );
    }

    // Convert to PNG and compress the image to target size (0.75MB)
    console.log(
      `Converting and compressing image: ${imageData.fileName} (${(originalFileSize / 1024 / 1024).toFixed(2)}MB)`,
    );
    const compressionResult = await compressImage(originalBinaryData);
    const binaryData = compressionResult.compressedBuffer;
    const uncompressedData = compressionResult.uncompressedBuffer;
    const fileSize = binaryData.length;

    console.log(
      `Compression complete: ${(originalFileSize / 1024 / 1024).toFixed(2)}MB → ${(fileSize / 1024).toFixed(2)}KB (${compressionResult.compressionRatio.toFixed(1)}% reduction)`, // eslint-disable-line
    );

    // Generate UUID and SHA256 hashes
    const uuid = uuidv4();

    // Hash from uncompressed PNG data
    const sha256Hash = crypto
      .createHash("sha256")
      .update(uncompressedData)
      .digest("hex");

    // Hash from compressed PNG data
    const compressedSha256Hash = crypto
      .createHash("sha256")
      .update(binaryData)
      .digest("hex");

    // Check if image already exists (check both hashes)
    const existingImage = await Images.findOneAsync({
      $or: [{ sha256Hash }, { compressedSha256Hash }],
    });
    if (existingImage) {
      return {
        imageId: existingImage._id,
        uuid: existingImage.uuid,
        sha256Hash: existingImage.sha256Hash,
        compressedSha256Hash: existingImage.compressedSha256Hash,
        originalFileSize: existingImage.originalFileSize,
        compressedFileSize: existingImage.fileSize,
        compressionRatio: existingImage.compressionRatio,
        finalMimeType: "image/png",
      };
    }

    // Create the image document
    const imageDoc = {
      uuid,
      sha256Hash, // Hash of uncompressed PNG
      compressedSha256Hash, // Hash of compressed PNG
      imageData: binaryData, // Store compressed PNG Buffer
      fileName: imageData.fileName,
      mimeType: "image/png", // Always PNG now
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

    const validationSchema = ImagesSchema.fork("imageData", (schema) => schema.optional());
    const { error } = validationSchema.validate(docForValidation);
    if (error) {
      throw new Meteor.Error("validation-error", error.details[0].message);
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
      finalMimeType: "image/png",
    };
  },

  /**
   * Get image by UUID
   * @param {String} uuid - The image UUID
   */
  async "images.getByUuid"(uuid) {
    check(uuid, String);

    const image = await Images.findOneAsync({ uuid });
    if (!image) {
      throw new Meteor.Error("image-not-found", "Image not found");
    }

    // Convert binary data back to base64 for client
    const base64Data = Buffer.from(image.imageData).toString("base64");

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
  async "images.getMetadataByUuid"(uuid) {
    check(uuid, String);

    const image = await Images.findOneAsync(
      { uuid },
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
        },
      },
    );

    if (!image) {
      throw new Meteor.Error("image-not-found", "Image not found");
    }

    return image;
  },

  /**
   * Get multiple images metadata by UUIDs (for listing/admin views)
   * @param {Array} uuids - Array of image UUIDs
   */
  async "images.getMultipleMetadata"(uuids) {
    check(uuids, [String]);

    if (uuids.length > 50) {
      throw new Meteor.Error(
        "too-many-requests",
        "Maximum 50 UUIDs allowed per request",
      );
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
        },
      },
    ).fetchAsync();

    return images;
  },

  /**
   * Get image data by UUID for display
   * @param {String} uuid - The image UUID
   */
  async "images.getImageData"(uuid) {
    check(uuid, String);

    const image = await Images.findOneAsync({ uuid });
    if (!image) {
      throw new Meteor.Error("image-not-found", "Image not found");
    }

    return {
      imageData: image.imageData,
      mimeType: image.mimeType,
      fileName: image.fileName,
    };
  },
});
