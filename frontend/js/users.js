const express = require("express");
const router = express.Router();
const db = require("../backend/db");
const multer = require("multer");
const upload = multer({ dest: "uploads/" }); // if you handle profile photos

// ---------------------
// EXISTING USER ROUTES
// ---------------------

// Get all users
router.get("/", (req, res) => {
  db.query("SELECT id, name, email, role FROM users WHERE role = 'user'", (err, results) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    res.json(results);
  });
});

// Delete user
router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM user_profiles WHERE user_id = ?", [id], (err) => {
    if (err) return res.status(500).json({ success:false, message:err.message });
    db.query("DELETE FROM users WHERE id = ? AND role != 'admin'", [id], (err2) => {
      if (err2) return res.status(500).json({ success:false, message:err2.message });
      res.json({ success:true });
    });
  });
});

// Update user profile
router.put("/:id", upload.single("photo"), (req, res) => {
  const id = req.params.id;
  const { name, email, phone, address } = req.body;
  let query = "UPDATE user_profiles SET name=?, email=?, phone=?, address=?";
  const params = [name, email, phone, address];

  if(req.file){ // if photo uploaded
    query += ", photo=?";
    params.push(req.file.filename); // save filename in DB
  }

  query += " WHERE user_id=?";
  params.push(id);

  db.query(query, params, (err) => {
    if(err) return res.status(500).json({ success:false, message:err.message });
    res.json({ success:true });
  });
});

// ---------------------
// NEW PAYMENT ROUTES
// ---------------------

// Get all payments for a specific user
router.get("/:id/payments", (req, res) => {
  const userId = req.params.id;
  db.query(
    "SELECT * FROM payments WHERE patient_id = ? ORDER BY timestamp DESC",
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json(results);
    }
  );
});

// Update payment status (simulate payment)
router.put("/:id/payments/:paymentId", (req, res) => {
  const userId = req.params.id;
  const paymentId = req.params.paymentId;
  const { status, payment_method } = req.body;

  db.query(
    "UPDATE payments SET status = ?, payment_method = ? WHERE id = ? AND patient_id = ?",
    [status, payment_method, paymentId, userId],
    (err, result) => {
      if (err) return res.status(500).json({ success:false, message: err.message });
      if (result.affectedRows === 0) return res.status(404).json({ success:false, message: "Payment not found" });
      res.json({ success:true, message:"Payment updated successfully!" });
    }
  );
});

module.exports = router;
