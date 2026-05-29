// models/User.js
const mongoose = require('mongoose');

const FamilyMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String, required: true },
  age: { type: Number, required: true }
}, { _id: false });

const ProfileSchema = new mongoose.Schema({
  phone: String,
  address: String,
  photo: String
}, { _id: false });

const FavoriteSchema = new mongoose.Schema({
  type: { type: String, enum: ['doctor', 'clinic'], required: true },
  refId: { type: mongoose.Schema.Types.ObjectId, required: true },
  addedAt: { type: Date, default: Date.now }
}, { _id: false }); // no separate _id for subdocument

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user','practitioner','admin'], default: 'user' },
  specialization: String,
  fees: Number,
  experience: Number,
  profile: {
    phone: String,
    address: String,
    photo: String
  },
  familyMembers: [FamilyMemberSchema],
  
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  resetToken: String,
  resetTokenExpiry: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
