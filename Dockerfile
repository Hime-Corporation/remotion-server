FROM node:20-bookworm

# Install Google Chrome (has ARM64 support and new headless mode)
RUN apt-get update && apt-get install -y wget gnupg && \
    wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-chrome.gpg && \
    echo "deb [arch=arm64,amd64 signed-by=/usr/share/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list && \
    apt-get update && \
    apt-get install -y google-chrome-stable fonts-liberation fonts-noto-color-emoji || \
    apt-get install -y chromium fonts-liberation fonts-noto-color-emoji && \
    rm -rf /var/lib/apt/lists/*

# Find Chrome path
RUN which google-chrome-stable || which google-chrome || which chromium || echo "No chrome found"

WORKDIR /app

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

COPY package*.json ./
RUN npm install

COPY . .
RUN mkdir -p /tmp/renders

# Set Chrome path (try Google Chrome first, fallback to Chromium)
ENV REMOTION_CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
