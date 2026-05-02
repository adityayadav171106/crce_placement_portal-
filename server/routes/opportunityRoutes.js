const express = require('express');

const Opportunity = require('../models/Opportunity');
const { normalizeEmail, toPlainList } = require('../utils/mongo');

const router = express.Router();

function routeType(kind) {
  return kind === 'placements' ? 'placement' : 'internship';
}

async function listOpportunities(type) {
  const opportunities = await Opportunity.find({ type }).sort({ postedAt: -1 });
  return toPlainList(opportunities);
}

function preparePayload(req, type) {
  const id = req.body.id || Date.now();

  return {
    ...req.body,
    id: String(id),
    type,
    recruiterEmail: normalizeEmail(req.body.recruiterEmail),
    tags: Array.isArray(req.body.tags) ? req.body.tags : [],
    domains: Array.isArray(req.body.domains) ? req.body.domains : [],
    postedAt: req.body.postedAt || new Date()
  };
}

router.get('/:kind', async (req, res, next) => {
  try {
    const type = routeType(req.params.kind);
    const key = type === 'placement' ? 'postedPlacements' : 'postedInternships';
    res.json({ [key]: await listOpportunities(type) });
  } catch (error) {
    next(error);
  }
});

router.post('/:kind', async (req, res, next) => {
  try {
    const type = routeType(req.params.kind);
    const payload = preparePayload(req, type);
    const key = type === 'placement' ? 'postedPlacements' : 'postedInternships';

    if (!payload.company || !payload.role) {
      res.status(400).json({ message: 'Company and role are required.' });
      return;
    }

    await Opportunity.findOneAndUpdate(
      { id: payload.id },
      { $set: payload },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    res.status(201).json({ [key]: await listOpportunities(type) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
