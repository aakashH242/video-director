import {createServer} from 'node:http';
import {createReadStream, realpathSync, statSync} from 'node:fs';
import {resolve, relative, sep, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {parseArgs} from 'node:util';

const types = {'.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.mp4': 'video/mp4', '.wav': 'audio/wav'};
export function byteRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || !size || (!match[1] && !match[2])) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
  return Number.isSafeInteger(start) && Number.isSafeInteger(end) && start >= 0 && start <= end && start < size ? {start, end} : null;
}
export async function startServer(directory, port = 0) {
  const root = realpathSync(directory);
  const server = createServer((req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, {Allow: 'GET, HEAD'}).end(); return; }
    try {
      const urlPath = decodeURIComponent(new URL(req.url, 'http://127.0.0.1').pathname);
      if (urlPath.split('/').some(part => part.startsWith('.')) || urlPath.includes('\\')) { res.writeHead(403).end(); return; }
      const requested = resolve(root, '.' + (urlPath === '/' ? '/index.html' : urlPath));
      const path = realpathSync(requested);
      if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
      if (relative(root, path).split(sep).some(part => part.startsWith('.'))) { res.writeHead(403).end(); return; }
      const stat = statSync(path);
      if (!stat.isFile()) { res.writeHead(404).end(); return; }
      // Static frame capture supports main-thread scenes, not Worker/socket applications.
      const policy = "connect-src 'self'; worker-src 'none'; object-src 'none'; base-uri 'none'";
      const headers = {'Content-Type': types[extname(path)] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': policy};
      const range = req.headers.range ? byteRange(req.headers.range, stat.size) : undefined;
      if (range === null) { res.writeHead(416, {'Content-Range': `bytes */${stat.size}`}).end(); return; }
      if (range) {
        headers['Content-Range'] = `bytes ${range.start}-${range.end}/${stat.size}`;
        headers['Content-Length'] = range.end - range.start + 1;
      } else headers['Content-Length'] = stat.size;
      res.writeHead(range ? 206 : 200, headers);
      if (req.method === 'HEAD') res.end();
      else { const stream = createReadStream(path, range); stream.on('error', () => res.destroy()); res.on('close', () => stream.destroy()); stream.pipe(res); }
    } catch { if (!res.headersSent) res.writeHead(404).end(); else res.destroy(); }
  });
  await new Promise((done, fail) => {server.once('error', fail); server.listen(port, '127.0.0.1', done);});
  return {server, origin: `http://127.0.0.1:${server.address().port}`, async close() {server.closeAllConnections?.(); await new Promise(done => server.close(done));}};
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const {values, positionals} = parseArgs({options: {port: {type: 'string', default: '8097'}}, allowPositionals: true});
  const port = Number(values.port);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw Error('Invalid port');
  const local = await startServer(resolve(positionals[0] || '.'), port);
  console.log(local.origin);
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, async () => {await local.close(); process.exit(0);});
}
