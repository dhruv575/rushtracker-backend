const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors());
app.use(express.json());

// Root endpoint for deployment verification
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Rushtracker Backend Server is Live and Running! 🚀',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    test: true
  });
});

// Basic route
app.get('/api', (req, res) => {
  res.json({ message: 'Welcome to Rushtracker API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Test Server is running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Server URL: http://localhost:${PORT}`);
});

module.exports = app;
