const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['internship', 'placement'],
    required: true
  },
  company: { type: String, required: true, trim: true },
  role: { type: String, required: true, trim: true },
  logo: { type: String, trim: true },
  location: { type: String, trim: true },
  mode: { type: String, trim: true },
  domains: [{ type: String, trim: true }],
  department: { type: String, trim: true },
  deadline: { type: String, trim: true },
  deadlineRaw: { type: String, trim: true },
  eligibility: { type: String, trim: true },
  assessmentPlan: { type: String, trim: true },
  description: { type: String, trim: true },
  tags: [{ type: String, trim: true }],
  recruiterName: { type: String, trim: true },
  recruiterEmail: { type: String, lowercase: true, trim: true },
  postedBy: { type: String, trim: true },
  postedAt: { type: Date, default: Date.now },
  facultyApprovedAt: { type: Date },
  facultyReviewer: { type: String, trim: true },
  startDate: { type: String, trim: true },
  endDate: { type: String, trim: true },
  startDateRaw: { type: String, trim: true },
  endDateRaw: { type: String, trim: true },
  stipend: { type: String, trim: true },
  durationWeeks: { type: Number },
  duration: { type: String, trim: true },
  package: { type: String, trim: true },
  employmentType: { type: String, trim: true }
}, {
  timestamps: true,
  versionKey: false
});

opportunitySchema.index({ type: 1, postedAt: -1 });

module.exports = mongoose.model('Opportunity', opportunitySchema);
