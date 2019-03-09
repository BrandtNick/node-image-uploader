'use strict';
// image-uploader.js

// Modules
const fs = require('fs-extra');
const multer = require('multer');
const _ = require('lodash');

// Options
const allowedFormats = ['image/jpeg', 'image/png', 'image/gif']; // Image formats allowed to upload
const limits = 2 * 1024 * 1024; // 2 MB
const storage = multer.memoryStorage(); // storage type
const uploadDir = './public'; // Uploading directory

// Check if file is equal to an allowed format
const assertIsValidFormat = (req, file, cb) => {
  const acceptedFormat = _.includes(allowedFormats, file.mimetype);
  if (!acceptedFormat) {
    req.uploadError = 'This file needs to be of jpeg/png/gif format';
  }
  cb(null, acceptedFormat);
};

const assertCreateUniqueFileName = name => `${Date.now()}-${name}`; // Create unique file name using unix timestamp prefix

// Object of functions used to save and delete image uploaded
const imageUploader = {
  // Uploader used as express route middleware
  upload: multer({
    storage,
    limits,
    fileFilter: assertIsValidFormat,
  }).single('image'), // Can only upload a single image at a time

  async saveImage(image) {
    try {
      const uniqueFileName = assertCreateUniqueFileName(image.originalname);

      await fs.ensureDir(uploadDir); // Create dir
      await fs.writeFile(`${uploadDir}/${uniqueFileName}`, uniqueFileName); // Create file

      return `${uploadDir}/${uniqueFileName}`; // returns directory and filename
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  },

  async deleteImage(imageId) {
    try {
      await fs.unlink(`${uploadDir}/${imageId}`);

      return `${uploadDir}/${imageId}`; // returns directory and image id
    } catch (err) {
      console.error(`Error: ${err.message}`);
    }
  },
};

module.exports = imageUploader;
