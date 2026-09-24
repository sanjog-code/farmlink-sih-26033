import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import messageHandler from './api/saarthi/message.js'
import audioHandler from './api/saarthi/audio.js'
import confirmHandler from './api/saarthi/confirm.js'

function saarthiDevMiddleware() {
  return {
    name: 'saarthi-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/api/saarthi/')) {
          return next();
        }

        // Augment res with status and json helpers
        res.status = function(code) {
          this.statusCode = code;
          return this;
        };
        res.json = function(data) {
          this.setHeader('Content-Type', 'application/json');
          this.end(JSON.stringify(data));
          return this;
        };

        // Parse incoming body if present
        let body = {};
        if (req.method === 'POST') {
          try {
            const chunks = [];
            for await (const chunk of req) {
              chunks.push(chunk);
            }
            const raw = Buffer.concat(chunks).toString('utf8');
            if (raw) {
              body = JSON.parse(raw);
            }
          } catch (e) {
            console.warn('Dev middleware body parse error:', e.message);
          }
        }
        req.body = body;

        const url = req.url.split('?')[0];
        try {
          if (url === '/api/saarthi/message') {
            return await messageHandler(req, res);
          }
          if (url === '/api/saarthi/audio') {
            return await audioHandler(req, res);
          }
          if (url === '/api/saarthi/confirm') {
            return await confirmHandler(req, res);
          }
          return res.status(404).json({ error: 'Endpoint not found' });
        } catch (err) {
          console.error('Saarthi middleware execution error:', err);
          return res.status(500).json({ error: err.message });
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), saarthiDevMiddleware()]
})
