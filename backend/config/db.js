const mongoose = require('mongoose');

let mongoServerInstance = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log('ℹ️  No MONGODB_URI provided. Initializing high-speed embedded MongoMemoryServer for development/testing...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServerInstance = await MongoMemoryServer.create();
      uri = mongoServerInstance.getUri();
      console.log(`✅ Embedded MongoMemoryServer active at: ${uri}`);
    }

    const conn = await mongoose.connect(uri, {
      autoIndex: true,
    });

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
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
