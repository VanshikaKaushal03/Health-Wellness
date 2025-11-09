// backend/server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const apptRoutes = require('./routes/appointments');
const paymentRoutes = require('./routes/payments');
const reportRoutes = require('./routes/reports');
const messageRoutes = require('./routes/messageRoutes');
const favoritesRoute = require('./routes/favorites');
const receiptRoutes = require("./routes/receiptRoutes");


const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Connect MongoDB
connectDB(process.env.MONGO_URI);

// ✅ Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const path = require('path');

app.use('/reports', express.static(path.join(__dirname, 'uploads/reports')));

// ✅ Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// ✅ Fallback route for direct HTML access
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/prescriptions.html'));
});


// ✅ Base route
app.get('/', (req, res) =>
  res.json({ success: true, message: 'Health & Wellness Backend running 🚀' })
);

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', apptRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/practitioner', require('./routes/practitioner'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/messages', messageRoutes); // Handles /api/messages/...
app.use('/api/favorites', favoritesRoute);  
app.use('/api/public', require('./routes/publicRoutes'));
app.use("/api", receiptRoutes);


// ✅ Error handler (last middleware)
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`✅ Server started on http://localhost:${PORT}`);
});


