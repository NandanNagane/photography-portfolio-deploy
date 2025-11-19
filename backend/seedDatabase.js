import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import { portfolioData } from './data/seedPortfolio.js';
import { packagesData } from './data/seedPackages.js';
import { leadsData } from './data/seedLeads.js';

dotenv.config();

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'photography_chatbot';

async function seedDatabase() {
  const client = new MongoClient(mongoUrl);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    
    console.log('🌱 Seeding database...');
    
    // Clear existing data (optional)
    await db.collection('portfolio').deleteMany({});
    await db.collection('packages').deleteMany({});
    await db.collection('leads').deleteMany({});
    
    // Insert portfolio items
    const portfolioResult = await db.collection('portfolio').insertMany(portfolioData);
    console.log(`✅ Inserted ${portfolioResult.insertedCount} portfolio items`);
    
    // Insert packages
    const packagesResult = await db.collection('packages').insertMany(packagesData);
    console.log(`✅ Inserted ${packagesResult.insertedCount} packages`);
    
    // Insert sample leads
    const leadsResult = await db.collection('leads').insertMany(leadsData);
    console.log(`✅ Inserted ${leadsResult.insertedCount} sample leads`);
    
    console.log('🎉 Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();