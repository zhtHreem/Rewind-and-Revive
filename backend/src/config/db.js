import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
dotenv.config();

// Some local networks refuse SRV lookups; use public DNS outside production.
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

// Cache the connection (and the in-flight promise) on `global` so warm
// serverless invocations reuse it instead of reconnecting on every request.
const cached = global._mongooseCache || (global._mongooseCache = { conn: null, promise: null });

const connectDB = async () => {
  if (cached.conn && mongoose.connection.readyState === 1) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGO_URI, {
        maxPoolSize: 5,                  // each serverless instance has its own pool; keep small
        maxIdleTimeMS: 30000,            // release idle connections quickly
        serverSelectionTimeoutMS: 5000,  // fail fast instead of hanging until the function times out
        socketTimeoutMS: 30000,
      })
      .then((m) => {
        console.log('MongoDB connected...');
        return m;
      })
      .catch((error) => {
        cached.promise = null; // allow the next request to retry
        console.error('Error connecting to MongoDB:', error.message);
        throw error;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
