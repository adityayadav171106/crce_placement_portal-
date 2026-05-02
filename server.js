require('dotenv').config({ quiet: true });

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const applicationRoutes = require('./server/routes/applicationRoutes');
const authRoutes = require('./server/routes/authRoutes');
const listingRequestRoutes = require('./server/routes/listingRequestRoutes');
const opportunityRoutes = require('./server/routes/opportunityRoutes');
const resumeRequestRoutes = require('./server/routes/resumeRequestRoutes');
const studentRoutes = require('./server/routes/studentRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/crce-placement-cell';
const DIST_DIR = path.join(__dirname, 'dist');

app.use(cors({
  origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      message: 'MongoDB is not connected. Set MONGO_URI and make sure MongoDB is running.'
    });
    return;
  }

  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/resume-requests', resumeRequestRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/opportunity-listing-requests', listingRequestRoutes);

app.use(express.static(DIST_DIR, {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    next();
    return;
  }

  res.sendFile(path.join(DIST_DIR, 'index.html'), error => {
    if (error) {
      res.status(404).send('<h1>404</h1><p>Build the React app with <code>npm run build</code>, then start the server again.</p>');
    }
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    next(error);
    return;
  }

  const status = error.status || 500;
  res.status(status).json({
    message: status === 500 ? 'Something went wrong.' : error.message
  });
});

app.listen(PORT, () => {
  console.log(`CRCE Placement Cell MERN server running at http://localhost:${PORT}`);
});

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(error => {
    console.error('MongoDB connection failed:', error.message);
  });
