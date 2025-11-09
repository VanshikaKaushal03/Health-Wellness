// routes/appointments.js
const express = require('express');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/appointments  (create booking) - protected
router.post('/', auth, async (req, res) => {
  try {
    const { practitionerId, date, time, type, notes, userId } = req.body;
    // allow admin to create for others: if not provided use req.user.id
    const uid = userId || req.user._id;
    const appt = new Appointment({ userId: uid, practitionerId, date, time, type, notes, status: 'pending' });
    await appt.save();
    res.json({ success:true, appointment: appt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success:false, message: 'Server error' });
  }
});

// GET /api/appointments/user/:userId
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const apps = await Appointment.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ success:false, message: 'Server error' });
  }
});

// GET /api/appointments/practitioner/:id
router.get('/practitioner/:id', auth, async (req, res) => {
  try {
    const apps = await Appointment.find({ practitionerId: req.params.id }).sort({ date: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ success:false, message: 'Server error' });
  }
});

// PUT /api/appointments/:id  (update status/details)
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    const appt = await Appointment.findByIdAndUpdate(req.params.id, updates, { new:true });
    res.json({ success:true, appointment: appt });
  } catch (err) {
    res.status(500).json({ success:false, message: 'Server error' });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ success:true });
  } catch (err) {
    res.status(500).json({ success:false, message: 'Server error' });
  }
});

module.exports = router;
