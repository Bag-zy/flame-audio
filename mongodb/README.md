# MongoDB Integration

This directory contains the MongoDB integration for the Flame Audio application, including the record manager and database utilities.

## Files

- `record-manager.ts`: Implements the MongoDB record manager for managing documents in the database.
- `index.ts`: Exports all public types and functions from the MongoDB integration.
- `utils.ts`: Contains utility functions for working with MongoDB.
- `README.md`: This documentation file.

## Setup

1. Set up your environment variables in `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DB=flame-audio-db
```

2. Install the required dependencies:

```bash
npm install mongodb
# or
yarn add mongodb
```

## Usage

### Record Manager

The `MongoDBRecordManager` class provides a simple interface for managing records in MongoDB.

```typescript
import { createRecordManager } from './mongodb';

// Create a new record manager instance
const recordManager = createRecordManager('my-collection');

// Initialize the collection
await recordManager.createSchema();

// Update records
await recordManager.update(
  ['doc1', 'doc2'],
  { group_ids: ['group1', 'group2'] }
);

// Check if records exist
const exists = await recordManager.exists(['doc1', 'doc3']);
// [true, false]

// List record keys
const keys = await recordManager.listKeys({
  group_ids: ['group1'],
  limit: 10,
});

// Delete records
await recordManager.deleteKeys(['doc1']);

// Close the connection when done
await recordManager.close();
```

### Database Connection

Use the `connectToDatabase` function to get a database connection:

```typescript
import { connectToDatabase } from './mongodb/utils';

async function myFunction() {
  const { client, db } = await connectToDatabase();
  
  try {
    // Use the database connection
    const collection = db.collection('my-collection');
    const result = await collection.find({}).toArray();
    console.log(result);
  } finally {
    // Close the connection when done
    await client.close();
  }
}
```

## Error Handling

The MongoDB integration includes error handling for common scenarios:

- Connection errors
- Timeouts
- Duplicate key errors
- Validation errors

## Best Practices

1. **Connection Management**: Always close database connections when they are no longer needed.
2. **Error Handling**: Always wrap database operations in try/catch blocks.
3. **Indexing**: Create appropriate indexes for frequently queried fields.
4. **Environment Variables**: Use environment variables for sensitive information like connection strings.

## License

This project is licensed under the terms of the MIT license.
