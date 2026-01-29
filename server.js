const express = require('express');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3000;
const OUTPUT_DIR = process.env.OUTPUT_DIR || '/tmp/renders';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Store render jobs
const jobs = new Map();

// Use @sparticuz/chromium for ARM64 support
const chromium = require('@sparticuz/chromium');

let chromePath = null;

// Get Chrome path on startup
(async () => {
  try {
    chromePath = await chromium.executablePath();
    console.log('Chrome path:', chromePath);
  } catch (e) {
    console.log('Could not get Chrome path:', e.message);
  }
})();

// Browser options will be set when Chrome path is available
function getBrowserOptions() {
  return {
    ...(chromePath && { browserExecutable: chromePath }),
    chromiumOptions: {
      args: chromium.args,
    },
  };
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0' });
});

// Start a render job
app.post('/render', async (req, res) => {
  const {
    compositionId = 'ChatDemo',
    inputProps = {},
    codec = 'h264',
    outputFormat = 'mp4',
  } = req.body;

  const jobId = uuidv4();
  const outputPath = path.join(OUTPUT_DIR, `${jobId}.${outputFormat}`);

  jobs.set(jobId, {
    id: jobId,
    status: 'queued',
    progress: 0,
    compositionId,
    outputPath,
    createdAt: new Date().toISOString(),
    error: null
  });

  res.json({ jobId, status: 'queued' });

  // Process render async
  (async () => {
    try {
      jobs.get(jobId).status = 'bundling';

      const bundled = await bundle({
        entryPoint: path.join(__dirname, 'src/index.ts'),
        webpackOverride: (config) => config,
      });

      jobs.get(jobId).status = 'rendering';

      const composition = await selectComposition({
        serveUrl: bundled,
        id: compositionId,
        inputProps,
        ...getBrowserOptions(),
      });

      await renderMedia({
        composition,
        serveUrl: bundled,
        codec,
        outputLocation: outputPath,
        inputProps,
        ...getBrowserOptions(),
        onProgress: ({ progress }) => {
          const job = jobs.get(jobId);
          if (job) {
            job.progress = Math.round(progress * 100);
          }
        },
      });

      const job = jobs.get(jobId);
      job.status = 'completed';
      job.progress = 100;
      job.completedAt = new Date().toISOString();
      job.fileSize = fs.statSync(outputPath).size;

    } catch (error) {
      const job = jobs.get(jobId);
      if (job) {
        job.status = 'failed';
        job.error = error.message;
      }
      console.error(`Job ${jobId} failed:`, error);
    }
  })();
});

// Get job status
app.get('/jobs/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json(job);
});

// Download rendered file
app.get('/jobs/:jobId/download', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  if (job.status !== 'completed') {
    return res.status(400).json({ error: 'Job not completed', status: job.status });
  }
  if (!fs.existsSync(job.outputPath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.download(job.outputPath);
});

// List all jobs
app.get('/jobs', (req, res) => {
  const allJobs = Array.from(jobs.values()).map(j => ({
    id: j.id,
    status: j.status,
    progress: j.progress,
    compositionId: j.compositionId,
    createdAt: j.createdAt,
    completedAt: j.completedAt,
    error: j.error
  }));
  res.json({ jobs: allJobs });
});

// Delete a job
app.delete('/jobs/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  if (fs.existsSync(job.outputPath)) {
    fs.unlinkSync(job.outputPath);
  }
  jobs.delete(req.params.jobId);
  res.json({ deleted: true });
});

// Quick render - sync
app.post('/render/quick', async (req, res) => {
  const {
    compositionId = 'ChatDemo',
    inputProps = {},
    codec = 'h264',
    outputFormat = 'mp4'
  } = req.body;

  const jobId = uuidv4();
  const outputPath = path.join(OUTPUT_DIR, `${jobId}.${outputFormat}`);

  try {
    const bundled = await bundle({
      entryPoint: path.join(__dirname, 'src/index.ts'),
      webpackOverride: (config) => config,
    });

    const composition = await selectComposition({
      serveUrl: bundled,
      id: compositionId,
      inputProps,
      ...getBrowserOptions(),
    });

    await renderMedia({
      composition,
      serveUrl: bundled,
      codec,
      outputLocation: outputPath,
      inputProps,
      ...getBrowserOptions(),
    });

    res.download(outputPath, `${compositionId}-${jobId}.${outputFormat}`, () => {
      if (fs.existsSync(outputPath)) {
        fs.unlinkSync(outputPath);
      }
    });

  } catch (error) {
    console.error('Quick render failed:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎬 Remotion Render Server running on port ${PORT}`);
});
