# CLAUDE.md

## What this repo is
A full re-implementation of the live **www.gasa.ge** homepage design, injected on top of
the third-party **Juniper Booking Engine** (ASP.NET WebForms + Bootstrap 3). We cannot edit
the platform's source; instead we layer our own `gasa-theme.css` (loaded after the
platform's `main.min.css`) and `gasa-enhance.js`. The mandate is a **full re-skin, not a
light touch**: discard the platform's default look, and **remove the homepage sections the
target design doesn't use** — keeping only the functional widgets (searcher, calendar,
rooms, booking flow, forms, login).

## Design mandate
The owner hands over a **target design** (e.g. a Claude Design export / mockup).
Re-implement it faithfully and in full; treat the platform's current appearance as
disposable. The only non-negotiables: the brand (below), preserved site functionality (the
HANDS-OFF widgets), and the platform facts (below). Archived past designs live in
`designs/` — **reference only, NOT design direction**; ignore unless the owner points you
there.

## Core constraints (do not violate)
- **Re-implement the look, but never own the platform.** The search, calendars, booking
  flow, forms and ViewState belong to Juniper and **must keep working**. Removing/replacing
  marketing sections is expected; breaking a functional widget is not.
- **Brand-driven.** Deep-navy / sky-blue per the brandbook. Keep the WhatsApp/comms green
  (`#25D366`).
- **No build step, no dependencies, no `npm`/installs.** Static CSS + vanilla JS + the
  zero-dep Node preview proxy. If something needs a package, skip it and say so.
- **Never commit or push without the owner's explicit go-ahead** — the live site updates
  from this repo.

## How the injection works
- A **brace-free `<script>` loader** is pasted into a Juniper CMS content block
  (Master/Footer). It `createElement`s a `<link>` (CSS) + `<script src>` (JS) pointing at
  the jsDelivr-hosted files. The loader **must stay brace-free** — the CMS WYSIWYG mangles
  `{ } < >`; the hosted files are fetched directly by the browser and are unaffected.
- This works because the **CMS Description field renders unsanitized HTML/JS** (a stored-XSS
  platform defect — that's the injection channel). The sanctioned long-term channel is a
  **GTM Custom HTML tag**, but the GTM container keys are Juniper-owned per the GASA contract.
- Production loader (jsDelivr `@main`):
  `https://cdn.jsdelivr.net/gh/datuchela/gasa-juniper-css@main/gasa-theme.css`
  Purge after pushing:
  `https://purge.jsdelivr.net/gh/datuchela/gasa-juniper-css@main/gasa-theme.css`
- **Live = whatever is pushed to `main`** (the loader points at jsDelivr `@main`), so the repo
  and local commits may be ahead of the live site. Shipping = commit + push + purge; never
  push without the owner's go-ahead.

## Repo layout
- `gasa-theme.css` — the theme (single stylesheet, no build step). Site-wide: `:root` token
  overrides, components unprefixed. Currently a clean skeleton.
- `gasa-enhance.js` — DOM layer that removes/replaces platform sections and injects the
  design's own. Clean scaffold: empty `enhancements` array; MutationObserver + `applyAll`.
- `dev/proxy.js` — zero-dependency Node local-preview reverse proxy.
- `dev/README.md`, `README.md` — usage docs.
- `index.html` — blank `noindex` placeholder so the Pages root doesn't 404.
- `designs/` — archived complete designs (reference only, not direction).

## gasa-theme.css — theming
Applied SITE-WIDE (preview on the home page). The platform is driven by CSS custom
properties at `:root`, including **HSL-component tokens** (`--primary-color-h/s/l`,
`--secondary-color-*`, `--accent-color-*`, `--dark-*`, `--border-radius-*`, `--font-*`).
Override the H/S/L **parts** in your `:root` block so the platform's own `calc()`-derived
hover/border/focus shades follow your palette; our sheet loads last, so `:root` wins by
source order. Inspect current platform values in `/resources/<HASH>/dist/css/main.min.css`
(URL is in the page HTML — grep its `:root`). If you use an unhostable typeface, expose it
via a CSS variable with a free fallback + a Georgian-capable fallback for ქართული.

## gasa-enhance.js — DOM layer
Runs site-wide. Add idempotent `{name, run()}` enhancements: select with
`:not([data-gasa-done])`, set the `data-gasa-*` marker FIRST, then act. `applyAll()`
try/catches each; a `requestAnimationFrame`-debounced `MutationObserver` re-runs it so
changes survive the platform's re-renders (slick clones, AJAX swaps). Idempotency prevents
loops.
- **Restructuring / removing / adding DOM is expected — as long as functionality is
  preserved.** Move real nodes with `appendChild`/`insertBefore` (keeps listeners); never
  clone/recreate interactive elements or `innerHTML`-replace them; never rename/move form
  controls (ViewState depends on them).
- **HANDS OFF (read only — never remove or reparent):** `.home-searcher`, `#home-top`,
  `#package-searcher`, `.multi-searcher__content`, any `[class*="calendar"]`,
  `.room-selector-box`, `form`, any `[class*="js-"]`, `.login-box`, `.modal`, results
  containers, slick-cloned slides.
- **FREE TO REMOVE / REPLACE (anything the design omits):** offers (`.slick-promotions` /
  `.sliding-offers*` / `.slide-promo-content`), benefits (`.benefits__*`), find-the-best
  (`.topdestinations__*`), section wrappers, footer link lists, headings, plus brand-new
  nodes you create.
- Prefer CSS for visual/layout; use JS for structure changes, hooks, reflows, new content.

## Local preview (no production, no installs)
```bash
cd ~/repos/gasa-juniper-css
node dev/proxy.js        # zero-dependency; open http://localhost:8787/  (home page)
```
The proxy reverse-proxies real www.gasa.ge, inlines `gasa-theme.css`, and injects + serves
`gasa-enhance.js` (mirrors the production loader). Both files are re-read every request →
**edit → refresh → instant.** Nothing in production changes. Env overrides: `PORT`,
`UPSTREAM`, `GASA_CSS`, `GASA_JS`. (Port 8787 may already be in use if an instance is running.)

## Brand reference (GASA brandbook)
Primary **Deep Blue `#0a1c44`** (trust/professional). Brighter blues for energy, sparingly:
`#182877`, `#224493`. Sky `#89c6ff` (accent / gradient end). Use `#07152d` instead of pure
black. Neutrals `#eaeaeb`, `#d5d6d6`, white. Subtle deep-blue→light-blue→white gradients are
on-brand. Display font: **Good Times** (→ free stand-in if unlicensed). Photography =
warm/vibrant travel imagery (don't recolor). Keep the footer / WhatsApp button green
(`#25D366`).

## Platform facts (save yourself the rediscovery)
- Home and packages are both "home"-template landing pages with the SAME section
  structure/hooks (hero + searcher, offers, benefits, find-the-best, footer). Body ids:
  `#home`, `#packages`.
- Class hooks (BEM-ish): header `.main-header`; nav `.menu.nav.navbar-nav > li > a` (active
  = `li.active > a`, which the platform gives a **white bg fill** — restyle its state). Top
  utility bar `.top-row` inside `.main-header__inner` (items:
  `.upper-menu__check-booking-button`, `.upper-menu__login-button`,
  `.upper-menu__phone-wrapper`, `.currency-selector`, `.language-btn`,
  `.upper-menu__whatsapp-wrapper`). Searcher `.home-searcher.searcher--floating` /
  `.multi-searcher__content` inside `#home-top`; the main search button is
  `.btn.searcher-button`. Hero carousel `.home-carousel .carousel-inner > .item`. Offers
  `.slick-promotions` / `.slide-promo-content`. Benefits
  `.benefits__childs__item(__image/__content)` / `.benefits__title h2`. Find-the-best
  `.topdestinations__*`. Footer `.footer-content` / `.footer__title` /
  `.footer-action__content.btn-go-top`. Buttons `.btn` / `.btn-primary` / `.btn-secondary`.
  Prices `.card__price-amount` / `.product-option__price-amount`.
- Header is **static, ~100px tall.**
- The platform forces the hero `.item` to **100vh** via a strong rule — override with
  `#home-top` ancestor specificity **+ `!important`** for a different hero height.

## Reference: the Juniper platform wiki
An LLM-maintained knowledge wiki about the Juniper Booking Engine lives at
`/home/datucha/Documents/obsidian/juniper` (Obsidian Markdown vault). Start at `index.md`,
then `wiki/entities/` (`website.md`, `website-content-management.md`, …), `wiki/concepts/`,
`wiki/sources/`; `raw/` holds the original Juniper EDocs. **Reference only — do not modify.**

## When a design is ready to ship
1. Re-implement the design in `gasa-theme.css` (+ `gasa-enhance.js` for DOM work), site-wide.
2. Preview via `node dev/proxy.js` at `http://localhost:8787/`.
3. Click-through to confirm nothing broke: destination dropdown, date calendar, rooms/guests,
   run a search, open login.
4. When approved: commit + push + purge jsDelivr.
