const mongoose = require('mongoose');

const resumeSnapshotSchema = new mongoose.Schema({
  education: { type: String, default: '' },
  experience: { type: String, default: '' },
  projects: { type: String, default: '' },
  skills: { type: String, default: '' }
}, { _id: false });

const resumeRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentEmail: { type: String, required: true, lowercase: true, trim: true },
  studentName: { type: String, trim: true },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewer: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  resumeSnapshot: { type: resumeSnapshotSchema, default: () => ({}) }
}, {
  timestamps: true,
  versionKey: false
});

resumeRequestSchema.index({ studentEmail: 1, submittedAt: -1 });

module.exports = mongoose.model('ResumeRequest', resumeRequestSchema);
