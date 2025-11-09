const mongoose = require('mongoose');

const MeasurementSchema = new mongoose.Schema({
    date: { type: String }, // YYYY-MM-DD
    sugar: Number,
    systolic: Number,
    diastolic: Number,
    weight: Number
}, { _id: false });

const ReportSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    practitionerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    diagnosis: { type: String, required: true },
    booked: String,  // date string for appointment booking
    lastVisit: String, // date string
    notes: String,
    measurements: [MeasurementSchema],

    // 💡 ADDED FIELDS FOR PRESCRIPTION/MEDICATION DATA
    medications: [
        {
            name: { type: String, required: true },
            dosage: { type: String, required: true },
            frequency: { type: String, required: true }, // e.g., "Twice a day", "Once a day"
            instructions: { type: String }, // e.g., "After meal"
        }
    ],
    pdfLink: {
        type: String, // Link to the official prescription PDF
        default: null
    },
    // ----------------------------------------------------
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);