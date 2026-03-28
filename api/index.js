const express = require('express');
const multer = require('multer');
const fs = require('fs');
const cors = require('cors');
const net = require('net');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// =====================
// FILE UPLOAD SETUP
// =====================
const storage = multer.diskStorage({
  destination: '/storage/music',
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

// =====================
// ROUTES
// =====================

// UPLOAD
app.post('/upload', upload.array('files'), (req, res) => {
  res.json({ success: true, files: req.files });
});

// TRACK LIST
app.get('/tracks', (req, res) => {
  const files = fs.readdirSync('/storage/music');
  res.json(files);
});

// =====================
// PLAYLIST MANAGEMENT
// =====================

// LIST PLAYLISTS
app.get('/playlists', (req, res) => {
  const files = fs.readdirSync('/storage');

  const playlists = files
    .filter(f => f.endsWith('.json'))
    .map(f => f.replace('.json', ''));

  res.json(playlists);
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

// EXPORT PLAYLIST → creates master.m3u
app.post('/playlist/export', (req, res) => {
  const { tracks } = req.body;

  if (!tracks || !tracks.length) {
    return res.status(400).json({ error: "No tracks provided" });
  }

  const filePath = '/storage/master.m3u';

  const content = tracks
    .map(track => `/storage/music/${track}`)
    .join('\n');

  fs.writeFileSync(filePath, content);

  console.log("✅ MASTER PLAYLIST CREATED:");
  console.log(content);

  res.json({ success: true });
});

// =====================
// (OPTIONAL) ENQUEUE (OLD SYSTEM)
// =====================
app.post('/enqueue', (req, res) => {
  const track = req.body.track;

  const client = new net.Socket();

  client.connect(1234, 'liquidsoap', () => {
    const command = `radio_queue.push annotate:title="${track}":/storage/music/${track}\n`;

    console.log("Sending command:", command);

    client.write(command);
    client.end();
  });

  client.on('error', (err) => {
    console.error("Liquidsoap error:", err);
  });

  console.log("🎧 Playing:", track);

  res.json({ success: true });
});

// =====================
// DEBUG ROUTES
// =====================

app.get('/debug/m3u', (req, res) => {
  if (!fs.existsSync('/storage/master.m3u')) {
    return res.send("NO FILE");
  }

  const content = fs.readFileSync('/storage/master.m3u', 'utf-8');
  res.send(content);
});

app.get('/debug/music', (req, res) => {
  try {
    const files = fs.readdirSync('/storage/music');
    res.json(files);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =====================
// START SERVER
// =====================

app.listen(3000, '0.0.0.0', () => console.log('API running'));
