import { Adapter, AdapterUser, AdapterSession, VerificationToken } from "next-auth/adapters";
import { MongoClient, ObjectId, Db, WithId, Document, MongoClientOptions } from 'mongodb';

// Extend the AdapterUser type to include our custom fields
interface UserDocument extends Omit<AdapterUser, 'id' | 'emailVerified'> {
  _id: ObjectId;
  emailVerified: Date | null;
  email: string;
  name?: string | null;
  image?: string | null;
}

// Extend the AdapterSession type to include our custom fields
interface SessionDocument extends Omit<AdapterSession, 'userId'> {
  _id: ObjectId;
  userId: ObjectId;
}

// Extend VerificationToken to include MongoDB _id
interface VerificationTokenDocument extends VerificationToken {
  _id: ObjectId;
}

// Enable debug logging
const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[MongoDB Adapter] ${message}`, data || '');
  }
}

function errorLog(message: string, error: unknown) {
  console.error(`[MongoDB Adapter Error] ${message}`, error);
}

export function MongoDBAdapter(uri: string): Adapter {
  let client: MongoClient;
  let db: Db;
  let isConnected = false;

    // Connect to MongoDB
  async function connect() {
    try {
      // If we have a connection and it's healthy, use it
      if (isConnected && client) {
        try {
          // Test the connection
          await client.db().admin().ping();
          debugLog('Using existing MongoDB connection');
          return { client, db };
        } catch (err) {
          // Connection is not healthy, reset and reconnect
          debugLog('Existing connection is not healthy, reconnecting...');
          isConnected = false;
          if (client) {
            await client.close().catch(console.error);
          }
        }
      }

      debugLog('Creating new MongoDB connection');
      
      // Create new client with connection pooling and timeouts
      client = new MongoClient(uri, {
        connectTimeoutMS: 10000, // 10 seconds
        socketTimeoutMS: 30000,  // 30 seconds
        serverSelectionTimeoutMS: 10000, // 10 seconds
        maxPoolSize: 10, // Maximum number of connections in the connection pool
        minPoolSize: 1,  // Minimum number of connections in the connection pool
        maxIdleTimeMS: 10000, // Maximum time a connection can remain idle in the pool
        retryWrites: true,
        retryReads: true,
      } as MongoClientOptions);
      
      // Set up event listeners
      client.on('serverHeartbeatSucceeded', () => {
        debugLog('MongoDB heartbeat succeeded');
      });
      
      client.on('serverHeartbeatFailed', (event) => {
        errorLog('MongoDB heartbeat failed', event);
        isConnected = false;
      });
      
      // Connect to MongoDB
      await client.connect();
      
      // Get the database from the connection string or use the default
      const dbName = new URL(uri).pathname.replace(/^\//, '') || 'flame-audio-db';
      db = client.db(dbName);
      
      // Test the connection
      await db.command({ ping: 1 });
      
      isConnected = true;
      debugLog('Successfully connected to MongoDB');
      
      return { client, db };
    } catch (error) {
      isConnected = false;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errorLog('Failed to connect to MongoDB', errorMessage);
      throw new Error(`MongoDB connection failed: ${errorMessage}`);
    }
  }

  // Helper to convert MongoDB _id to string and ensure proper typing
  function toObjectId(id: string | ObjectId | undefined | null): ObjectId {
    if (!id) throw new Error('ID is required');
    try {
      return id instanceof ObjectId ? id : new ObjectId(id);
    } catch (error) {
      throw new Error(`Invalid ID format: ${id}`);
    }
  }
  function toDocument<T extends { id?: string }>(doc: WithId<Document> | null, collection?: string): T | null {
    if (!doc) {
      debugLog(`No document found${collection ? ` in collection ${collection}` : ''}`);
      return null;
    }
    try {
      const { _id, ...rest } = doc;
      const result = { ...rest, id: _id.toString() } as unknown as T;
      debugLog(`Converted document from collection ${collection || 'unknown'}:`, { id: result.id });
      return result;
    } catch (error) {
      errorLog(`Error converting document from collection ${collection || 'unknown'}`, error);
      return null;
    }
  }

  return {
    async createUser(userData: Omit<AdapterUser, 'id'>) {
      const { db } = await connect();
      if (!db) {
        throw new Error('Database connection failed');
      }
      
      // Create a new user document with required fields
      const newUser: UserDocument = {
        _id: new ObjectId(),
        ...userData,
        emailVerified: userData.emailVerified ? new Date(userData.emailVerified) : null,
      };
      
      // Insert the new user
      await db.collection<UserDocument>('users').insertOne(newUser);
      
      // Return the user data without MongoDB's _id
      const { _id, ...userWithoutId } = newUser;
      return { 
        ...userWithoutId, 
        id: _id.toString() 
      } as AdapterUser;
    },

    async getUser(id: string) {
      if (!id) {
        console.error('No ID provided to getUser');
        return null;
      }
      
      const { db } = await connect();
      if (!db) {
        console.error('Database connection failed in getUser');
        return null;
      }
      
      try {
        const userId = toObjectId(id);
        const user = await db.collection('users').findOne({ _id: userId });
        
        if (!user) {
          debugLog('User not found with ID:', id);
          return null;
        }
        
        const { _id, ...userData } = user;
        return { 
          ...userData, 
          id: _id.toHexString() 
        } as AdapterUser;
      } catch (error) {
        errorLog('Error in getUser:', error);
        return null;
      }
    },

    async getUserByEmail(email: string) {
      if (!email) return null;
      const { db } = await connect();
      try {
        const user = await db.collection('users').findOne({ email });
        if (!user) return null;
        const { _id, ...userData } = user;
        return { ...userData, id: _id.toHexString() } as AdapterUser;
      } catch (error) {
        console.error('Error getting user by email:', error);
        return null;
      }
    },

    async getUserByAccount({ providerAccountId, provider }: { providerAccountId: string; provider: string }) {
      const { db } = await connect();
      if (!db) {
        console.error('Database connection failed in getUserByAccount');
        return null;
      }
      
      try {
        const account = await db.collection('accounts').findOne<{ userId: ObjectId | string }>({
          providerAccountId,
          provider,
        } as any);
        
        if (!account || !account.userId) return null;
        
        // Safely convert userId to string
        const userId = account.userId instanceof ObjectId 
          ? account.userId.toString() 
          : account.userId;
          
        // Use a type assertion to ensure TypeScript knows this is safe
        const user = await (this as any).getUser(userId);
        if (!user) return null;
        
        return user;
      } catch (error) {
        console.error('Error getting user by account:', error);
        return null;
      }
    },

    async updateUser(user: Partial<AdapterUser> & { id: string }) {
      const { db } = await connect();
      if (!db) {
        throw new Error('Database connection failed in updateUser');
      }
      
      const { id, ...updateData } = user;
      
      try {
        // Convert emailVerified to Date if it exists
        const update: any = { ...updateData };
        if ('emailVerified' in updateData && updateData.emailVerified !== undefined) {
          update.emailVerified = updateData.emailVerified ? new Date(updateData.emailVerified) : null;
        }
        
        await db.collection('users').updateOne(
          { _id: toObjectId(id) },
          { $set: update },
          { upsert: true }
        );
        
        // Use a type assertion to ensure TypeScript knows this is safe
        const updatedUser = await (this as any).getUser(id);
        if (!updatedUser) {
          console.error('User not found after update:', id);
          throw new Error('User not found after update');
        }
        return updatedUser;
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    },

    async deleteUser(userId) {
      const { db } = await connect();
      await db.collection('users').deleteOne({ _id: new ObjectId(userId) });
    },

    async linkAccount(account) {
      const { db } = await connect();
      await db.collection('accounts').insertOne({
        ...account,
        userId: new ObjectId(account.userId),
      });
      return account;
    },

    async unlinkAccount({ providerAccountId, provider }) {
      const { db } = await connect();
      await db.collection('accounts').deleteOne({
        providerAccountId,
        provider,
      });
    },

    async createSession(session: AdapterSession) {
      const { db } = await connect();
      
      // Ensure we have a valid userId
      if (!session.userId) {
        throw new Error('Cannot create session: No userId provided');
      }
      
      // Convert userId to ObjectId if it's a string
      const userId = typeof session.userId === 'string' 
        ? toObjectId(session.userId)
        : session.userId;
      
      const sessionData = {
        ...session,
        _id: new ObjectId(),
        userId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      debugLog('Creating new session:', {
        userId: sessionData.userId.toString(),
        expires: sessionData.expires
      });
      
      await db.collection('sessions').insertOne(sessionData);
      
      // Return the session in the format expected by NextAuth
      const result = {
        ...session,
        id: sessionData._id.toString(),
      };
      
      debugLog('Session created successfully:', result);
      return result;
    },

    async getSessionAndUser(sessionToken: string) {
      const { db } = await connect();
      
      try {
        if (!db) {
          console.error('Database connection failed in getSessionAndUser');
          return null;
        }
        
        debugLog('Looking up session with token:', sessionToken);
        const session = await db.collection<SessionDocument>('sessions').findOne({ 
          sessionToken,
          expires: { $gt: new Date() } // Only return non-expired sessions
        });
        
        if (!session) {
          debugLog('No valid session found for token:', sessionToken);
          return null;
        }
        
        if (!session.userId) {
          debugLog('Session found but missing userId:', session);
          return null;
        }
        
        const userId = session.userId.toString();
        debugLog('Session found, fetching user with ID:', userId);
        
        try {
          // Define getUser function locally to avoid 'this' context issues
          const getUser = async (userId: string) => {
            if (!userId) {
              console.error('No ID provided to getUser');
              return null;
            }
            
            try {
              const userIdObj = toObjectId(userId);
              const user = await db.collection('users').findOne({ _id: userIdObj });
              
              if (!user) {
                debugLog('User not found with ID:', userId);
                return null;
              }
              
              const { _id, ...userData } = user;
              return { 
                ...userData, 
                id: _id.toHexString() 
              } as AdapterUser;
            } catch (error) {
              errorLog('Error in getUser:', error);
              return null;
            }
          };
          
          const user = await getUser(userId);
          
          if (!user) {
            debugLog('User not found for session, cleaning up orphaned session');
            // Clean up orphaned session
            await db.collection('sessions').deleteOne({ sessionToken });
            return null;
          }
          
          // Transform session to match AdapterSession type
          const adapterSession: AdapterSession = {
            sessionToken: sessionToken,
            userId: userId,
            expires: session.expires,
          };
          
          debugLog('Successfully retrieved session and user:', {
            sessionToken: adapterSession.sessionToken,
            userId: adapterSession.userId,
            userEmail: user.email || 'no-email'
          });
          
          return {
            session: adapterSession,
            user,
          };
        } catch (error: unknown) {
          errorLog('Error fetching user for session:', error);
          return null;
        }
      } catch (error: unknown) {
        errorLog('Error in getSessionAndUser:', error);
        return null;
      }
    },

    async updateSession(session: Partial<AdapterSession> & Pick<AdapterSession, 'sessionToken'>) {
      const { db } = await connect();
      const { sessionToken } = session;
      
      try {
        if (!sessionToken) {
          throw new Error('No sessionToken provided for update');
        }
        
        // Only include fields that should be updated
        const updateData: Partial<AdapterSession> = {};
        if (session.expires) updateData.expires = session.expires;
        if (session.userId) updateData.userId = session.userId;
        
        debugLog('Updating session:', { sessionToken, updateData });
        
        await db.collection('sessions').updateOne(
          { sessionToken },
          { $set: updateData },
          { upsert: true }
        );
        
        // Return the updated session
        const updated = await db.collection<SessionDocument>('sessions').findOne({ sessionToken });
        
        if (!updated || !updated.userId) {
          errorLog('Failed to find updated session:', { sessionToken });
          return null;
        }
        
        const result = {
          sessionToken: updated.sessionToken,
          userId: updated.userId.toString(),
          expires: updated.expires,
        };
        
        debugLog('Successfully updated session:', result);
        return result;
      } catch (error: unknown) {
        errorLog('Error in updateSession:', error);
        return null;
      }
    },  

    async deleteSession(sessionToken: string) {
      const { db } = await connect();
      // Get the session before deleting it to return it
      const session = await db.collection('sessions').findOne({ sessionToken });
      if (!session) return null;
      
      await db.collection('sessions').deleteOne({ sessionToken });
      
      // Return the deleted session
      return {
        sessionToken: session.sessionToken,
        userId: session.userId.toString(),
        expires: session.expires,
      };
    },

    async createVerificationToken(verificationToken: VerificationToken) {
      const { db } = await connect();
      const tokenToInsert: VerificationTokenDocument = {
        ...verificationToken,
        _id: new ObjectId(),
      };
      
      await db.collection('verification_tokens').insertOne(tokenToInsert);
      
      // Return the verification token without the _id field
      const { _id, ...tokenData } = tokenToInsert;
      return tokenData as VerificationToken;
    },

    async useVerificationToken(params: { identifier: string; token: string }) {
      const { db } = await connect();
      // First find the token
      const tokenDoc = await db.collection<VerificationTokenDocument>('verification_tokens').findOne({
        identifier: params.identifier,
        token: params.token,
      });
      
      if (!tokenDoc) return null;
      
      // Then delete it
      await db.collection('verification_tokens').deleteOne({ _id: tokenDoc._id });
      
      // Return the verification token without the _id field
      const { _id, ...tokenData } = tokenDoc;
      return tokenData as VerificationToken;
    },
  };
}
