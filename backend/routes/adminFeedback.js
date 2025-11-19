/**
 * Admin Feedback Routes
 * Simple admin endpoints to view and manage feedback (no authentication for demo)
 * 
 * Manual Testing:
 * curl http://localhost:5000/api/admin/feedback
 * curl -X PATCH http://localhost:5000/api/admin/feedback/<id>/status -H "Content-Type: application/json" -d '{"status":"reviewed"}'
 * curl -X DELETE http://localhost:5000/api/admin/feedback/<id>
 */

import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

// GET /api/admin/feedback - List all feedback with pagination
router.get('/', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { page = 1, limit = 20, status, rating } = req.query;

    // Build query
    const query = {};
    if (status) query.status = status;
    if (rating) query.rating = parseInt(rating);

    // Get total count
    const total = await db.collection('feedback').countDocuments(query);

    // Get paginated results
    const feedback = await db.collection('feedback')
      .find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .toArray();

    res.json({
      ok: true,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      data: feedback
    });

  } catch (error) {
    console.error('❌ Error fetching feedback:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch feedback'
    });
  }
});

// PATCH /api/admin/feedback/:id/status - Update feedback status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = req.app.locals.db;

    // Validate status
    const validStatuses = ['new', 'reviewed', 'flagged'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        ok: false,
        error: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid feedback ID'
      });
    }

    // Update status
    const result = await db.collection('feedback').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Feedback not found'
      });
    }

    res.json({
      ok: true,
      message: 'Status updated successfully'
    });

  } catch (error) {
    console.error('❌ Error updating feedback:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to update feedback'
    });
  }
});

// DELETE /api/admin/feedback/:id - Delete feedback
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid feedback ID'
      });
    }

    // Delete feedback
    const result = await db.collection('feedback').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        ok: false,
        error: 'Feedback not found'
      });
    }

    res.json({
      ok: true,
      message: 'Feedback deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting feedback:', error);
    res.status(500).json({
      ok: false,
      error: 'Failed to delete feedback'
    });
  }
});

export default router;
