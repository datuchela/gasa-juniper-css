# gasa-juniper-css

Custom styling for the **www.gasa.ge** Juniper Booking Engine site, served via GitHub Pages.

## Files
- `gasa-theme.css` — full site-wide re-implementation of the GASA homepage design over the real Juniper/BEM markup (replaces the platform's default look, not a light polish).
- `gasa-enhance.js` — DOM layer that removes/replaces platform sections and injects the design's own (functional widgets kept intact).
- `index.html` — blank placeholder so the Pages root doesn't 404.

See `CLAUDE.md` for the full brief, injection mechanism, platform facts, and preview.

## Hosting (GitHub Pages)
1. Push this repo to GitHub.
2. Settings → Pages → Source: `main` branch, `/ (root)`.
3. The stylesheet is then served at:
   ```
   https://<github-user>.github.io/gasa-juniper-css/gasa-theme.css
   ```

## Injecting it into the live site
The Juniper CMS HTML editor mangles `{`, `}`, `<`, `>`, so the **loader** pasted into a
global content block (Footer/Master) must stay brace-free. It pulls this stylesheet, which
the browser fetches directly — so the CSS file itself can use normal syntax.

```html
<script>
var l = document.createElement("link");
l.rel = "stylesheet";
l.href = "https://<github-user>.github.io/gasa-juniper-css/gasa-theme.css?v=1";
document.head.appendChild(l);
</script>
```

Bump `?v=` on each change to bust the browser/CDN cache. GitHub Pages can take a minute to
publish updates.

## Notes
- Palette + font can alternatively be set natively in `Agents Area > Web Configuration >
  Appearance > Colours and fonts`; everything else (layout, spacing, shadows, hover) needs
  this stylesheet (or a GTM Custom HTML tag).
- Preferred long-term channel is a **GTM Custom HTML tag** over the CMS loader, since the
  loader depends on the unsanitized-CMS behaviour that should eventually be fixed.
