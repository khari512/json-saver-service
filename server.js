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

// GET /Ensis_RFIDSCAN endpoint to fetch merged tags from all records
app.get('/Ensis_RFIDSCAN', async (req, res) => {
  try {
    const content = await fs.readFile(DATA_FILE, 'utf8');
    const arr = JSON.parse(content);

    // Collect all tags from each entry's data.tags
    let mergedTags = [];
    arr.forEach(entry => {
      if (entry.data && Array.isArray(entry.data.tags)) {
        mergedTags = mergedTags.concat(entry.data.tags);
      }
    });

    res.json({ tags: mergedTags });
  } catch (err) {
    if (err.code === 'ENOENT') {
      // File does not exist, return empty tags array
      res.json({ tags: [] });
    } else {
      console.error('Error reading data:', err);
      res.status(500).json({ error: 'Could not fetch tags.' });
    }
  }
});

// DELETE /Ensis_RFIDSCAN endpoint to clear all records
app.delete('/Ensis_RFIDSCAN', async (req, res) => {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify([], null, 2));
    console.log('Data file cleared');
    res.json({ message: 'All records deleted.' });
  } catch (err) {
    console.error('Error clearing data:', err);
    res.status(500).json({ error: 'Could not clear data.' });
  }
});

// POST /data endpoint
app.post('/Ensis_RFIDSCAN', async (req, res) => {
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