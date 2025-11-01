// server.js
const express = require('express');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;
const DOWNLOAD_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

// simple API key protection (set API_KEY in env)
const REQUIRED_API_KEY = process.env.API_KEY || null;

function checkApiKey(req, res) {
  if (!REQUIRED_API_KEY) return true; // no key required if not set
  const key = req.headers['x-api-key'] || req.query.api_key;
  if (key !== REQUIRED_API_KEY) {
    res.status(401).json({ error: 'Unauthorized: invalid API key' });
    return false;
  }
  return true;
}

app.post('/api/download', async (req, res) => {
  if (!checkApiKey(req, res)) return;

  const url = req.body.url;
  if (!url) return res.status(400).json({ error: 'Missing url in body' });

  // generate filename
  const id = uuidv4();
  const outfileBase = `yt_${id}`;
  const outputPathTemplate = path.join(DOWNLOAD_DIR, `${outfileBase}.%(ext)s`); // yt-dlp template

  // Build yt-dlp command:
  // -x : extract audio
  // --audio-format mp3 : convert to mp3 via ffmpeg
  // -o : output template
  const args = [
    '-x',
    '--audio-format', 'mp3',
    '--no-playlist',
    '-o', outputPathTemplate,
    url
  ];

  // spawn yt-dlp
  const ytdlp = spawn('yt-dlp', args);

  let stdout = '';
  let stderr = '';
  ytdlp.stdout.on('data', (d) => { stdout += d.toString(); });
  ytdlp.stderr.on('data', (d) => { stderr += d.toString(); });

  ytdlp.on('close', (code) => {
    if (code !== 0) {
      console.error('yt-dlp failed', code, stderr);
      return res.status(500).json({ error: 'Download/convert failed', detail: stderr });
    }

    // find generated mp3 file
    const files = fs.readdirSync(DOWNLOAD_DIR);
    const mp3 = files.find(f => f.startsWith(`yt_${id}`) && f.endsWith('.mp3'));
    if (!mp3) {
      console.error('mp3 not found, stdout:', stdout, 'stderr:', stderr);
      return res.status(500).json({ error: 'Converted file not found' });
    }

    const fileUrl = `${req.protocol}://${req.get('host')}/file/${mp3}`;
    res.json({ message: 'ok', file: fileUrl });
  });
});

// serve static files
app.use('/file', express.static(DOWNLOAD_DIR));

// basic health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
