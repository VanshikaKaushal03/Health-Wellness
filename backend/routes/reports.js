// backend/routes/reports.js
const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const authMiddleware = require('../middleware/authMiddleware');

// ✅ Fetch all medical reports for a specific user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch reports for the given user
    const reports = await Report.find({ userId })
      .populate({
        path: 'practitionerId',
        select: 'name',
        options: { strictPopulate: false },
      })
      .sort({ createdAt: -1 })
      .lean();

    // If no reports found
    if (!reports || reports.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No medical reports found for this user.',
      });
    }

    // ✅ Send reports directly
    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });

  } catch (error) {
    console.error('🔥 Error fetching reports:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching reports.',
      error: error.message,
    });
  }
});

module.exports = router;
