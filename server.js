const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

// HTTP request logger
app.use(morgan('combined'));

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Health check endpoint
app.get('/', (req, res) => {
  console.log(`[${new Date().toISOString()}] Health check requested`);
  res.send('OK');
});


// POST /data endpoint
app.post('/data', async (req, res) => {
  console.log(`[${new Date().toISOString()}] Incoming POST /data`, req.body);
  try {
    const incoming = req.body;
    let arr = [];

    // Load existing array or initialize
    try {
      const content = await fs.readFile(DATA_FILE, 'utf8');
      arr = JSON.parse(content);
      console.log('Loaded existing data array, length:', arr.length);
    } catch (readErr) {
      console.warn('Could not read data file, starting new array:', readErr.message);
      arr = [];
    }

    // Append new entry
    const entry = { timestamp: new Date().toISOString(), data: incoming };
    arr.push(entry);
    console.log('Appending entry:', entry);

    // Write updated array back
    await fs.writeFile(DATA_FILE, JSON.stringify(arr, null, 2));
    console.log('Data file updated successfully');

    res.status(201).json({ message: 'Data saved.' });
  } catch (err) {
    console.error('Error saving data:', err);
    res.status(500).json({ error: 'Could not save data.' });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Startup
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Elastic Beanstalk instance:', process.env.AWS_EB_CUSTOM_PLATFORM || 'N/A');
});