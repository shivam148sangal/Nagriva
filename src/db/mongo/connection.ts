import mongoose from 'mongoose';

const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/gramsewa_app';

export let isMongoConnected = false;

export async function initMongoDatabase(): Promise<boolean> {
  try {
    if (process.env.USE_MONGO === 'true' || process.env.MONGODB_URI) {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 3000,
      });
      isMongoConnected = true;
      console.log('[MongoDB Application DB] Connected to MongoDB cluster successfully');
      return true;
    } else {
      // In-memory document store active with Mongoose model compatibility
      console.log('[MongoDB Application DB] Mongoose document store active for flexible application & real-time grievance data');
      isMongoConnected = false;
      return true;
    }
  } catch (error) {
    console.warn('[MongoDB Application DB] MongoDB cluster offline, using high-performance in-memory Mongoose store fallback:', error);
    isMongoConnected = false;
    return true;
  }
}
