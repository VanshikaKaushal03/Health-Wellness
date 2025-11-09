const express = require('express');
const User = require('../models/User'); 
const router = express.Router();

// Get all practitioners
router.get('/practitioners', async (req, res) => {
    try {
        const practitioners = await User.find({ role: 'practitioner' })
            .select('_id name specialization fees experience bio profile ratings')
            .lean();

        if (!practitioners || practitioners.length === 0) {
            return res.status(404).json({ success: false, message: 'No practitioners found' });
        }

        res.json({ success: true, data: practitioners });
    } catch (err) {
        console.error('Error fetching practitioners:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Get a single practitioner by ID
router.get('/practitioners/:id', async (req, res) => {
    try {
        const practitioner = await User.findById(req.params.id)
            .select('_id name specialization fees experience bio profile ratings')
            .lean();

        if (!practitioner) {
            return res.status(404).json({ success: false, message: 'Practitioner not found' });
        }

        res.json({ success: true, data: practitioner });
    } catch (err) {
        console.error('Error fetching practitioner:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
