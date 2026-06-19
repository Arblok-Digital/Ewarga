import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

// Import our shared database helper
import { applySqlMigrations } from './packages/supabase/src/helpers.js';

// Derive ES6 Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser for API
  app.use(express.json());

  // Disable caching for development & live previews to ensure instant updates
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
    next();
  });

  // 1. API ROOT ROUTES FIRST
  app.post('/api/db-setup', async (req, res) => {
    const { connectionString } = req.body;
    if (!connectionString) {
      return res.status(450).json({ error: 'Connection string PostgreSQL tidak boleh kosong!' });
    }

    try {
      const result = await applySqlMigrations(connectionString);
      if (result.success) {
        return res.json({ status: 'ok', msg: result.message });
      } else {
        return res.status(500).json({ error: result.message });
      }
    } catch (err: any) {
      return res.status(500).json({ error: err.message || String(err) });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
  });

  // 2. VITE DEV OR PROD MIDDLEWARE
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve the compiled assets of warga-pwa
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`E-Warga Server running on port ${PORT}`);
  });
}

startServer();
