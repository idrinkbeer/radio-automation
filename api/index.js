const express = require('express');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(express.json());

const upload = multer({ dest: '/storage/music' });

app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ success: true, file: req.file });
});

app.get('/tracks', (req, res) => {
  const files = fs.readdirSync('/storage/music');
  res.json(files);
});

app.listen(3000, '0.0.0.0', () => console.log('API running on 3000'));
