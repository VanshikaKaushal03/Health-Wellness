// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success:false, message: 'No token provided' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ success:false, message: 'Invalid token' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success:false, message: 'Token error', error: err.message });
  }
};

module.exports = authMiddleware;
