import dns from 'node:dns';
import mongoose from 'mongoose';

// Fix Node.js DNS SRV resolution on Windows for mongodb+srv://
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore if custom dns servers cannot be set
}

const connectDB = async () => {
  let mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error('MONGO_URI is not configured in .env');
  }

  // Clean extra quotes if present
  mongoUri = mongoUri.replace(/^["']+|["']+$/g, '').trim();

  console.log('[CodeArena] Connecting to MongoDB...');

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    console.log(
      `[CodeArena] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`
    );

    return conn;
  } catch (error) {
    console.error('[CodeArena] Primary MongoDB Connection Error:', error.message);

    // If Atlas connection fails (e.g., IP whitelist or network issue), attempt fallback to local MongoDB
    const localUri = 'mongodb://127.0.0.1:27017/codearena';
    if (!mongoUri.includes('127.0.0.1') && !mongoUri.includes('localhost')) {
      console.log('[CodeArena] Attempting fallback to local MongoDB (127.0.0.1:27017)...');
      try {
        const localConn = await mongoose.connect(localUri, {
          serverSelectionTimeoutMS: 4000,
        });
        console.log(`[CodeArena] Local Fallback Connected: ${localConn.connection.host}/${localConn.connection.name}`);
        return localConn;
      } catch (localErr) {
        console.error('[CodeArena] Local fallback also failed:', localErr.message);
      }
    }

    process.exit(1);
  }
};

export default connectDB;