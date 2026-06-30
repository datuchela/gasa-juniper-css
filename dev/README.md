# Local preview (no production, no push)

A tiny zero-dependency Node reverse proxy that serves the **real** www.gasa.ge
under `localhost` with `gasa-theme.css` injected. The site works normally
(search, carousel, login hit the live backend); only this browser sees the new
CSS. Edit the file, refresh — instant. Nothing in production changes.

## Run

```bash
cd ~/repos/gasa-juniper-css
node dev/proxy.js
```

Then open <http://localhost:8787/packages/>.

That's it — no proxy settings, no certificate. The CSS is re-read on every
request, so edit `gasa-theme.css` and hit refresh to see changes.

## How it works
- Forwards each request to `www.gasa.ge` (correct `Host`/SNI), injects a
  `<style id="gasa-theme-dev">` before `</head>` on HTML responses.
- Rewrites `https://www.gasa.ge` → `http://localhost:8787` in HTML, redirects,
  and cookies so navigation and sessions stay inside the proxy.
- Strips CSP/HSTS (dev only) so the inline style + Orbitron `@import` load.

## Options (env vars)
```bash
PORT=9000 node dev/proxy.js                  # different port
UPSTREAM=staging.gasa.ge node dev/proxy.js   # proxy a different host
GASA_CSS=/tmp/other.css node dev/proxy.js    # preview a different file
```

## Notes / limits
- Scope: the CSS only themes `body#packages`, so only the packages page changes.
- This is a **local preview tool**, not a real proxy — don't point others at it
  (it disables CSP/HSTS).
- Most assets load from `cdn.ejuniper.com` / Google Fonts directly, which is
  fine. If a runtime script builds an absolute `www.gasa.ge` URL it may briefly
  leave the proxy; harmless for a CSS preview.
