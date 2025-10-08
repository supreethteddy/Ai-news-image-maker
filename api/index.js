// Vercel serverless function entry point
const express = require('express');
const cors = require('cors');
const path = require('path');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: true,
  credentials: true
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import your existing app and use it
const backendApp = require('../backend/src/app.js');

// Use the backend app for all routes
app.use('/', backendApp);

// Export for Vercel
module.exports = app;
