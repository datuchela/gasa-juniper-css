/* ============================================================================
   gasa-enhance.js  ·  GASA — additive DOM layer for www.gasa.ge
   ----------------------------------------------------------------------------
   "Golden Hour" (Option 1A) build. Loaded AFTER the Juniper platform JS.

   This layer reproduces the owner's Claude Design homepage (Option 1A) on the
   live booking engine. It:
     1. Overlays the hero photo + scrim and injects the headline copy.
     2. Injects the exact 1A content sections (trust stats, flight deals, top-
        destinations bento, holiday packages, why-GASA, CTA) as brand-new nodes,
        fetched from gasa-sections.html. The platform's own "offers" + "benefits"
        sections are hidden by gasa-theme.css and replaced by these.

   The REAL Juniper searcher is preserved and only restyled (gold Search button)
   — we never touch .home-searcher / the carousel / forms / ViewState. All the
   injected content is decorative/navigational (links only), so nothing here can
   break search or booking.

   NOTE: the injected sections carry the design's PLACEHOLDER figures (e.g.
   "750+ airlines", "Dubai 89€"). These are mockup values — replace with real
   data before this is relied on in production.

   Every run() is idempotent (guards with a marker/id before acting) so the
   MutationObserver can safely re-run it after the platform re-renders.
   ============================================================================ */
(function () {
  var LOCAL = location.hostname === "localhost" || location.hostname === "127.0.0.1";
  var CDN = "https://cdn.jsdelivr.net/gh/datuchela/gasa-juniper-css@main";
  var ASSET_BASE = LOCAL ? "/gasa-assets" : CDN + "/assets";
  var SECTIONS_URL = LOCAL ? "/gasa-sections.html" : CDN + "/gasa-sections.html";

  // ---- Hero: photo layer + headline copy (over the real, untouched searcher)
  function heroInit() {
    var host = document.querySelector("#home-top:not([data-gasa-done])");
    if (!host) return;
    host.setAttribute("data-gasa-done", "");

    var photo = document.createElement("div");
    photo.className = "gasa-hero-photo";
    photo.style.backgroundImage = "url('" + ASSET_BASE + "/photos/dubai-burj-al-arab.png')";

    var copy = document.createElement("div");
    copy.className = "gasa-hero-copy";
    copy.setAttribute("aria-hidden", "true");

    var kicker = document.createElement("p");
    kicker.className = "gasa-hero-copy__kicker";
    var spark = document.createElement("span");
    spark.className = "gasa-spark";
    kicker.appendChild(spark);
    kicker.appendChild(document.createTextNode(" Georgia's trusted ticketing agency"));

    var title = document.createElement("h1");
    title.className = "gasa-hero-copy__title";
    title.appendChild(document.createTextNode("Travel the world,"));
    title.appendChild(document.createElement("br"));
    title.appendChild(document.createTextNode("unforgettably."));

    var sub = document.createElement("p");
    sub.className = "gasa-hero-copy__sub";
    sub.textContent =
      "Cheap air tickets to 120+ destinations, compared across 750+ airlines — found in a single search.";

    copy.appendChild(kicker);
    copy.appendChild(title);
    copy.appendChild(sub);

    host.insertBefore(copy, host.firstChild);
    host.insertBefore(photo, host.firstChild);
  }

  // ---- Exact 1A content sections (fetched once, injected after the hero row)
  var sectionsState = 0; // 0 idle · 1 loading · 2 done
  function exactSections() {
    if (sectionsState === 1) return;
    if (document.getElementById("gasa-exact")) { sectionsState = 2; return; }
    var anchor = document.querySelector("section.home-top") || document.querySelector("#home-top");
    if (!anchor || !anchor.parentNode) return;
    sectionsState = 1;
    fetch(SECTIONS_URL)
      .then(function (r) { return r.text(); })
      .then(function (html) {
        if (document.getElementById("gasa-exact")) { sectionsState = 2; return; }
        var wrap = document.createElement("div");
        wrap.id = "gasa-exact";
        var doc = new DOMParser().parseFromString(
          html.split("__A__").join(ASSET_BASE),
          "text/html"
        );
        var kids = doc.body.childNodes;
        while (kids.length) wrap.appendChild(kids[0]);
        var a = document.querySelector("section.home-top") || anchor;
        a.parentNode.insertBefore(wrap, a.nextSibling);
        sectionsState = 2;
      })
      .catch(function (err) { console.warn("[gasa] sections", err); sectionsState = 0; });
  }

  var enhancements = [
    { name: "hero", run: heroInit },
    { name: "exact-sections", run: exactSections },
  ];

  function applyAll() {
    for (var i = 0; i < enhancements.length; i++) {
      try { enhancements[i].run(); } catch (err) { console.warn("[gasa]", enhancements[i].name, err); }
    }
  }

  var scheduled = 0;
  var observer = new MutationObserver(function () {
    cancelAnimationFrame(scheduled);
    scheduled = requestAnimationFrame(applyAll);
  });

  function start() {
    applyAll();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState !== "loading") start();
  else document.addEventListener("DOMContentLoaded", start);
})();
