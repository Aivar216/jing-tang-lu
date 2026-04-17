import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'http'
import * as https from 'https'
import * as http from 'http'

// https://vite.dev/config/
export default defineConfig({
  base: '/jing-tang-lu/desktop/',
  plugins: [
    react(),
    {
      name: 'dev-cors-proxy',
      configureServer(server) {
        server.middlewares.use('/dev-proxy', (req: IncomingMessage, res: ServerResponse) => {
          const targetHeader = req.headers['x-target'] as string | undefined;
          if (!targetHeader) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Missing X-Target header');
            return;
          }

          let targetUrl: URL;
          try {
            targetUrl = new URL(targetHeader);
          } catch {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Invalid X-Target URL');
            return;
          }

          const isHttps = targetUrl.protocol === 'https:';
          const transport = isHttps ? https : http;
          const port = targetUrl.port
            ? parseInt(targetUrl.port)
            : isHttps ? 443 : 80;

          const chunks: Buffer[] = [];
          req.on('data', (chunk: Buffer) => chunks.push(chunk));
          req.on('end', () => {
            const body = Buffer.concat(chunks);

            // Forward all headers except host, x-target, and accept-encoding
            // (removing accept-encoding forces the API to return plain JSON, not gzip/br)
            const forwardHeaders: Record<string, string | string[]> = {};
            for (const [k, v] of Object.entries(req.headers)) {
              if (k === 'host' || k === 'x-target' || k === 'accept-encoding') continue;
              if (v !== undefined) forwardHeaders[k] = v as string | string[];
            }
            forwardHeaders['content-length'] = String(body.length);

            const options = {
              hostname: targetUrl.hostname,
              port,
              path: targetUrl.pathname + targetUrl.search,
              method: req.method ?? 'POST',
              headers: forwardHeaders,
            };

            const proxyReq = transport.request(options, (proxyRes) => {
              const responseChunks: Buffer[] = [];
              proxyRes.on('data', (c: Buffer) => responseChunks.push(c));
              proxyRes.on('end', () => {
                const responseBody = Buffer.concat(responseChunks);
                res.writeHead(proxyRes.statusCode ?? 200, {
                  'Content-Type': proxyRes.headers['content-type'] ?? 'application/json',
                  'Access-Control-Allow-Origin': '*',
                  'Content-Length': String(responseBody.length),
                });
                res.end(responseBody);
              });
            });

            proxyReq.on('error', (err: Error) => {
              res.writeHead(502, { 'Content-Type': 'text/plain' });
              res.end(`Proxy error: ${err.message}`);
            });

            proxyReq.write(body);
            proxyReq.end();
          });
        });

        // Handle preflight OPTIONS
        server.middlewares.use('/dev-proxy', (req: IncomingMessage, res: ServerResponse) => {
          if (req.method === 'OPTIONS') {
            res.writeHead(204, {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
              'Access-Control-Allow-Headers': '*',
            });
            res.end();
          }
        });
      },
    },
  ],
})
