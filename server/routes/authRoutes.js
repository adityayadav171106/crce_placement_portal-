const bcrypt = require('bcryptjs');
const express = require('express');

const User = require('../models/User');
const { normalizeEmail, toPlain } = require('../utils/mongo');

const router = express.Router();
const roles = new Set(['student', 'faculty', 'recruiter']);

function displayNameFromEmail(email) {
  return email
    .split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, letter => letter.toUpperCase());
}

function publicUser(user) {
  const value = toPlain(user);
  return {
    name: value.name,
    email: value.email,
    role: value.role,
    loggedIn: true
  };
}

router.post('/login', async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body.email);
    const role = req.body.role;
    const password = req.body.password || '';
    const newPassword = req.body.newPassword || '';
    const wantsPasswordReset = Boolean(req.body.setPassword);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: 'Enter a valid email address.' });
      return;
    }

    if (!roles.has(role)) {
      res.status(400).json({ message: 'Select a valid role.' });
      return;
    }

    let user = await User.findOne({ email, role });

    if (wantsPasswordReset) {
      if (newPassword.length < 6) {
        res.status(400).json({ message: 'New password must be at least 6 characters.' });
        return;
      }

      if (user && password && !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401).json({ message: 'Current password is incorrect.' });
        return;
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      user = await User.findOneAndUpdate(
        { email, role },
        {
          $set: {
            name: user?.name || displayNameFromEmail(email),
            email,
            role,
            passwordHash
          }
        },
        { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true }
      );

      res.json({ user: publicUser(user) });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters.' });
      return;
    }

    if (!user) {
      user = await User.create({
        name: displayNameFromEmail(email),
        email,
        role,
        passwordHash: await bcrypt.hash(password, 10)
      });
    } else if (!(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ message: 'Incorrect email, role, or password.' });
      return;
    }

    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
