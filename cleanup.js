const fs = require("fs");
const path = require("path");

const DOWNLOAD_DIR = path.join(__dirname, "downloads");
const MAX_AGE = 6 * 60 * 60 * 1000; // 6 jam

function cleanup() {
  fs.readdir(DOWNLOAD_DIR, (err, files) => {
    if (err) return console.error("Failed to read downloads folder:", err);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(DOWNLOAD_DIR, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return console.error("Failed to stat file:", file);
        if (now - stats.mtimeMs > MAX_AGE) {
          fs.unlink(filePath, err => {
            if (err) console.error("Failed to delete file:", file);
            else console.log("Deleted old file:", file);
          });
        }
      });
    });
  });
}

setInterval(cleanup, 30 * 60 * 1000); // setiap 30 menit
cleanup(); // jalankan sekali saat start
console.log("Cleanup script running. Old files will be deleted automatically.");
