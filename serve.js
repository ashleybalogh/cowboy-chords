/* A static server, so the app has an origin.
 *
 * file:// cannot run this app: Chrome blocks fetch() of local JSON, ES modules,
 * service workers and PWA install there. That is the only reason this file
 * exists. It is not a build step — nothing is compiled, nothing is watched.
 * Edit a file, refresh the tab.
 *
 *   node serve.js            http://localhost:5173
 *   node serve.js --port 8080
 */

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const root = import.meta.dirname;
const portFlag = process.argv.indexOf("--port");
const port = portFlag === -1 ? 5173 : Number(process.argv[portFlag + 1]);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".woff2": "font/woff2",
};

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const wanted = url.pathname === "/" ? "/index.html" : url.pathname;

  // Stay inside the folder: normalize, then require the result to still be
  // under root before reading anything.
  const path = join(root, normalize(decodeURIComponent(wanted)));
  if (path !== root && !path.startsWith(root + sep)) {
    res.writeHead(403).end("Outside the project folder");
    return;
  }

  try {
    const body = await readFile(path);
    res.writeHead(200, {
      "content-type": types[extname(path)] ?? "application/octet-stream",
      // Content is hand-edited and refreshed constantly. Never cache in dev.
      "cache-control": "no-store",
    });
    res.end(body);
  } catch (err) {
    if (err.code === "ENOENT" || err.code === "EISDIR") {
      res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
      res.end(`Not found: ${wanted}`);
    } else {
      res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
      res.end(`${err.code ?? "Error"}: ${wanted}`);
    }
  }
});

server.listen(port, () => {
  console.log(`Cowboy Chords → http://localhost:${port}`);
});
