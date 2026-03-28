const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Store with original filenames
const storage = multer.diskStorage({
  destination: '/storage/music',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// MULTI UPLOAD
app.post('/upload', upload.array('files'), (req, res) => {
  res.json({ success: true, files: req.files });
});

// TRACK LIST
app.get('/tracks', (req, res) => {
  const files = fs.readdirSync('/storage/music');
  res.json(files);
});

// ENQUEUE
const net = require('net');

app.post('/enqueue', (req, res) => {
  const track = req.body.track;

  const client = new net.Socket();

  client.connect(1234, 'liquidsoap', () => {
    const command = `radio_queue.push annotate:title="${track}":/storage/music/${track}\n`;

    console.log("Sending command:", command);

    client.write(command);
    client.end();
  });

  // SAVE PLAYLIST
app.post('/playlist/save', (req, res) => {
  const { name, tracks } = req.body;

  fs.writeFileSync(
    `/storage/${name}.json`,
    JSON.stringify(tracks, null, 2)
  );

  res.json({ success: true });
});

// LOAD PLAYLIST
app.get('/playlist/:name', (req, res) => {
  const name = req.params.name;

  const data = fs.readFileSync(`/storage/${name}.json`);
  res.json(JSON.parse(data));
});

  client.on('error', (err) => {
    console.error("Liquidsoap error:", err);
  });

  console.log("🎧 Playing:", track);

  res.json({ success: true });
});

app.listen(3000, '0.0.0.0', () => console.log('API running'));
