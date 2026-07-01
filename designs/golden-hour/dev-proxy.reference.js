#!/usr/bin/env node
/*
 * Local reverse proxy for www.gasa.ge that inlines gasa-theme.css.
 * Zero dependencies — just Node.
 *
 *   node dev/proxy.js
 *   # then open  http://localhost:8787/packages/
 *
 * It fetches the real site (search, carousel, login all work against the live
 * backend) and injects the stylesheet into every HTML page. The CSS file is
 * re-read on each request, so: edit gasa-theme.css -> refresh -> instant.
 * Nothing in production changes; only this proxied browser sees it.
 *
 * Env overrides:  PORT, UPSTREAM, GASA_CSS
 */
const http = require("http");
const https = require("https");
const zlib = require("zlib");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8787;
const UPSTREAM = process.env.UPSTREAM || "www.gasa.ge";
const CSS_FILE = process.env.GASA_CSS || path.join(__dirname, "..", "gasa-theme.css");
const JS_FILE = process.env.GASA_JS || path.join(__dirname, "..", "gasa-enhance.js");
const LOCAL_ORIGIN = `http://localhost:${PORT}`;
const HOST_RE = new RegExp("https?://" + UPSTREAM.replace(/\./g, "\\."), "gi");

function css() {
  try {
    return fs.readFileSync(CSS_FILE, "utf8");
  } catch (e) {
    return `/* gasa-theme.css not found at ${CSS_FILE}: ${e.message} */`;
  }
}

const ASSETS_DIR = path.join(__dirname, "..", "assets");
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".webp": "image/webp", ".gif": "image/gif" };

const server = http.createServer((creq, cres) => {
  // Serve the design assets locally (mirrors the jsDelivr /assets path used in
  // production), so injected <img src="/gasa-assets/..."> resolves in preview.
  const reqPath = creq.url.split("?")[0];
  if (reqPath.startsWith("/gasa-assets/")) {
    const rel = reqPath.slice("/gasa-assets/".length).replace(/\.\.+/g, "");
    const file = path.join(ASSETS_DIR, rel);
    fs.readFile(file, (err, data) => {
      if (err) {
        cres.writeHead(404, { "content-type": "text/plain" });
        cres.end("asset not found: " + rel);
      } else {
        cres.writeHead(200, { "content-type": MIME[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-store" });
        cres.end(data);
      }
    });
    return;
  }

  // Serve the local enhancement script + injected section markup directly
  // (re-read each request), mirroring the production loader on jsDelivr.
  if (reqPath === "/gasa-enhance.js" || reqPath === "/gasa-sections.html") {
    const f = reqPath === "/gasa-enhance.js" ? JS_FILE : path.join(__dirname, "..", "gasa-sections.html");
    const type = reqPath === "/gasa-enhance.js" ? "application/javascript; charset=utf-8" : "text/html; charset=utf-8";
    fs.readFile(f, (err, data) => {
      if (err) {
        cres.writeHead(404, { "content-type": "text/plain" });
        cres.end(reqPath + " not found: " + err.message);
      } else {
        cres.writeHead(200, { "content-type": type, "cache-control": "no-store" });
        cres.end(data);
      }
    });
    return;
  }

  const headers = { ...creq.headers, host: UPSTREAM, "accept-encoding": "identity" };
  delete headers["if-none-match"];
  delete headers["if-modified-since"];

  const ureq = https.request(
    { host: UPSTREAM, port: 443, method: creq.method, path: creq.url, headers, servername: UPSTREAM },
    (ures) => {
      const isHtml = (ures.headers["content-type"] || "").includes("text/html");
      const out = { ...ures.headers };

      // dev-only: don't let the site's policies fight the injection
      delete out["content-security-policy"];
      delete out["content-security-policy-report-only"];
      delete out["strict-transport-security"];

      // keep redirects + cookies on localhost
      if (out.location) out.location = String(out.location).replace(HOST_RE, LOCAL_ORIGIN);
      if (out["set-cookie"]) {
        out["set-cookie"] = [].concat(out["set-cookie"]).map((c) =>
          c.replace(/;\s*Domain=[^;]+/gi, "").replace(/;\s*Secure/gi, "")
        );
      }

      if (!isHtml) {
        cres.writeHead(ures.statusCode, out);
        ures.pipe(cres);
        return;
      }

      const chunks = [];
      ures.on("data", (d) => chunks.push(d));
      ures.on("end", () => {
        let buf = Buffer.concat(chunks);
        const enc = (ures.headers["content-encoding"] || "").toLowerCase();
        try {
          if (enc === "gzip") buf = zlib.gunzipSync(buf);
          else if (enc === "br") buf = zlib.brotliDecompressSync(buf);
          else if (enc === "deflate") buf = zlib.inflateSync(buf);
        } catch (_) {}

        let html = buf.toString("utf8");
        const style = `\n<style id="gasa-theme-dev">\n${css()}\n</style>\n`;
        html = html.includes("</head>") ? html.replace("</head>", style + "</head>") : style + html;

        // inject the additive enhancement script (mirrors the production loader)
        const script = `\n<script src="/gasa-enhance.js" id="gasa-enhance-dev"></script>\n`;
        html = html.includes("</body>") ? html.replace("</body>", script + "</body>") : html + script;

        html = html.replace(HOST_RE, LOCAL_ORIGIN); // keep navigation inside the proxy

        const body = Buffer.from(html, "utf8");
        delete out["content-encoding"];
        delete out["transfer-encoding"];
        out["content-length"] = body.length;
        cres.writeHead(ures.statusCode, out);
        cres.end(body);
      });
    }
  );

  ureq.on("error", (e) => {
    cres.writeHead(502, { "content-type": "text/plain" });
    cres.end("Proxy error: " + e.message);
  });
  creq.pipe(ureq);
});

server.listen(PORT, () =>
  console.log(`GASA preview proxy running\n  upstream : ${UPSTREAM}\n  open     : ${LOCAL_ORIGIN}/packages/`)
);
