import mongoose, { Mongoose } from 'mongoose';

// Define the type for the cached connection
interface CachedConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Type guard to check if a value is a Mongoose instance
function isMongoose(value: any): value is Mongoose {
  return value && typeof value === 'object' && 'connection' in value;
}

declare global {
  // This preserves the mongoose connection across hot reloads in development
  // eslint-disable-next-line no-var
  var mongoose: CachedConnection;
}

// Check if authentication is enabled
const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED !== 'false';

// Only validate MongoDB URI if authentication is enabled
if (authEnabled && !process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

const MONGODB_URI: string = process.env.MONGODB_URI;

// Initialize the cached connection
const globalWithMongoose = global as typeof globalThis & {
  mongoose: CachedConnection;
};

let cached = globalWithMongoose.mongoose;

if (!cached) {
  cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<Mongoose | null> {
  // If authentication is disabled, return null without attempting connection
  if (process.env.NEXT_PUBLIC_AUTH_ENABLED === 'false') {
    console.log('Authentication is disabled, skipping MongoDB connection');
    return null;
  }
  if (cached.conn) {
    // Test the connection before returning it
    try {
      // Add null check for connection and db
      if (cached.conn.connection?.db) {
        await cached.conn.connection.db.admin().ping();
        return cached.conn;
      }
      console.warn('Cached connection exists but is not properly connected, reconnecting...');
      cached.conn = null;
    } catch (error) {
      console.warn('Cached connection is not healthy, reconnecting...', error);
      cached.conn = null;
    }
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10, // Maximum number of connections in the connection pool
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      retryReads: true,
      connectTimeoutMS: 10000, // 10s timeout for initial connection
    };

    console.log('Creating new MongoDB connection...');
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null; // Clear the promise on error to allow retry
        throw error;
      });
  }

  try {
    const conn = await cached.promise;
    
    if (!conn || !isMongoose(conn)) {
      throw new Error('Failed to establish a valid MongoDB connection');
    }
    
    cached.conn = conn;
    
    // Set up event listeners for connection health
    mongoose.connection.on('connected', () => {
      console.log('MongoDB connected');
    });

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
      cached.conn = null;
      cached.promise = null;
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      cached.conn = null;
      cached.promise = null;
    });
    
    return conn;
  } catch (e) {
    console.error('Failed to connect to MongoDB:', e);
    cached.conn = null;
    cached.promise = null;
    throw e;
  }
}

export default dbConnect;
