FROM node:20-bookworm

# Skip all browser downloads BEFORE npm install
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
ENV REMOTION_CHROME_EXECUTABLE_PATH=/usr/bin/chromium
ENV CHROME_PATH=/usr/bin/chromium

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

WORKDIR /app

# Copy package files and .npmrc
COPY package*.json .npmrc ./

# Install dependencies (env vars set above should prevent browser download)
RUN npm install

# Copy source files
COPY . .

# Create output directory
RUN mkdir -p /tmp/renders

# Verify chromium is available
RUN /usr/bin/chromium --version || echo "Chromium check failed"

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

# Start server
CMD ["node", "server.js"]
