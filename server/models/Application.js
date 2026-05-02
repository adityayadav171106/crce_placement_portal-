const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['internship', 'placement'],
    required: true
  },
  internshipId: { type: mongoose.Schema.Types.Mixed },
  placementId: { type: mongoose.Schema.Types.Mixed },
  internshipRole: { type: String, trim: true },
  placementRole: { type: String, trim: true },
  company: { type: String, trim: true },
  studentEmail: { type: String, required: true, lowercase: true, trim: true },
  studentName: { type: String, trim: true },
  department: { type: String, trim: true },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewer: { type: String, trim: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
  versionKey: false
});

applicationSchema.index({ type: 1, studentEmail: 1, submittedAt: -1 });

module.exports = mongoose.model('Application', applicationSchema);
