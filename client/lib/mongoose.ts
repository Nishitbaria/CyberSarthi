import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  console.log(process.env.MONGODB_URL);
  throw new Error(
    "Please define the MONGODB_URL environment variable inside .env.local"
  );
}

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection;
}

let cached: MongooseConnection = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

mongoose.set("strictQuery", true); // Set strictQuery to true

// Track the number of queries
let queryCount = 0;

mongoose.set("debug", (collectionName, methodName, ...methodArgs) => {
  queryCount++;
  console.log(
    `Query #${queryCount}: ${collectionName}.${methodName}`,
    methodArgs
  );
});

export const connectToDatabase = async (): Promise<Mongoose> => {
  if (cached.conn) {
    console.log("MongoDB already connected");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("Connecting to MongoDB...");
    cached.promise = mongoose
      .connect(MONGODB_URL, {
        dbName: process.env.DB_NAME,
        bufferCommands: false,
      })
      .then((mongoose) => {
        console.log("MongoDB connected");
        return mongoose;
      })
      .catch((error) => {
        cached.promise = null;
        console.error("MongoDB connection error:", error);
        throw error;
      });
  } else {
    console.log("MongoDB connection in progress...");
  }

  cached.conn = await cached.promise;
  return cached.conn;
};
