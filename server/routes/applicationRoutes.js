const express = require('express');

const Application = require('../models/Application');
const { normalizeEmail, toPlainList } = require('../utils/mongo');

const router = express.Router();
const statuses = new Set(['pending', 'approved', 'rejected']);

function routeType(kind) {
  return kind === 'placements' ? 'placement' : 'internship';
}

async function listApplications(type) {
  const applications = await Application.find({ type }).sort({ submittedAt: -1 });
  return toPlainList(applications);
}

function preparePayload(req, type) {
  return {
    ...req.body,
    id: req.body.id || `${type}-${Date.now()}`,
    type,
    studentEmail: normalizeEmail(req.body.studentEmail),
    status: req.body.status || 'pending',
    submittedAt: req.body.submittedAt || new Date()
  };
}

router.get('/:kind', async (req, res, next) => {
  try {
    const type = routeType(req.params.kind);
    const key = type === 'placement' ? 'placementApplications' : 'internshipApplications';
    res.json({ [key]: await listApplications(type) });
  } catch (error) {
    next(error);
  }
});

router.post('/:kind', async (req, res, next) => {
  try {
    const type = routeType(req.params.kind);
    const payload = preparePayload(req, type);
    const key = type === 'placement' ? 'placementApplications' : 'internshipApplications';

    if (!payload.studentEmail) {
      res.status(400).json({ message: 'Student email is required.' });
      return;
    }

    await Application.findOneAndUpdate(
      { id: payload.id },
      { $setOnInsert: payload },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    res.status(201).json({ [key]: await listApplications(type) });
  } catch (error) {
    next(error);
  }
});

router.patch('/:kind/:id/status', async (req, res, next) => {
  try {
    const type = routeType(req.params.kind);
    const key = type === 'placement' ? 'placementApplications' : 'internshipApplications';
    const { status, reviewer } = req.body;

    if (!statuses.has(status)) {
      res.status(400).json({ message: 'Status must be pending, approved, or rejected.' });
      return;
    }

    await Application.findOneAndUpdate(
      { id: req.params.id, type },
      {
        $set: {
          status,
          reviewer: reviewer || 'Faculty',
          reviewedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    res.json({ [key]: await listApplications(type) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
