const express = require('express');

const ListingRequest = require('../models/ListingRequest');
const { normalizeEmail, toPlainList } = require('../utils/mongo');

const router = express.Router();
const statuses = new Set(['pending', 'approved', 'rejected']);

async function listRequests() {
  const requests = await ListingRequest.find().sort({ submittedAt: -1 });
  return toPlainList(requests);
}

router.get('/', async (req, res, next) => {
  try {
    res.json({ listingRequests: await listRequests() });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      id: req.body.id || `listing-${Date.now()}`,
      type: req.body.type || 'internship',
      recruiterEmail: normalizeEmail(req.body.recruiterEmail),
      status: req.body.status || 'pending',
      submittedAt: req.body.submittedAt || new Date()
    };

    if (!payload.opportunity) {
      res.status(400).json({ message: 'Opportunity details are required.' });
      return;
    }

    await ListingRequest.findOneAndUpdate(
      { id: payload.id },
      { $setOnInsert: payload },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    res.status(201).json({ listingRequests: await listRequests() });
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

    await ListingRequest.findOneAndUpdate(
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

    res.json({ listingRequests: await listRequests() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
