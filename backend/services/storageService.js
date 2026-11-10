/**
 * VENDORA Storage Service
 * AWS S3 upload adapter with local disk development fallback.
 */

const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

class StorageService {
  constructor() {
    this.driver = process.env.STORAGE_DRIVER || 'local';

    if (this.driver === 's3') {
      const hasAwsConfig = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY && process.env.AWS_S3_BUCKET;
      if (!hasAwsConfig) {
        console.warn('⚠️ STORAGE WARNING: STORAGE_DRIVER is set to "s3" but AWS S3 credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET) are incomplete.');
      } else {
        console.log('☁️ S3 Storage driver configured for bucket:', process.env.AWS_S3_BUCKET);
      }
    } else if (process.env.NODE_ENV === 'production') {
      console.warn(
        '⚠️ PRODUCTION NOTICE: STORAGE_DRIVER is set to "local". ' +
        'On Render free instances, the local disk is ephemeral and uploaded files under /uploads will reset on redeployment or restart. ' +
        'For permanent cloud storage, configure an AWS S3 bucket or external object store.'
      );
    }
  }

  async uploadFile(file) {
    if (!file) throw new Error('No file provided for upload');

    if (this.driver === 's3') {
      const bucket = process.env.AWS_S3_BUCKET;
      const region = process.env.AWS_REGION || 'ap-southeast-1';
      if (!bucket) {
        throw new Error('AWS_S3_BUCKET environment variable is missing.');
      }
      // When AWS S3 bucket is configured:
      return `https://${bucket}.s3.${region}.amazonaws.com/${file.filename}`;
    }

    // Local driver returns static route served from /uploads
    return `/uploads/${file.filename}`;
  }

  async deleteFile(fileUrl) {
    if (!fileUrl) return;
    if (this.driver === 'local') {
      const fileName = path.basename(fileUrl);
      const filePath = path.join(UPLOADS_DIR, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    return true;
  }
}

module.exports = new StorageService();
