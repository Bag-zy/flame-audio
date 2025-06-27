import { MongoClient, Db } from 'mongodb';

// Global cached connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

/**
 * Connects to the MongoDB database using the environment variables
 * @returns A MongoDB client and database instance
 */
export async function connectToDatabase() {
  // Return cached connection if available
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  try {
    // Get MongoDB connection string from environment variables
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
    const dbName = process.env.MONGODB_DB || 'flame-audio-db';

    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    // Connect to MongoDB
    const client = new MongoClient(uri, {
      // Connection options
      maxPoolSize: 10, // Maximum number of connections in the connection pool
      minPoolSize: 1,  // Minimum number of connections in the connection pool
      connectTimeoutMS: 10000, // Timeout for connection attempts
      socketTimeoutMS: 45000,  // Timeout for socket operations
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
    });

    await client.connect();
    const db = client.db(dbName);

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    console.log('Successfully connected to MongoDB');
    return { client, db };
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

/**
 * Closes the MongoDB connection
 */
export async function closeDatabaseConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
    console.log('MongoDB connection closed');
  }
}

/**
 * Gets a MongoDB collection
 * @param collectionName Name of the collection to get
 * @returns The MongoDB collection
 */
export async function getCollection<T extends Document>(collectionName: string) {
  const { db } = await connectToDatabase();
  return db.collection<T>(collectionName);
}

/**
 * Creates indexes for a collection
 * @param collectionName Name of the collection
 * @param indexes Array of index specifications
 */
export async function createIndexes(
  collectionName: string,
  indexes: { key: Record<string, number>, options?: any }[]
) {
  const collection = await getCollection(collectionName);
  
  for (const { key, options } of indexes) {
    await collection.createIndex(key, options);
  }
}

// Handle application termination
process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await closeDatabaseConnection();
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  await closeDatabaseConnection();
  process.exit(1);
});
