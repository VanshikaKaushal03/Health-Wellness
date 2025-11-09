const express = require("express");
const PDFDocument = require("pdfkit");
const Payment = require("../models/Payment");

const router = express.Router();

router.get("/receipt/:paymentId", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId)
      .populate("userId", "name email")
      .populate("practitionerId", "name");

    if (!payment || payment.status !== "paid") {
      return res.status(404).json({ success: false, message: "Receipt not available." });
    }

    // Create PDF and stream directly to browser
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=receipt_${payment._id}.pdf`);
    doc.pipe(res);

    doc.fontSize(22).text("Health & Wellness Payment Receipt", { align: "center" });
    doc.moveDown();
    doc.fontSize(14).text(`Receipt ID: ${payment._id}`);
    doc.text(`User: ${payment.userId.name} (${payment.userId.email})`);
    doc.text(`Practitioner: ${payment.practitionerId.name}`);
    doc.text(`Amount Paid: ₹${payment.amount}`);
    doc.text(`Payment Method: ${payment.method}`);
    doc.text(`Date: ${payment.date.toLocaleDateString()}`);

    doc.end();
  } catch (error) {
    console.error("Receipt error:", error);
    res.status(500).json({ success: false, message: "Server error generating receipt" });
  }
});

module.exports = router;
