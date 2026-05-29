const express = require("express");
const auth = require("../middleware/authMiddleware");
const User = require("../models/User");
const Appointment = require("../models/Appointment");
const Payment = require("../models/Payment");
const Report = require("../models/Report");

const router = express.Router();

/**
 * @route GET /api/admin/dashboard
 * @desc Admin Dashboard Summary
 */
router.get("/dashboard", auth, async (req, res) => {
  try {
    // ✅ Only admins can access
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    // --- Fetch all data ---
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalPractitioners = await User.countDocuments({ role: "practitioner" });
    const totalAppointments = await Appointment.countDocuments();
    const totalReports = await Report.countDocuments();

    const payments = await Payment.find().lean();
    const totalRevenue = payments
      .filter((p) => p.status === "paid")
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    const pendingRevenue = payments
      .filter((p) => p.status === "pending")
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    const recentUsers = await User.find()
  .select("name email role specialization experience fees")
  .limit(15)
  .lean();


    const recentAppointments = await Appointment.find()
      .populate("userId", "name")
      .populate("practitionerId", "name")
      .sort({ date: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalPractitioners,
        totalAppointments,
        totalReports,
        totalRevenue,
        pendingRevenue,
      },
      recent: {
        users: recentUsers,
        appointments: recentAppointments,
      },
    });
  } catch (err) {
    console.error("Admin dashboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route GET /api/admin/payments
 * @desc Get all payments
 */
router.get("/payments", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const payments = await Payment.find()
      .populate("userId", "name")
      .populate("practitionerId", "name")
      .sort({ date: -1 })
      .lean();

    res.json({ success: true, payments });
  } catch (err) {
    console.error("Admin payments error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route DELETE /api/admin/users/:id
 * @desc Delete a user (Admin only)
 */
router.delete("/users/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    console.error("Admin delete user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route PUT /api/admin/appointments/:id
 * @desc Update appointment (status/date)
 */
router.put("/appointments/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: "Appointment not found" });
    res.json({ success: true, appointment: updated });
  } catch (err) {
    console.error("Update appointment error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/**
 * @route PUT /api/admin/appointments/:id
 * @desc Update appointment (mark complete or reschedule)
 */
router.put("/appointments/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { status, date } = req.body;
    const updated = await Appointment.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(date && { date }) },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ success: false, message: "Appointment not found" });

    res.json({ success: true, appointment: updated });
  } catch (err) {
    console.error("Admin appointment update error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
/**
 * /**
 * @route PUT /api/admin/users/:id
 * @desc Update a user's role (Admin only)
 * @access Admin
 */
// 
// 1. I have REMOVED 'isAdmin' from this line
//
router.put("/users/:id", auth, async (req, res) => {
  try {
    //
    // 2. I have ADDED this check INSIDE the function
    //
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const { role } = req.body;
    if (!role || !['user', 'practitioner', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid role specified" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { role: role }, // Update the role
      { new: true, runValidators: true }
    ).select("name email role");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "User role updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Admin update user error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


module.exports = router;
