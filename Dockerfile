# Use Playwright image which has Chrome properly configured
FROM mcr.microsoft.com/playwright:v1.48.0-noble

# Install Node.js 20
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install

# Copy source
COPY . .

# Create output dir
RUN mkdir -p /tmp/renders

# Set Chrome path to Playwright's Chrome
ENV REMOTION_CHROME_EXECUTABLE_PATH=/ms-playwright/chromium-1140/chrome-linux/chrome

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
