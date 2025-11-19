/**
 * MongoDB Connection Utility for Serverless
 * 
 * This utility manages MongoDB connections in a serverless environment:
 * - Reuses existing connections (checks readyState === 1)
 * - Configures for serverless with bufferCommands: false and maxPoolSize: 1
 * - Exports both connection function and DB client getter
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let cachedClient = null;
let cachedDb = null;

const mongoUrl = process.env.MONGO_URL || process.env.DB_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'photography_chatbot';

/**
 * Connect to MongoDB with connection reuse for serverless
 * @returns {Promise<Object>} { client, db }
 */
export async function connectToDatabase() {
  // Reuse existing connection if available
  if (cachedClient && cachedDb) {
    console.log('♻️  Reusing existing MongoDB connection');
    return { client: cachedClient, db: cachedDb };
  }

  try {
    console.log('🔌 Establishing new MongoDB connection...');
    
    // Create new client with serverless-optimized settings
    const client = new MongoClient(mongoUrl, {
      maxPoolSize: 1, // Limit connection pool for serverless
      minPoolSize: 0,
      maxIdleTimeMS: 10000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    await client.connect();
    const db = client.db(dbName);

    // Cache the connection
    cachedClient = client;
    cachedDb = db;

    console.log(`✅ Connected to MongoDB: ${dbName}`);
    return { client, db };
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Middleware to ensure DB connection on each request
 * Attaches db to req.app.locals.db
 */
export async function ensureDbConnection(req, res, next) {
  try {
    if (!req.app.locals.db) {
      const { db } = await connectToDatabase();
      req.app.locals.db = db;
    }
    next();
  } catch (error) {
    console.error('DB connection middleware error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Get cached DB instance (for non-middleware usage)
 * @returns {Promise<Object>} MongoDB database instance
 */
export async function getDb() {
  if (cachedDb) {
    return cachedDb;
  }
  const { db } = await connectToDatabase();
  return db;
}

export default connectToDatabase;
