const mongoose = require('mongoose');

let mongoServerInstance = null;

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

    const conn = await mongoose.connect(uri, {
      dbName: 'vendora',
      autoIndex: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host} [Database: ${conn.connection.name}]`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoServerInstance) {
    await mongoServerInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
