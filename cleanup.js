// cleanup.js
const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, 'downloads');
const MAX_AGE_MS = 1000 * 60 * 60; // 1 jam

fs.readdir(DIR, (err, files) => {
  if (err) return console.error(err);
  files.forEach(f => {
    const p = path.join(DIR, f);
    fs.stat(p, (e, st) => {
      if (e) return;
      if ((Date.now() - st.mtimeMs) > MAX_AGE_MS) fs.unlink(p, () => {});
    });
  });
});
