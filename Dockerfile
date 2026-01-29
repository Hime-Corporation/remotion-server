FROM node:20-bookworm

# Install Linux dependencies for Chrome Headless Shell
RUN apt-get update && apt-get install -y \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libasound2 \
    libxrandr2 \
    libxkbcommon0 \
    libxfixes3 \
    libxcomposite1 \
    libxdamage1 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libatspi2.0-0 \
    libcups2 \
    fonts-liberation \
    fonts-noto-color-emoji \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Download chrome-headless-shell
RUN npx @puppeteer/browsers install chrome-headless-shell@stable && \
    echo "=== Chrome installed to ===" && \
    find /app -name "chrome-headless-shell" -type f 2>/dev/null && \
    ls -la /app/chrome-headless-shell* 2>/dev/null || true

COPY package*.json ./
RUN npm install

COPY . .

RUN mkdir -p /tmp/renders

# Try to find the actual binary path
RUN CHROME_PATH=$(find /app -name "chrome-headless-shell" -type f 2>/dev/null | head -1) && \
    echo "Chrome path: $CHROME_PATH" && \
    echo "REMOTION_CHROME_EXECUTABLE_PATH=$CHROME_PATH" >> /app/.env

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
