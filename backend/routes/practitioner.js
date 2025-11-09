// routes/practitioner.js
const express = require('express');
const auth = require('../middleware/authMiddleware');
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Report = require('../models/Report');
const User = require('../models/User');

const router = express.Router();

/**
 * @route GET /api/practitioner/dashboard
 * @desc Get practitioner dashboard summary
 */
router.get('/dashboard', auth, async (req, res) => {
  try {
    const practitionerId = req.user._id;

    // ✅ Upcoming & past appointments
    const appointments = await Appointment.find({ practitionerId })
      .populate('userId', 'name email')
      .lean();

    const today = new Date().toISOString().split('T')[0];
    const upcoming = appointments.filter(a => a.date >= today);
    const past = appointments.filter(a => a.date < today);

    // ✅ Patients (unique users who booked)
    const patientIds = [...new Set(appointments.map(a => a.userId?._id?.toString()))];
    const patients = await User.find({ _id: { $in: patientIds } }).select('name email');

    // ✅ Payments summary
    const payments = await Payment.find({ practitionerId }).lean();
    const totalRevenue = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0);
    const pendingRevenue = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    // ✅ Reports created by practitioner
    const reports = await Report.find({ practitionerId })
      .populate('userId', 'name')
      .lean();

      const practitioner = await User.findById(practitionerId).select('-password');

      res.json({
        success: true,
        practitioner,          // <--- ADD THIS
        stats: {
          totalPatients: patients.length,
          totalRevenue,
          pendingRevenue,
          upcomingCount: upcoming.length,
          pastCount: past.length
        },
        appointments: { upcoming, past },
        patients,
        payments,
        reports
      });
      
  } catch (err) {
    console.error('Practitioner dashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/practitioner/profile
 * @desc Get practitioner profile details
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const practitioner = await User.findById(req.user._id).select('-password');
    if (!practitioner) return res.status(404).json({ success: false, message: 'Practitioner not found' });
    res.json({ success: true, data: practitioner });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route PATCH /api/practitioner/update-profile/:id
 * @desc Update practitioner profile (editable info)
 */
router.patch('/update-profile/:id', auth, async (req, res) => {
  try {
    const { name, email, specialization, phone, address, fees, experience, bio, photo } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      {
        name,
        email,
        specialization,
        fees,
        experience,
        'profile.phone': phone,
        'profile.address': address,
        'profile.photo': photo,
        bio
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ success: false, message: 'Practitioner not found' });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


module.exports = router;
