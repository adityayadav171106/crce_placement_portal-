const mongoose = require('mongoose');

const listingRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['internship', 'placement'],
    default: 'internship'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reason: { type: String, trim: true },
  recruiterEmail: { type: String, lowercase: true, trim: true },
  recruiterName: { type: String, trim: true },
  submittedAt: { type: Date, default: Date.now },
  reviewedAt: { type: Date },
  reviewer: { type: String, trim: true },
  opportunity: { type: mongoose.Schema.Types.Mixed, required: true }
}, {
  timestamps: true,
  versionKey: false
});

listingRequestSchema.index({ status: 1, submittedAt: -1 });
listingRequestSchema.index({ recruiterEmail: 1, submittedAt: -1 });

module.exports = mongoose.model('ListingRequest', listingRequestSchema);
