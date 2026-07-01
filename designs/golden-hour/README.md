# Design version — "Golden Hour" (Option 1A)

A **complete, self-contained snapshot** of the Golden Hour design, moved out of
the repo root so a fresh design can be built at root without interference.

**Reference / record only. Not active.** Nothing here is loaded by the live site
or the preview proxy in their current (clean-slate) state.

## What it is
A full reproduction of the owner's Claude Design homepage (Option 1A — Golden
Hour): cinematic, photography-forward, deep-navy with a sparing golden-hour amber
accent. It re-skins the live Juniper site and injects the design's marketing
sections on top of it, while keeping the real search/booking widget working.

## Files
- `gasa-theme.css` — the theme.
- `gasa-enhance.js` — additive JS: hero photo/copy + injects the sections below.
- `gasa-sections.html` — the injected content sections' markup.
- `assets/` — photos + logos used by the design.
- `dev-proxy.reference.js` — the preview proxy as it was configured to serve this
  version (it additionally serves `/gasa-assets/*` and `/gasa-sections.html`).

## ⚠️ Placeholder data
The injected sections carry the mockup's **invented** figures, copy, prices and
imagery (e.g. "750+ airlines", "since 1999", "Dubai 89€"). These are NOT real
GASA data and its CTAs/cards link to `#`. Replace with real content before this
is ever published.

## To restore as the active design
1. Copy `gasa-theme.css`, `gasa-enhance.js`, `gasa-sections.html` and `assets/`
   back to the repo root.
2. Re-add the proxy's asset + sections routes (see `dev-proxy.reference.js`) so
   `/gasa-assets/*` and `/gasa-sections.html` are served locally.
3. `node dev/proxy.js` → `http://localhost:8787/`.

For production, the enhancer fetches these files from jsDelivr, so they must also
be committed + pushed and jsDelivr purged (owner go-ahead required).
