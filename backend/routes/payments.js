// routes/payments.js
const express = require('express');
const Payment = require('../models/Payment');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route POST /api/payments
 * @desc Create a payment record
 */
router.post('/', auth, async (req, res) => {
  try {
    const { appointmentId, userId, practitionerId, amount, method, status } = req.body;
    const pay = new Payment({
      appointmentId,
      userId,
      practitionerId,
      amount,
      method,
      status: status || 'pending'
    });
    await pay.save();
    res.json({ success: true, payment: pay });
  } catch (err) {
    console.error('Error creating payment:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route GET /api/payments/user/:userId
 * @desc Get all payments for a specific user
 */
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId })
      .populate('practitionerId', 'name specialization')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (err) {
    console.error('Error fetching payments:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route PUT /api/payments/:id
 * @desc Update payment (e.g. mark as paid)
 */
router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Payment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, payment: updated });
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
