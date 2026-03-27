const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: '/storage/music' });

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ success: true, file: req.file });
});

app.get('/tracks', (req, res) => {
  const files = fs.readdirSync('/storage/music');
  res.json(files);
});

app.listen(3000, '0.0.0.0', () => console.log('API running'));

app.post('/enqueue', (req, res) => {
  const track = req.body.track;

  // Send to Liquidsoap via telnet (next step will improve this)
  console.log("Queueing track:", track);

  res.json({ success: true });
});
