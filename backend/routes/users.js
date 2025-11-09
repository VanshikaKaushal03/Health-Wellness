// routes/users.js
const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route GET /api/users/:id
 * @desc Get user by ID (protected)
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user)
      return res.status(404).json({ success: false, message: 'User not found' });

    // ✅ Return wrapped JSON for consistency
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route PUT /api/users/:id
 * @desc Update user profile (protected)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    // Allow only self or admin to update
    if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden: Unauthorized access' });
    }

    const updates = req.body;
    if (updates.password) delete updates.password;

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select('-password');

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/users
 * @desc Get all users or filter by role (?role=practitioner)
 * @note Public — removed auth so "Experts" page works again
 */
router.get('/', async (req, res) => {
  try {
    const role = req.query.role;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('-password');
    res.json({ success: true, users });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


/**
 * @route DELETE /api/users/:id
 * @desc Delete a user (admin only)
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Add a new family member (improved)
router.post('/:id/family', auth, async (req, res) => {
  try {
    const userId = req.params.id;
    const requesterId = req.user && req.user._id ? req.user._id.toString() : null;

    // Basic input validation
    const { name, relation, age } = req.body;
    if (!name || !relation || (age === undefined || age === null)) {
      return res.status(400).json({ success: false, message: 'Missing required fields: name, relation, age' });
    }

    // Allow only the user themself or admin to add members
    if (requesterId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: cannot add family member for this user' });
    }

    // Fetch user
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Ensure familyMembers array exists on model
    if (!Array.isArray(user.familyMembers)) user.familyMembers = [];

    user.familyMembers.push({ name, relation, age });
    await user.save();

    // Return updated family members
    res.json({ success: true, message: 'Family member added', familyMembers: user.familyMembers });
  } catch (err) {
    console.error('Error in POST /api/users/:id/family ->', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
});


module.exports = router;
