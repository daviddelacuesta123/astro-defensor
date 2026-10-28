// Servidor de desarrollo: sirve www/ sin caché. Escucha en IPv4 e IPv6 para que
// http://localhost funcione aunque el sistema resuelva localhost como ::1.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'www');
const PUERTO = Number(process.env.PUERTO) || 8080;
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const servidor = http.createServer((req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const archivo = path.join(RAIZ, ruta === '/' ? 'index.html' : ruta);
  // No servir nada fuera de www/.
  if (!archivo.startsWith(RAIZ + path.sep) && archivo !== RAIZ) {
    res.writeHead(404).end();
    return;
  }
  fs.readFile(archivo, (error, datos) => {
    if (error) {
      res.writeHead(404).end('No encontrado');
      return;
    }
    res.writeHead(200, {
      'Content-Type': TIPOS[path.extname(archivo)] ?? 'application/octet-stream',
      'Cache-Control': 'no-store',
    });
    res.end(datos);
  });
});

servidor.listen({ port: PUERTO, host: '::', ipv6Only: false }, () => {
  console.log(`Astro Defensor en http://localhost:${PUERTO}  (Ctrl+C para detener)`);
});
