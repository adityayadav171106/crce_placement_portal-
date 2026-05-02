const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  role: {
    type: String,
    enum: ['student', 'faculty', 'recruiter'],
    required: true
  },
  passwordHash: { type: String, required: true }
}, {
  timestamps: true,
  versionKey: false
});

userSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
