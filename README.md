# YT Converter Backend

## Run locally (requires Docker)
docker build -t yt-converter .
docker run --rm -p 3000:3000 -e API_KEY=secretkey yt-converter

## API
POST /api/download
Body JSON: { "url": "https://www.youtube.com/watch?v=..." }
Header: x-api-key: <value>  (if API_KEY set)
