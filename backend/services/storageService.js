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

let s3ClientInstance = null;

class StorageService {
  constructor() {
    this.driver = process.env.STORAGE_DRIVER || 'local';
    this.bucket = process.env.AWS_S3_BUCKET || '';
    this.region = process.env.AWS_REGION || 'ap-southeast-1';

    if (this.driver === 's3') {
      const hasAwsCredentials =
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        this.bucket;

      if (!hasAwsCredentials) {
        console.warn(
          '⚠️ STORAGE WARNING: STORAGE_DRIVER is "s3", but required AWS credentials ' +
          '(AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET) are incomplete. ' +
          'Temporarily falling back to local filesystem storage.'
        );
        this.driver = 'local';
      } else {
        try {
          const { S3Client } = require('@aws-sdk/client-s3');
          s3ClientInstance = new S3Client({
            region: this.region,
            credentials: {
              accessKeyId: process.env.AWS_ACCESS_KEY_ID,
              secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
          });
          console.log(`☁️ AWS S3 Client operational for bucket: ${this.bucket} (${this.region})`);
        } catch (err) {
          console.error('❌ Failed to initialize AWS S3 Client:', err.message);
          this.driver = 'local';
        }
      }
    }

    if (this.driver === 'local' && process.env.NODE_ENV === 'production') {
      console.warn(
        '⚠️ PRODUCTION NOTICE: Temporary local storage active at /uploads. ' +
        'On Render free instances, the local disk is ephemeral and uploaded media will not persist across service restarts or redeployments. ' +
        'To persist uploads permanently, configure AWS S3 environment variables.'
      );
    }
  }

  async uploadFile(file) {
    if (!file) throw new Error('No file provided for upload');

    // If AWS S3 is operational: stream binary to S3 bucket
    if (this.driver === 's3' && s3ClientInstance) {
      const { PutObjectCommand } = require('@aws-sdk/client-s3');
      const fileStream = fs.createReadStream(file.path);
      const uniqueKey = `products/${Date.now()}-${file.filename}`;

      await s3ClientInstance.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: uniqueKey,
          Body: fileStream,
          ContentType: file.mimetype,
        })
      );

      // Clean up local temp file once binary is committed to S3
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${uniqueKey}`;
    }

    // Local temporary driver: return path served statically from /uploads
    return `/uploads/${file.filename}`;
  }

  async deleteFile(fileUrl) {
    if (!fileUrl) return;

    if (this.driver === 's3' && s3ClientInstance && fileUrl.includes('.amazonaws.com/')) {
      const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
      const key = fileUrl.split('.amazonaws.com/')[1];
      if (key) {
        await s3ClientInstance.send(
          new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
          })
        );
      }
      return true;
    }

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
