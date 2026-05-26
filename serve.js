#!/usr/bin/env node
// serve.js — Μικρός local server για preview των built sites. Καμία dependency.
// Χρήση: node serve.js  →  http://localhost:4000/<slug>/
const http = require('http');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, 'dist');
const PORT = 4000;
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Index: λίστα με όλους τους πελάτες
  if (urlPath === '/' || urlPath === '') {
    const sites = fs.existsSync(DIST) ? fs.readdirSync(DIST).filter(d => fs.statSync(path.join(DIST, d)).isDirectory()) : [];
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`<html><head><meta charset="utf-8"><title>Barbershop Studio</title>
      <style>body{font-family:system-ui;background:#161412;color:#ECE6DA;padding:48px;max-width:600px;margin:0 auto}
      h1{font-weight:600}a{display:block;padding:14px 18px;margin:8px 0;background:#1E1A16;border:1px solid #38312A;border-radius:6px;color:#C8924A;text-decoration:none}a:hover{border-color:#C8924A}
      .empty{color:#9C9384}</style></head><body>
      <h1>✂ Barbershop Studio</h1>
      ${sites.length ? sites.map(s => `<a href="/${s}/">${s} →</a>`).join('') : '<p class="empty">Δεν υπάρχουν built sites. Τρέξε <code>node build.js</code> πρώτα.</p>'}
      </body></html>`);
    return;
  }

  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const filePath = path.join(DIST, urlPath);

  if (!filePath.startsWith(DIST) || !fs.existsSync(filePath)) {
    res.writeHead(404); res.end('Not found'); return;
  }
  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
}).listen(PORT, () => {
  console.log(`\n✂  Studio preview: http://localhost:${PORT}/\n`);
});
