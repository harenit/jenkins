import mongoose from "mongoose";

let isConnecting = false;

const defaultOptions = {
  serverSelectionTimeoutMS: 5000,
  tlsAllowInvalidCertificates: true,
};

/**
 * Connects to MongoDB Atlas (or local Mongo URI) using Mongoose.
 * Automatically allows invalid certificates when running behind local
 * antivirus, corporate SSL inspection, or Windows certificate bundles.
 */
export async function connectDB(onConnectedCallback) {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error("[db] MONGODB_URI is not set. Copy backend/.env.example to backend/.env and fill it in.");
    return false;
  }

  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (isConnecting) return false;
  isConnecting = true;

  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(uri, defaultOptions);
    console.log(`[db] MongoDB connected -> host: ${conn.connection.host}, db: ${conn.connection.name}`);
    isConnecting = false;
    if (onConnectedCallback) await onConnectedCallback();
    return true;
  } catch (err) {
    isConnecting = false;
    console.error("[db] MongoDB connection notice:", err.message);
    console.error("[db] If using MongoDB Atlas, verify your current public IP is allow-listed in Atlas Network Access: https://cloud.mongodb.com -> Security -> Network Access.");
    console.warn("[db] Retrying MongoDB connection in background...");

    // Schedule background retry
    const retryInterval = setInterval(async () => {
      if (mongoose.connection.readyState === 1) {
        clearInterval(retryInterval);
        return;
      }
      try {
        const conn = await mongoose.connect(uri, defaultOptions);
        console.log(`[db] MongoDB reconnected -> host: ${conn.connection.host}, db: ${conn.connection.name}`);
        clearInterval(retryInterval);
        if (onConnectedCallback) await onConnectedCallback();
      } catch {
        // Will retry again on next tick
      }
    }, 10000);

    return false;
  }
}

export default connectDB;
