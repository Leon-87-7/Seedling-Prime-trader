import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export const connectToDatabase = async () => {
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env'
    );
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const startTime = Date.now();
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((conn) => {
      const connectionTime = Date.now() - startTime;

      // Extract database name safely without exposing credentials
      const dbName = conn.connection.db?.databaseName || 'unknown';
      const host = conn.connection.host || 'unknown';

      console.log(
        `OK: Connected to MongoDB [db="${dbName}", host="${host}", time=${connectionTime}ms]`
      );

      return conn;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};
