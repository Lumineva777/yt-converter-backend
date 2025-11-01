# Dockerfile
FROM node:18-bullseye

# install system deps: ffmpeg, python3, pip, unzip, ca-certificates
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# install yt-dlp (executable) via pip
RUN pip3 install --no-cache-dir yt-dlp

# create app dir
WORKDIR /usr/src/app

# copy package files first for caching
COPY package.json package-lock.json* ./

# install node deps
RUN npm install --production

# copy rest
COPY . .

# create downloads dir
RUN mkdir -p /usr/src/app/downloads

# expose port and default cmd
EXPOSE 3000
CMD ["npm", "start"]
