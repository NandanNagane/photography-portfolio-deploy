/**
 * Feedback Routes
 * Simple feedback submission endpoint - stores user feedback in MongoDB
 * 
 * Manual Testing:
 * curl -X POST http://localhost:5000/api/feedback \
 *   -H "Content-Type: application/json" \
 *   -d '{"message":"Great service!","email":"test@example.com","rating":5,"name":"John"}'
 */

import express from 'express';

const router = express.Router();

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/feedback - Submit feedback
router.post('/', async (req, res) => {
  try {
    const { name, email, rating, message, page } = req.body;
    const db = req.app.locals.db;

    // Validate required fields
    if (!message || message.trim().length < 5) {
      return res.status(400).json({
        ok: false,
        error: 'Message is required and must be at least 5 characters'
      });
    }

    // Validate email if provided
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid email format'
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        ok: false,
        error: 'Rating must be between 1 and 5'
      });
    }

    // Create feedback document
    const feedback = {
      name: name?.trim() || null,
      email: email?.trim() || null,
      rating: rating ? parseInt(rating) : null,
      message: message.trim(),
      page: page || '/contact',
      status: 'new',
      createdAt: new Date()
    };

    // Save to database
    const result = await db.collection('feedback').insertOne(feedback);

    console.log('✅ Feedback received:', {
      id: result.insertedId,
      name: feedback.name,
      rating: feedback.rating
    });

    res.status(201).json({
      ok: true,
      id: result.insertedId.toString(),
      createdAt: feedback.createdAt.toISOString()
    });

  } catch (error) {
    console.error('❌ Feedback submission error:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to submit feedback'
    });
  }
});

export default router;
