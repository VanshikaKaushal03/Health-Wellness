// routes/favorites.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// GET all favorites for a user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    // Get the user and populate favorites
    const user = await User.findById(req.params.userId).populate('favorites');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, favorites: user.favorites });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Add favorite
router.post('/user/:userId/add', authMiddleware, async (req, res) => {
  const { practitionerId } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (!user.favorites.includes(practitionerId)) {
      user.favorites.push(practitionerId);
      await user.save();
    }

    res.json({ success: true, message: 'Added to favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Remove favorite
router.post('/user/:userId/remove', authMiddleware, async (req, res) => {
  const { practitionerId } = req.body;
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.favorites = user.favorites.filter(id => id.toString() !== practitionerId);
    await user.save();

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
