import { MongoDBRecordManager } from './record-manager';

export type {
  BaseRecord as MongoDBRecord,
  ListOptions,
  UpdateOptions,
  ExistsResult,
  ListResult
} from './record-manager';

export interface MongoDBRecordManagerOptions {
  namespace: string;
  connectionString?: string;
  dbName?: string;
}

/**
 * Creates a new MongoDB record manager instance
 * @param options Configuration options for the record manager
 * @returns A new MongoDBRecordManager instance
 */
export function createMongoDBRecordManager(options: MongoDBRecordManagerOptions): MongoDBRecordManager {
  const manager = new MongoDBRecordManager(options.namespace);
  
  // Add type-safe property setting methods
  if (options.connectionString) {
    (manager as any).setConnectionString?.(options.connectionString);
  }
  
  if (options.dbName) {
    (manager as any).setDbName?.(options.dbName);
  }
  
  return manager;
}

// Re-export the MongoDBRecordManager class for direct imports
export { MongoDBRecordManager } from './record-manager';
