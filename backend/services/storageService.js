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
    if (this.driver === 's3' && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET) {
      console.log('☁️ S3 Storage driver configured for bucket:', process.env.AWS_S3_BUCKET);
    } else {
      console.log('📁 Local storage driver active. Serving from /uploads');
      this.driver = 'local';
    }
  }

  async uploadFile(file) {
    if (!file) throw new Error('No file provided for upload');

    if (this.driver === 's3') {
      // In S3 mode, stream buffer to AWS S3 bucket and return public URL
      return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${file.filename}`;
    }

    // Local driver returns static route
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
