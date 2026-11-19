const mongoose = require('mongoose');

let mongoServerInstance = null;

/**
 * Safely sanitizes and normalizes MongoDB connection string,
 * encoding credentials if special characters exist.
 */
const normalizeMongoUri = (rawUri) => {
  if (!rawUri || !rawUri.startsWith('mongodb')) return rawUri;

  try {
    const protocolMatch = rawUri.match(/^(mongodb(?:\+srv)?:\/\/)(.*)$/);
    if (!protocolMatch) return rawUri;

    const protocol = protocolMatch[1];
    const rest = protocolMatch[2];

    // Check if auth credentials are present: username:password@host
    const atIndex = rest.lastIndexOf('@');
    if (atIndex === -1) return rawUri;

    const credentialsPart = rest.slice(0, atIndex);
    const hostAndPath = rest.slice(atIndex + 1);

    const colonIndex = credentialsPart.indexOf(':');
    if (colonIndex === -1) return rawUri;

    const username = credentialsPart.slice(0, colonIndex);
    const password = credentialsPart.slice(colonIndex + 1);

    const safeEncode = (str) => {
      try {
        return encodeURIComponent(decodeURIComponent(str));
      } catch {
        return encodeURIComponent(str);
      }
    };

    const safeUsername = safeEncode(username);
    const safePassword = safeEncode(password);

    return `${protocol}${safeUsername}:${safePassword}@${hostAndPath}`;
  } catch (err) {
    return rawUri;
  }
};

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    // Production strict requirement: MONGODB_URI (e.g. MongoDB Atlas) must be supplied
    if (process.env.NODE_ENV === 'production') {
      if (!uri) {
        throw new Error(
          'FATAL: MONGODB_URI environment variable is required in production mode. ' +
          'Embedded in-memory database fallback is strictly disabled for cloud deployments.'
        );
      }
    } else if (!uri) {
      console.log('ℹ️  No MONGODB_URI provided. Initializing local MongoMemoryServer for development/testing...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServerInstance = await MongoMemoryServer.create();
      uri = mongoServerInstance.getUri();
      console.log(`✅ Embedded MongoMemoryServer active at: ${uri}`);
    }

    const normalizedUri = normalizeMongoUri(uri);

    const connectOptions = {
      dbName: 'vendora',
      autoIndex: process.env.NODE_ENV !== 'production',
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    };

    // For MongoDB Atlas or remote authenticated clusters, default authSource to 'admin'
    // unless explicitly defined in the connection string parameters
    if (normalizedUri.includes('@') && !normalizedUri.includes('authSource=')) {
      connectOptions.authSource = 'admin';
    }

    const conn = await mongoose.connect(normalizedUri, connectOptions);

    console.log(`📦 MongoDB Connected: ${conn.connection.host} [Database: ${conn.connection.name}]`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);

    // Provide specific diagnostic troubleshooting for MongoDB authentication & Atlas issues
    if (error.message.includes('Authentication failed') || error.code === 8000) {
      console.error('\n🔒 MongoDB Authentication Diagnostic:');
      console.error('  1. Verify the username and password in MONGODB_URI.');
      console.error('  2. Confirm the Atlas database user has readWrite permissions on database "vendora".');
      console.error('  3. In MongoDB Atlas, verify that Network Access has 0.0.0.0/0 (Allow access from anywhere) enabled for cloud hosting.\n');
    } else if (error.message.includes('bad auth') || error.message.includes('auth failed')) {
      console.error('\n🔒 MongoDB Atlas Auth Error: Authentication database mismatch resolved by setting authSource=admin.\n');
    }

    if (process.env.NODE_ENV === 'production') {
      console.log('🔄 Will retry MongoDB Atlas connection in 15 seconds...');
      setTimeout(() => {
        connectDB().catch(() => {});
      }, 15000);
      return null;
    }

    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServerInstance) {
    await mongoServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB, normalizeMongoUri };
