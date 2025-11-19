import express from 'express';

const router = express.Router();

// Package data
const packageData = [
  {
    id: "essential",
    name: "Essential Package",
    type: "all",
    description: "Perfect for intimate sessions and smaller events",
    price: "$599",
    priceValue: 599,
    features: [
      "2 hours of shooting",
      "50 edited high-resolution images",
      "Online gallery for viewing and sharing",
      "Personal use printing rights"
    ],
    duration: "2 hours"
  },
  {
    id: "premium",
    name: "Premium Package",
    type: "wedding",
    description: "Our most popular choice for weddings and major events",
    price: "$1,299",
    priceValue: 1299,
    features: [
      "6 hours of shooting",
      "200 edited high-resolution images",
      "Second photographer included",
      "Online gallery with download access",
      "Complimentary engagement session",
      "Full commercial printing rights"
    ],
    duration: "6 hours"
  },
  {
    id: "signature",
    name: "Signature Package",
    type: "wedding",
    description: "Complete coverage with luxury presentation",
    price: "$2,499",
    priceValue: 2499,
    features: [
      "Full day coverage (up to 10 hours)",
      "400+ edited high-resolution images",
      "Two photographers and assistant",
      "Premium online gallery",
      "Engagement session included",
      "Custom-designed photo album",
      "Full commercial printing rights",
      "Complimentary prints package"
    ],
    duration: "10 hours"
  }
];

// GET /api/packages - Get packages
router.get('/packages', async (req, res) => {
  try {
    const { type } = req.query;
    
    let filteredPackages = [...packageData];
    
    // Filter by type if provided
    if (type) {
      filteredPackages = filteredPackages.filter(
        pkg => pkg.type === 'all' || pkg.type.toLowerCase() === type.toLowerCase()
      );
    }
    
    res.json(filteredPackages);
    
  } catch (error) {
    console.error('Packages error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve packages',
      details: error.message 
    });
  }
});

// GET /api/packages/:id - Get single package
router.get('/packages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const pkg = packageData.find(p => p.id === id);
    
    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }
    
    res.json(pkg);
    
  } catch (error) {
    console.error('Package error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve package',
      details: error.message 
    });
  }
});

export default router;
