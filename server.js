const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, 'dist');
const PUBLIC_DIR = path.join(__dirname, 'public');

const routes = {
  '/': 'index.html',
  '/login': 'index.html',
  '/student-portal': 'index.html',
  '/faculty-portal': 'index.html',
  '/index.html': 'index.html'
};

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

function toPublicPath(requestUrl) {
  const url = new URL(requestUrl, `http://localhost:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname.endsWith('/') && pathname !== '/') {
    pathname = pathname.slice(0, -1);
  }

  if (routes[pathname]) {
    return path.join(DIST_DIR, routes[pathname]);
  }

  const relativeRequestPath = pathname.replace(/^\/+/, '');
  const normalizedPath = path.normalize(relativeRequestPath);

  if (normalizedPath.startsWith('..') || path.isAbsolute(normalizedPath)) {
    return null;
  }

  const filePath = path.join(DIST_DIR, normalizedPath);
  const relativePath = path.relative(DIST_DIR, filePath);

  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}

async function serveFile(res, filePath) {
  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    res.writeHead(200, {
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
    });
    res.end(content);
  } catch (error) {
    if (error.code === 'ENOENT' || error.code === 'EISDIR') {
      const fallbackFile = path.join(DIST_DIR, 'index.html');
      try {
        const fallbackContent = await fs.readFile(fallbackFile);
        res.writeHead(200, {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-cache'
        });
        res.end(fallbackContent);
        return;
      } catch {
        const publicFallback = path.join(PUBLIC_DIR, 'index.html');
        try {
          const publicContent = await fs.readFile(publicFallback);
          res.writeHead(200, {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'no-cache'
          });
          res.end(publicContent);
          return;
        } catch {
          // Continue to the 404 response below.
        }
      }

      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>404</h1><p>Build the React app with <code>npm run build</code>, then start the server again.</p>');
      return;
    }

    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>500</h1><p>Something went wrong.</p>');
  }
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }

  const requestUrl = new URL(req.url, `http://localhost:${PORT}`);
  if (requestUrl.pathname.length > 1 && requestUrl.pathname.endsWith('/')) {
    requestUrl.pathname = requestUrl.pathname.slice(0, -1);
    res.writeHead(301, { Location: `${requestUrl.pathname}${requestUrl.search}` });
    res.end();
    return;
  }

  const filePath = toPublicPath(req.url);
  if (!filePath) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>400</h1><p>Invalid request.</p>');
    return;
  }

  serveFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`CRCE Placement Cell site running at http://localhost:${PORT}`);
});
