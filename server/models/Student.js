const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  education: { type: String, default: '' },
  experience: { type: String, default: '' },
  projects: { type: String, default: '' },
  skills: { type: String, default: '' }
}, { _id: false });

const studentSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  department: { type: String, trim: true },
  year: { type: String, trim: true },
  roll: { type: String, trim: true },
  phone: { type: String, trim: true },
  skills: { type: String, trim: true },
  linkedin: { type: String, trim: true },
  photo: { type: String, default: '' },
  resume: { type: resumeSchema, default: () => ({}) }
}, {
  timestamps: true,
  versionKey: false
});

module.exports = mongoose.model('Student', studentSchema);
