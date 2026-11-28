import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { exec } from "node:child_process";

const root = process.cwd();
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".glb": "model/gltf-binary",
  ".stl": "model/stl",
};

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const rel = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const filePath = path.join(root, rel);

  if (!filePath.startsWith(root) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    return res.end("Not found");
  }

  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": mime[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

const port = 4173;
const url = `http://127.0.0.1:${port}`;

server.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.log(`Servidor ja esta ativo em ${url}. Abrindo navegador...`);
    exec(`start "" "${url}"`);
    setTimeout(() => process.exit(0), 1000);
  } else {
    console.error(err);
    process.exit(1);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Estudio 3D rodando em ${url}`);
  exec(`start "" "${url}"`);
});
