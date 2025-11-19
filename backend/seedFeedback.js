/**
 * Seed Feedback Data
 * Populates the feedback collection with sample data
 * 
 * Usage: cd backend && npm run seed:feedback
 * Or: node --env-file=.env seedFeedback.js
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'photography_chatbot';

const sampleFeedback = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    rating: 5,
    message: 'Absolutely amazing experience! The photographer captured our wedding day perfectly. Every moment was documented beautifully.',
    page: '/contact',
    status: 'new',
    createdAt: new Date('2025-11-15T10:30:00Z')
  },
  {
    name: 'Michael Chen',
    email: 'mchen@example.com',
    rating: 4,
    message: 'Great portfolio work. Professional and creative. Would love to book a session soon.',
    page: '/portfolio',
    status: 'reviewed',
    createdAt: new Date('2025-11-16T14:20:00Z')
  },
  {
    name: null,
    email: null,
    rating: 5,
    message: 'The lighting in your portrait work is stunning. Exactly the style I\'m looking for!',
    page: '/about',
    status: 'new',
    createdAt: new Date('2025-11-17T09:15:00Z')
  }
];

async function seedFeedback() {
  const client = new MongoClient(mongoUrl);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    
    console.log('🌱 Seeding feedback collection...');
    
    // Clear existing feedback (optional - comment out to preserve data)
    await db.collection('feedback').deleteMany({});
    console.log('🗑️  Cleared existing feedback');
    
    // Insert sample feedback
    const result = await db.collection('feedback').insertMany(sampleFeedback);
    console.log(`✅ Inserted ${result.insertedCount} feedback items`);
    
    // Display inserted items
    const feedback = await db.collection('feedback').find({}).toArray();
    console.log('\n📋 Feedback items:');
    feedback.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name || 'Anonymous'} - ${item.rating}⭐ - ${item.message.substring(0, 50)}...`);
    });
    
    console.log('\n🎉 Feedback seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding feedback:', error);
  } finally {
    await client.close();
  }
}

seedFeedback();
