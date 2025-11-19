import express from 'express';

const router = express.Router();

// Portfolio data
const portfolioData = [
  {
    title: "Wedding Collections",
    description: "Capturing timeless moments of your special day with artistic elegance and authentic emotion.",
    category: "wedding",
    featured: true
  },
  {
    title: "Portrait Sessions",
    description: "Professional portraits that reveal personality and character through masterful lighting and composition.",
    category: "portrait",
    featured: true
  },
  {
    title: "Event Photography",
    description: "Dynamic coverage of corporate events, celebrations, and special occasions.",
    category: "event",
    featured: false
  },
  {
    title: "Family Moments",
    description: "Warm, natural family portraits that capture genuine connections and joy.",
    category: "family",
    featured: true
  }
];

// GET /api/portfolio - Get portfolio items
router.get('/portfolio', async (req, res) => {
  try {
    const { category, featured } = req.query;
    
    let filteredPortfolio = [...portfolioData];
    
    // Filter by category if provided
    if (category) {
      filteredPortfolio = filteredPortfolio.filter(
        item => item.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by featured if provided
    if (featured !== undefined) {
      const isFeatured = featured === 'true' || featured === '1';
      filteredPortfolio = filteredPortfolio.filter(
        item => item.featured === isFeatured
      );
    }
    
    res.json(filteredPortfolio);
    
  } catch (error) {
    console.error('Portfolio error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve portfolio',
      details: error.message 
    });
  }
});

export default router;
