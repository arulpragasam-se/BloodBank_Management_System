require('dotenv').config();
const express = require('express');

const app = express();
const port = process.env.PORT || 5000;

// Basic middleware
app.use(express.json());

// Test route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test API route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'API is working' });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Test server running on port ${port}`);
  console.log(`🌐 Health check: http://localhost:${port}/health`);
});

module.exports = app;