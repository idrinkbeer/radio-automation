const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// File upload setup
const upload = multer({ dest: '/storage/music' });

// MULTIPLE FILE UPLOAD
app.post('/upload', upload.array('files'), (req, res) => {
  res.json({ success: true, files: req.files });
});

/**
 * Get all tracks
 */
app.get('/tracks', (req, res) => {
  const files = fs.readdirSync('/storage/music');
  res.json(files);
});

/**
 * Enqueue track (NEW)
 */
app.post('/enqueue', (req, res) => {
  const track = req.body.track;

  console.log("🎧 Queueing track:", track);

  res.json({ success: true });
});

// Start server (KEEP THIS LAST)
app.listen(3000, '0.0.0.0', () => {
  console.log('API running on port 3000');
});
