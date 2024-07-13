// models/userModel.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    // You can add additional validation for email format if needed
  },
  password: {
    type: String,
    required: true,
  },
  usertype: {
    type: String,
    enum: ['admin', 'manager'],
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  // You can add more fields related to users if needed
});

const User = mongoose.model('User', userSchema);

module.exports = User;
