FROM node:20-bookworm

# Install browser dependencies + Chromium for ARM64 compatibility
RUN apt-get update && apt-get install -y \
    chromium \
    libnss3 \
    libdbus-1-3 \
    libatk1.0-0 \
    libasound2 \
    libxrandr2 \
    libxkbcommon-dev \
    libxfixes3 \
    libxcomposite1 \
    libxdamage1 \
    libgbm-dev \
    libcups2 \
    libcairo2 \
    libpango-1.0-0 \
    libatk-bridge2.0-0 \
    fonts-liberation \
    fonts-noto-color-emoji \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Find actual chromium path
RUN which chromium || which chromium-browser || ls -la /usr/bin/chrom* || true

WORKDIR /app

# Skip all browser downloads
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV REMOTION_CHROME_EXECUTABLE_PATH=/usr/bin/chromium

# Copy package files
COPY package*.json ./

# Install deps without scripts (skip browser downloads)
RUN npm install --ignore-scripts

# Copy source files
COPY . .

# Create output directory
RUN mkdir -p /tmp/renders

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start server
CMD ["node", "server.js"]
