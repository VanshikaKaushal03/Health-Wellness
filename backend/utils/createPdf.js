// backend/utils/createPdf.js
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function createPrescriptionPDF(report) {
  const pdfPath = path.join(__dirname, '../uploads/reports', `prescription_${report._id}.pdf`);
  const doc = new PDFDocument();

  doc.pipe(fs.createWriteStream(pdfPath));

  doc.fontSize(20).text('Health & Wellness - Prescription', { align: 'center' });
  doc.moveDown();

  doc.fontSize(14).text(`Patient Name: ${report.userName || 'Unknown'}`);
  doc.text(`Practitioner: ${report.practitionerName || 'Unknown'}`);
  doc.text(`Diagnosis: ${report.diagnosis}`);
  doc.text(`Last Visit: ${report.lastVisit}`);
  doc.moveDown();

  doc.text('Medications:', { underline: true });
  report.medications.forEach((m, i) => {
    doc.text(`${i+1}. ${m.name} - ${m.dosage}, ${m.frequency}`);
    doc.text(`   Instructions: ${m.instructions}`);
  });

  doc.end();

  return `/reports/prescription_${report._id}.pdf`; // URL path to serve
}

module.exports = createPrescriptionPDF;
