// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const connectDB = require('./config/db');
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const Payment = require('./models/Payment');
const Report = require('./models/Report');
// 💡 Import the new Message model
const Message = require('./models/Message'); // Assuming you created this file

// Ensure uploads/reports folder exists
const reportsDir = path.join(__dirname, 'uploads', 'reports');
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

// Function to generate prescription PDF
function createPrescriptionPDF(reportData) {
    const pdfFileName = `prescription_${reportData.userId}.pdf`;
    const pdfPath = path.join(reportsDir, pdfFileName);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(pdfPath));

    doc.fontSize(20).text('Health & Wellness - Prescription', { align: 'center' });
    doc.moveDown();

    doc.fontSize(14).text(`Patient Name: ${reportData.userName}`);
    doc.text(`Practitioner: ${reportData.practitionerName}`);
    doc.text(`Diagnosis: ${reportData.diagnosis}`);
    doc.text(`Last Visit: ${reportData.lastVisit}`);
    doc.moveDown();

    doc.text('Medications:', { underline: true });
    reportData.medications.forEach((m, i) => {
        doc.text(`${i + 1}. ${m.name} - ${m.dosage}, ${m.frequency}`);
        doc.text(`   Instructions: ${m.instructions}`);
    });

    doc.end();
    return `/reports/${pdfFileName}`;
}

async function seed() {
    await connectDB(process.env.MONGO_URI || "mongodb://localhost:27017/healthwellness");

    await User.deleteMany({});
    await Appointment.deleteMany({});
    await Payment.deleteMany({});
    await Report.deleteMany({});
    await Message.deleteMany({});
    console.log("🧹 Cleared existing data...");

    // ===== USERS =====
    const usersData = [
        { name:'Riya Patel', email:'riya@example.com', password:'password1', role:'user' },
        { name:'Arjun Mehta', email:'arjun@example.com', password:'password2', role:'user' },
        { name:'Sneha Rao', email:'sneha@example.com', password:'password3', role:'user' },
        { name:'Vikram Joshi', email:'vikram@example.com', password:'password4', role:'user' },
        { name:'Nisha Gupta', email:'nisha@example.com', password:'password5', role:'user' },
        { name:'Pooja Nair', email:'pooja@example.com', password:'password6', role:'user' },
        { name:'Karan Deshmukh', email:'karan@example.com', password:'password7', role:'user' },
        { name:'Aditya Verma', email:'aditya@example.com', password:'password8', role:'user' },
        { name:'Meera Iyer', email:'meera@example.com', password:'password9', role:'user' },
        { name:'Ayesha Khan', email:'ayesha@example.com', password:'password10', role:'user' },
        { name:'Aniket Malhotra', email:'aniket@example.com', password:'password11', role:'user' },
        { name:'Neelima Das', email:'neelima@example.com', password:'password12', role:'user' },
        { name:'Kabir Singh', email:'kabir@example.com', password:'password13', role:'user' },
        { name:'Simran Kapoor', email:'simran@example.com', password:'password14', role:'user' },
        { name:'Dev Patel', email:'dev@example.com', password:'password15', role:'user' },
        { name:'Aarav Bansal', email:'aarav@example.com', password:'password16', role:'user' },
        { name:'Shruti Sharma', email:'shruti@example.com', password:'password17', role:'user' },
        { name:'Nitin Pillai', email:'nitin@example.com', password:'password18', role:'user' },
        { name:'Tanvi Menon', email:'tanvi@example.com', password:'password19', role:'user' },
        { name:'Harsh Vora', email:'harsh@example.com', password:'password20', role:'user' },
        { name:'Sana Qureshi', email:'sana@example.com', password:'password21', role:'user' },
        { name:'Rachita Sharma', email:'rachita@example.com', password:'password22', role:'user' },
        { name:'Varun Jain', email:'varun@example.com', password:'password23', role:'user' },
        { name:'Mitali Joshi', email:'mitali@example.com', password:'password24', role:'user' },
        { name:'Neha Bhatt', email:'nehabhatt@example.com', password:'password25', role:'user' },
        { name:'Aditi Chopra', email:'aditi@example.com', password:'password26', role:'user' },
        { name:'Kavya Pillai', email:'kavya@example.com', password:'password27', role:'user' },
        { name:'Rohit Khanna', email:'rohit@example.com', password:'password28', role:'user' },
        { name:'Vanshika Reddy', email:'vanshika@example.com', password:'password29', role:'user' },
        { name:'Manish Goyal', email:'manish@example.com', password:'password30', role:'user' },
        { name:'Deepa Sharma', email:'deepa@example.com', password:'password31', role:'user' }
    ];

    // ===== PRACTITIONERS =====
    const practData = [
        { name:'Dr. Priya Sharma', email:'priya@example.com', password:'doctor1', role:'practitioner', specialization:'Cardiology', fees:800, experience:8 },
        { name:'Dr. Amit Singh', email:'amit@example.com', password:'doctor2', role:'practitioner', specialization:'General Physician', fees:500, experience:5 },
        { name:'Dr. Neha Kapoor', email:'neha@example.com', password:'doctor3', role:'practitioner', specialization:'Endocrinology', fees:900, experience:7 },
        { name:'Dr. Rahul Mehra', email:'rahul@example.com', password:'doctor4', role:'practitioner', specialization:'Pulmonology', fees:700, experience:6 },
        { name:'Dr. Suman Iyer', email:'suman@example.com', password:'doctor5', role:'practitioner', specialization:'Psychiatry', fees:600, experience:4 },
        { name:'Dr. Meenal Desai', email:'meenal@example.com', password:'doctor6', role:'practitioner', specialization:'Dermatology', fees:750, experience:9 },
        { name:'Dr. Keshav Pillai', email:'keshav@example.com', password:'doctor7', role:'practitioner', specialization:'Orthopedics', fees:850, experience:10 },
        { name:'Dr. Kavita Sood', email:'kavita@example.com', password:'doctor8', role:'practitioner', specialization:'Gynecology', fees:950, experience:11 },
        { name:'Dr. Nikhil Malviya', email:'nikhil@example.com', password:'doctor9', role:'practitioner', specialization:'Neurology', fees:1000, experience:12 },
        { name:'Dr. Aarti Joshi', email:'aarti@example.com', password:'doctor10', role:'practitioner', specialization:'Pediatrics', fees:650, experience:6 }
    ];

    const adminData = { name:'Admin', email:'admin@example.com', password:'adminpass', role:'admin' };

    // ===== HASH USERS & PRACTITIONERS =====
    const users = [];
    for (const u of usersData) {
        const hashed = await bcrypt.hash(u.password, 10);
        const doc = await User.create({ ...u, password: hashed });
        users.push(doc);
    }

    const practitioners = [];
    for (const p of practData) {
        const hashed = await bcrypt.hash(p.password, 10);
        const doc = await User.create({ ...p, password: hashed });
        practitioners.push(doc);
    }

    const adminHashed = await bcrypt.hash(adminData.password, 10);
    const admin = await User.create({ ...adminData, password: adminHashed });

    const meenal = practitioners.find(p => p.email === "meenal@example.com");
    const riya = users.find(u => u.email === "riya@example.com");
    const practitionersToFavorite = practitioners.slice(0, 3);
    if (riya) {
        riya.favorites = practitionersToFavorite.map(p => p._id);
        await riya.save();
    }

    const arjun = users.find(u => u.email === "arjun@example.com");

    // ===== APPOINTMENTS + PAYMENTS + REPORTS for Dr. Meenal Desai =====
    const selectedUsers = users.slice(0, 5);
    const diagnoses = ['Eczema', 'Acne Vulgaris', 'Rosacea', 'Psoriasis', 'Allergic Dermatitis'];
    const medicationsList = [
        [{ name: 'Clobetasol Propionate', dosage: '0.05%', frequency: 'Twice a day', instructions: 'Apply thinly to affected area' }],
        [{ name: 'Doxycycline', dosage: '100mg', frequency: 'Once a day', instructions: 'Take with food' }],
        [{ name: 'Metronidazole gel', dosage: '1%', frequency: 'Twice a day', instructions: 'Apply to face' }],
        [{ name: 'Calcipotriene', dosage: '50 mcg/g', frequency: 'Once a day', instructions: 'Apply at night' }],
        [{ name: 'Fexofenadine', dosage: '180mg', frequency: 'Once a day', instructions: 'Take as needed for itching' }]
    ];

    for (let i = 0; i < selectedUsers.length; i++) {
        const user = selectedUsers[i];
        const diag = diagnoses[i];
        const meds = medicationsList[i];

        // Past appointments (April–September)
        for (let m = 4; m <= 9; m++) {
            const date = `2025-${m.toString().padStart(2, '0')}-15`;
            const appt = await Appointment.create({
                userId: user._id,
                practitionerId: meenal._id,
                date,
                time: "11:00",
                type: (m % 2 === 0) ? "Follow-up" : "In-person",
                status: "completed"
            });
            await Payment.create({
                appointmentId: appt._id,
                userId: user._id,
                practitionerId: meenal._id,
                amount: 750,
                method: "Card",
                status: "paid",
                date: new Date(date)
            });
        }

        // Upcoming appointments (October–November)
        for (let m = 10; m <= 11; m++) {
            await Appointment.create({
                userId: user._id,
                practitionerId: meenal._id,
                date: `2025-${m.toString().padStart(2, '0')}-10`,
                time: "12:30",
                type: "Online",
                status: "pending"
            });
        }

        // Reports (Prescriptions) with PDF
        const lastCompleted = await Appointment.findOne({
            userId: user._id,
            practitionerId: meenal._id,
            status: "completed"
        }).sort({ date: -1 });

        if (lastCompleted) {
            const pdfLink = createPrescriptionPDF({
                userId: user._id,
                userName: user.name,
                practitionerName: meenal.name,
                diagnosis: diag,
                lastVisit: '2025-09-15',
                medications: meds
            });

            await Report.create({
                userId: user._id,
                practitionerId: meenal._id,
                appointmentId: lastCompleted._id,
                diagnosis: diag,
                booked: '2025-04-15',
                lastVisit: '2025-09-15',
                notes: `Patient under treatment for ${diag.toLowerCase()}, responding well to topical therapy.`,
                measurements: [
                    { date: '2025-04-15', sugar: 92, systolic: 118, diastolic: 76, weight: 65 },
                    { date: '2025-06-15', sugar: 95, systolic: 120, diastolic: 78, weight: 64 },
                    { date: '2025-08-15', sugar: 90, systolic: 116, diastolic: 75, weight: 63 },
                    { date: '2025-09-15', sugar: 89, systolic: 115, diastolic: 74, weight: 63 }
                ],
                medications: meds,
                pdfLink
            });
        }
    }

    // ===== IMPORTANT MESSAGES (for Riya Patel and Arjun Mehta) =====
    if (riya && meenal) {
        await Message.create({
            userId: riya._id,
            senderId: meenal._id,
            subject: 'Your Recent Blood Test Results are Normal',
            content: 'Dear Riya, I am pleased to inform you that your blood test results from your last visit on September 15th are within the normal range. Keep following the prescribed regimen. Book a follow-up if symptoms persist.',
            dateSent: new Date('2025-10-01'),
            isRead: false
        });
        await Message.create({
            userId: riya._id,
            senderId: admin._id,
            subject: 'System Update: New Payment Gateway',
            content: 'Hello Riya, We have integrated a new payment gateway for faster and more secure transactions. Please use the new payment method for your upcoming appointment.',
            dateSent: new Date('2025-10-25'),
            isRead: true
        });
    }

    if (arjun && meenal) {
        await Message.create({
            userId: arjun._id,
            senderId: meenal._id,
            subject: 'Important: Dosage Change for Doxycycline',
            content: 'Hi Arjun, Please note that your dosage for Doxycycline has been reduced to 50mg, starting from today. This change has been made based on your progress. Discard the old medicine and follow the new prescription in your Health Box.',
            dateSent: new Date('2025-11-05'),
            isRead: false
        });
    }

    console.log('✅ Added rich data for Dr. Meenal Desai (multiple patients, reports & payments).');
    console.log('✅ Added Message and Report (Prescription) data with PDFs.');
    console.log('✅ Database seeding complete.');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed error:', err);
    process.exit(1);
});
