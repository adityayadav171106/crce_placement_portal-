const express = require('express');

const Student = require('../models/Student');
const { cleanUndefined, normalizeEmail, toPlain, toPlainList } = require('../utils/mongo');

const router = express.Router();

async function listStudents() {
  const students = await Student.find().sort({ name: 1, email: 1 });
  return toPlainList(students);
}

function cleanStudentPayload(student) {
  const email = normalizeEmail(student.email);
  return cleanUndefined({
    name: student.name,
    email,
    department: student.department,
    year: student.year,
    roll: student.roll,
    phone: student.phone,
    skills: student.skills,
    linkedin: student.linkedin,
    photo: student.photo,
    resume: student.resume
  });
}

router.get('/', async (req, res, next) => {
  try {
    res.json({ students: await listStudents() });
  } catch (error) {
    next(error);
  }
});

router.post('/seed', async (req, res, next) => {
  try {
    const students = Array.isArray(req.body.students) ? req.body.students : [];

    await Promise.all(students.map(async student => {
      const payload = cleanStudentPayload(student);
      if (!payload.email) return;
      await Student.updateOne(
        { email: payload.email },
        { $setOnInsert: payload },
        { upsert: true }
      );
    }));

    res.json({ students: await listStudents() });
  } catch (error) {
    next(error);
  }
});

router.post('/upsert', async (req, res, next) => {
  try {
    const incoming = req.body.student || req.body;
    const payload = cleanStudentPayload(incoming);

    if (!payload.email) {
      res.status(400).json({ message: 'Student email is required.' });
      return;
    }

    const current = await Student.findOne({ email: payload.email });
    const { createdAt, updatedAt, ...existing } = toPlain(current) || {};
    const merged = {
      ...existing,
      ...payload,
      resume: {
        ...(existing.resume || {}),
        ...(payload.resume || {})
      }
    };

    await Student.findOneAndUpdate(
      { email: payload.email },
      { $set: merged },
      { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ students: await listStudents() });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
