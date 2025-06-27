import { MongoClient, Db, Collection, Document, UpdateFilter, WithId, Filter, ObjectId } from 'mongodb';

// Define the base record type
export interface BaseRecord extends Document {
  _id?: ObjectId;
  key: string;
  group_id: string | null;
  updated_at: number;
  created_at?: Date;
}

// Type definitions
export interface UpdateOptions {
  group_ids?: (string | null)[];
  time_at_least?: number;
}

export type ExistsResult = boolean[];
export type ListResult = string[];

export interface ListOptions {
  before?: number;
  after?: number;
  group_ids?: string[];
  limit?: number;
}

export class MongoDBRecordManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private collection: Collection<BaseRecord> | null = null;
  private namespace: string;
  private connectionString: string;
  private dbName: string;

  constructor(namespace: string) {
    this.namespace = namespace;
    this.connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/';
    this.dbName = process.env.MONGODB_DB || 'flame-audio-db';
  }

  private async connect(): Promise<Collection<BaseRecord>> {
    if (this.collection) return this.collection;

    try {
      this.client = new MongoClient(this.connectionString);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.collection = this.db.collection<BaseRecord>(this.namespace);
      
      // Create indexes
      await this.collection.createIndex({ key: 1 }, { unique: true });
      await this.collection.createIndex({ group_id: 1 });
      await this.collection.createIndex({ updated_at: 1 });
      
      return this.collection;
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  async createSchema(): Promise<void> {
    try {
      const collection = await this.connect();
      // Collection and indexes are created in connect()
      console.log(`Created collection '${this.namespace}' with indexes`);
    } catch (error) {
      console.error('Error creating schema:', error);
      throw error;
    }
  }

  async getTime(): Promise<number> {
    return Date.now();
  }

  async update(
    keys: string[],
    options: { group_ids?: (string | null)[]; time_at_least?: number } = {}
  ): Promise<void> {
    const { group_ids, time_at_least } = options;
    const collection = await this.connect();
    
    if (time_at_least && (await this.getTime()) < time_at_least) {
      throw new Error('time_at_least is in the future');
    }

    const operations = keys.map((key, index) => {
      const update: UpdateFilter<BaseRecord> = {
        $set: {
          key,
          group_id: group_ids?.[index] ?? null,
          updated_at: Date.now(),
        },
        $setOnInsert: {
          created_at: new Date(),
        },
      };

      return {
        updateOne: {
          filter: { key },
          update,
          upsert: true,
        },
      };
    });

    if (operations.length > 0) {
      await collection.bulkWrite(operations);
    }
  }

  async exists(keys: string[]): Promise<ExistsResult> {
    const collection = await this.connect();
    const results = await collection
      .find<BaseRecord>(
        { key: { $in: keys } } as Filter<BaseRecord>,
        { projection: { key: 1, _id: 0 } }
      )
      .toArray();
    
    const existingKeys = new Set(results.map((doc: BaseRecord) => doc.key));
    return keys.map((key) => existingKeys.has(key));
  }

  async listKeys(options: ListOptions = {}): Promise<ListResult> {
    const { before, after, group_ids, limit } = options;
    const collection = await this.connect();
    
    const query: Filter<BaseRecord> = {} as Filter<BaseRecord>;
    
    if (before !== undefined || after !== undefined) {
      const updatedAtFilter: Record<string, unknown> = {};
      
      if (before !== undefined) {
        updatedAtFilter.$lt = before;
      }
      
      if (after !== undefined) {
        updatedAtFilter.$gt = after;
      }
      
      query.updated_at = updatedAtFilter as Filter<BaseRecord>['updated_at'];
    }
    
    if (group_ids !== undefined) {
      query.group_id = { $in: group_ids };
    }
    
    let cursor = collection.find<BaseRecord>(query, {
      projection: { key: 1, _id: 0 },
      sort: { updated_at: -1 },
    });
    
    if (limit) {
      cursor = cursor.limit(limit);
    }
    
    const results = await cursor.toArray();
    return results.map((doc: BaseRecord) => doc.key);
  }

  async deleteKeys(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    
    const collection = await this.connect();
    await collection.deleteMany({ key: { $in: keys } });
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      this.collection = null;
    }
  }
}

// Helper function to create a record manager instance
export const createRecordManager = (namespace: string): MongoDBRecordManager => {
  return new MongoDBRecordManager(namespace);
};
