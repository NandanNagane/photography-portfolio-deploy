import express from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone validation (basic - allows various formats)
const phoneRegex = /^[\d\s\-\(\)\+]+$/;


//currently automated this in chat.js by checking if any leads caught in history then saving them in DB(leads collection)
// POST /api/leads - Create new lead
router.post('/leads', async (req, res) => {
  try {
    const { 
      session_id, 
      name, 
      email, 
      phone, 
      shoot_type, 
      preferred_date,
      preferred_time,
      source,
      message 
    } = req.body;
    
    const db = req.app.locals.db;
 
    
    
    // Validate required fields
    if (!session_id) {
      return res.status(400).json({ 
        error: 'session_id is required' 
      });
    }
    
    // Validate email format if provided
    if (email && !emailRegex.test(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }
    
    // Validate phone format if provided
    if (phone && !phoneRegex.test(phone)) {
      return res.status(400).json({ 
        error: 'Invalid phone format' 
      });
    }
    
    // Create lead object
    const lead = {
      id: uuidv4(),
      session_id,
      name: name || null,
      email: email || null,
      phone: phone || null,
      shoot_type: shoot_type || null,
      preferred_date: preferred_date || null,
      preferred_time: preferred_time || null,
      source: source || null,
      message: message || null,
      status: 'new',
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Save to database
    await db.collection('leads').insertOne(lead);
    
    // Remove MongoDB _id from response
    const { _id, ...leadResponse } = lead;
    
    res.status(201).json(leadResponse);
    
  } catch (error) {
    console.error('Lead creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create lead',
      details: error.message 
    });
  }
});


//these are admin routes to manage leads
// GET /api/leads - Get all leads 
router.get('/leads', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { status, shoot_type, limit = 100 } = req.query;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    if (shoot_type) {
      query.shoot_type = shoot_type;
    }
    
    const leads = await db.collection('leads')
      .find(query, { projection: { _id: 0 } })
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    res.json(leads);
    
  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve leads',
      details: error.message 
    });
  }
});

// GET /api/leads/:id - Get single lead
router.get('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const lead = await db.collection('leads')
      .findOne({ id }, { projection: { _id: 0 } });
    
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(lead);
    
  } catch (error) {
    console.error('Get lead error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve lead',
      details: error.message 
    });
  }
});

// PATCH /api/leads/:id - Update lead status
router.patch('/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const db = req.app.locals.db;
    
    const validStatuses = ['new', 'contacted', 'converted', 'closed'];
    
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      });
    }
    
    const updateData = {
      ...(status && { status }),
      updated_at: new Date().toISOString()
    };
    
    const result = await db.collection('leads')
      .findOneAndUpdate(
        { id },
        { $set: updateData },
        { returnDocument: 'after', projection: { _id: 0 } }
      );
    
    if (!result.value) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(result.value);
    
  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({ 
      error: 'Failed to update lead',
      details: error.message 
    });
  }
});




// DELETE /api/leads/:id/gdpr - GDPR data removal
router.delete('/leads/:id/gdpr', async (req, res) => {
  try {
    const { id } = req.params;
    const db = req.app.locals.db;
    
    const result = await db.collection('leads').deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json({ 
      message: 'Lead data removed successfully',
      id 
    });
    
  } catch (error) {
    console.error('GDPR removal error:', error);
    res.status(500).json({ 
      error: 'Failed to remove lead data',
      details: error.message 
    });
  }
});

export default router;
