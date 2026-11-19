/**
 * VENDORA Storage Service
 * MongoDB GridFS (₹0 permanent cloud storage) + AWS S3 + local disk adapters.
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

const UPLOADS_DIR = process.env.PERSISTENT_DISK_PATH || path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let s3ClientInstance = null;

class StorageService {
  constructor() {
    this.driver = process.env.STORAGE_DRIVER || 'gridfs';
    this.bucket = process.env.AWS_S3_BUCKET || '';
    this.region = process.env.AWS_REGION || 'ap-southeast-1';

    if (this.driver === 'gridfs') {
      console.log('📦 Storage Driver: MongoDB GridFS (₹0 persistent cloud storage enabled)');
    } else if (this.driver === 's3') {
      const hasAwsCredentials =
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY &&
        this.bucket;

      if (!hasAwsCredentials) {
        console.warn('⚠️ STORAGE WARNING: S3 credentials incomplete. Falling back to MongoDB GridFS.');
        this.driver = 'gridfs';
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
          console.log(`☁️ AWS S3 Client operational for bucket: ${this.bucket}`);
        } catch (err) {
          console.error('❌ Failed to initialize AWS S3 Client:', err.message);
          this.driver = 'gridfs';
        }
      }
    }
  }

  getGridFSBucket() {
    if (mongoose.connection.readyState === 1) {
      return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    }
    return null;
  }

  async uploadFile(file) {
    if (!file) throw new Error('No file provided for upload');

    // 1. MongoDB GridFS Driver (₹0 Zero-Cost Permanent Storage)
    if (this.driver === 'gridfs' || mongoose.connection.readyState === 1) {
      const bucket = this.getGridFSBucket();
      if (bucket) {
        const uploadStream = bucket.openUploadStream(file.filename, {
          contentType: file.mimetype,
          metadata: {
            originalname: file.originalname,
            size: file.size,
            uploadedAt: new Date(),
          },
        });

        const fileStream = fs.createReadStream(file.path);

        await new Promise((resolve, reject) => {
          fileStream.pipe(uploadStream)
            .on('finish', resolve)
            .on('error', reject);
        });

        // Clean up temporary local disk file now that it is stored permanently in Atlas
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }

        return `/uploads/${file.filename}`;
      }
    }

    // 2. AWS S3 Driver
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

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${uniqueKey}`;
    }

    // 3. Local fallback (e.g. offline dev without active DB)
    return `/uploads/${file.filename}`;
  }

  async deleteFile(fileUrl) {
    if (!fileUrl) return;

    // Delete from MongoDB GridFS
    if (fileUrl.startsWith('/uploads/')) {
      const filename = path.basename(fileUrl);
      const bucket = this.getGridFSBucket();
      if (bucket) {
        try {
          const files = await bucket.find({ filename }).limit(1).toArray();
          if (files.length > 0) {
            await bucket.delete(files[0]._id);
            return true;
          }
        } catch (err) {
          console.warn('GridFS delete error:', err.message);
        }
      }
    }

    // Delete from S3
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

    // Delete from local disk
    const fileName = path.basename(fileUrl);
    const filePath = path.join(UPLOADS_DIR, fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  }
}

module.exports = new StorageService();
