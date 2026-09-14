import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicPaths, root } from './build.mjs';

const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif' };

export function createServer(directory = root) {
  return http.createServer(async (request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' });
      return response.end();
    }
    let pathname;
    try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
    catch { response.writeHead(400); return response.end('Bad request'); }
    const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
    const path = resolve(directory, relative);
    const visible = publicPaths.some(entry => relative === entry || relative.startsWith(entry + '/'));
    if (!visible || !path.startsWith(resolve(directory) + sep) || relative.split('/').some(part => part.startsWith('.'))) {
      response.writeHead(404);
      return response.end('Not found');
    }
    try {
      const body = await readFile(path);
      response.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-cache' });
      response.end(request.method === 'HEAD' ? undefined : body);
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 5173);
  const directory = process.argv.includes('--dist') ? resolve(root, 'dist') : root;
  createServer(directory).listen(port, '127.0.0.1', () => console.log('HorseTinder: http://localhost:' + port));
}
