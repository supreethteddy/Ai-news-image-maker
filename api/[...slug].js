// Vercel serverless function for all API routes
const express = require('express');
const cors = require('cors');

// Create Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: true,
  credentials: true
}));

// Import your existing backend app
const backendApp = require('../backend/src/app.js');

// Use the backend app
app.use('/', backendApp);

// Export for Vercel
module.exports = app;
