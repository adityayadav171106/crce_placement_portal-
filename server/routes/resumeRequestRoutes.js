const express = require('express');

const ResumeRequest = require('../models/ResumeRequest');
const { normalizeEmail, toPlainList } = require('../utils/mongo');

const router = express.Router();
const statuses = new Set(['pending', 'approved', 'rejected']);

async function listRequests() {
  const requests = await ResumeRequest.find().sort({ submittedAt: -1 });
  return toPlainList(requests);
}

router.get('/', async (req, res, next) => {
  try {
    res.json({ resumeRequests: await listRequests() });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      id: req.body.id || `resume-${Date.now()}`,
      studentEmail: normalizeEmail(req.body.studentEmail),
      status: req.body.status || 'pending',
      submittedAt: req.body.submittedAt || new Date()
    };

    if (!payload.studentEmail) {
      res.status(400).json({ message: 'Student email is required.' });
      return;
    }

    await ResumeRequest.findOneAndUpdate(
      { id: payload.id },
      { $setOnInsert: payload },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    res.status(201).json({ resumeRequests: await listRequests() });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/status', async (req, res, next) => {
  try {
    const { status, reviewer } = req.body;

    if (!statuses.has(status)) {
      res.status(400).json({ message: 'Status must be pending, approved, or rejected.' });
      return;
    }

    await ResumeRequest.findOneAndUpdate(
      { id: req.params.id },
      {
        $set: {
          status,
          reviewer: reviewer || 'Faculty',
          reviewedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    res.json({ resumeRequests: await listRequests() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
