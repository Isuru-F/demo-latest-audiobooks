const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
app.disable('x-powered-by'); // Extra safety net - helmet also does this
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet()); // Comprehensive security headers including X-Powered-By removal
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', require('./src/routes'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Only start the server if not in a test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; // For testing purposes