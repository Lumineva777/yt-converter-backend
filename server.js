const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = 3000;
const API_KEY = process.env.API_KEY || "secretkey"; 
const DOWNLOAD_DIR = path.join(__dirname, "downloads");

if (!fs.existsSync(DOWNLOAD_DIR)) fs.mkdirSync(DOWNLOAD_DIR);

app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Server yt-dlp is running!");
});

// Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

// Download YouTube to MP3
app.post("/api/download", (req, res) => {
  const key = req.headers["x-api-key"];
  if (key !== API_KEY) return res.status(401).json({ error: "Invalid API key" });

  const videoUrl = req.body.url;
  if (!videoUrl) return res.status(400).json({ error: "Missing url" });

  const fileId = uuidv4();
  const filePath = path.join(DOWNLOAD_DIR, `yt_${fileId}.mp3`);
  const cmd = `yt-dlp -x --audio-format mp3 -o "${filePath}" "${videoUrl}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to download video" });
    }
    res.json({
      message: "ok",
      file: `/file/yt_${fileId}.mp3`,
      fullUrl: `http://localhost:${PORT}/file/yt_${fileId}.mp3`
    });
  });
});

// Serve MP3 files
app.use("/file", express.static(DOWNLOAD_DIR));

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
