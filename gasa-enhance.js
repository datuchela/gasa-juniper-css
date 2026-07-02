/* ============================================================================
   gasa-enhance.js  ·  GASA — DOM layer for www.gasa.ge
   ----------------------------------------------------------------------------
   Loaded AFTER the Juniper platform JS. Re-implements the handed-over landing
   design on top of the live booking engine:

     KEEP + restyle (CSS does the look):  header/nav, hero carousel (#home-top),
       the real searcher (.multi-searcher / .home-searcher), calendars, rooms,
       forms, login. These stay wired to the platform — never recreated here.

     REMOVE (platform marketing the design drops):  sliding promo, the
       #home-content-* marketing rows, the platform footer.

     INJECT (brand-new design nodes):  hero "Discover Greece" caption, the
       Features strip, static Special Offers, the Instagram grid, the Reviews
       slider, Benefits & Values, and the design footer.

   All injected markup below is static, author-controlled strings (no user or
   network input) parsed via Range.createContextualFragment — safe by
   construction. Every run() is idempotent: guard with an id / marker check,
   set the marker FIRST, then act. A requestAnimationFrame-debounced
   MutationObserver re-runs applyAll() so our work survives platform re-renders.
   ============================================================================ */
(function () {
  "use strict";

  var ASSETS = "https://cdn.jsdelivr.net/gh/datuchela/gasa-juniper-css@main/assets";
  var LOGO_W = ASSETS + "/GASA_logo_white.svg";
  // Offer photography — placeholders until final GASA imagery is supplied.
  // Antalya is a clean extracted asset; Crete/Sharm use clean Unsplash URLs
  // (the two extracted JPEGs were watermarked Unsplash+ previews).
  var IMG_CRETE = "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=900&q=85&auto=format&fit=crop";
  var IMG_ANTALYA = ASSETS + "/photos/antalya.jpg";
  var IMG_SHARM = "https://images.unsplash.com/photo-1560703649-e3055f28bcf8?w=900&q=85&auto=format&fit=crop";
  var IMG_AIRPLANE = ASSETS + "/photos/airplane.jpg";
  var IMG_GREECE_TILE = "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=700&q=85&auto=format&fit=crop";
  var IMG_HOTEL_TILE = "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=700&q=85&auto=format&fit=crop";
  var IMG_WING_TILE = "https://images.unsplash.com/photo-1531850039645-b21522964b91?w=700&q=85&auto=format&fit=crop";
  var IMG_SANTORINI_TILE = "https://images.unsplash.com/photo-1560703649-e3055f28bcf8?w=700&q=85&auto=format&fit=crop";

  // Parse a static HTML string into DOM nodes without touching .innerHTML.
  function frag(html) { return document.createRange().createContextualFragment(html); }
  function el(html) { return frag(html).firstElementChild; }
  function igLogo() {
    return '<div class="ig-logo"><img src="' + LOGO_W + '" alt="GASA" style="height:20px;width:auto"></div>';
  }

  // ── Hero "Discover Greece" caption (overlaid on the platform carousel) ──────
  var HERO_HTML =
    '<div class="gasa-hero-overlaywrap">' +
      '<div class="gasa-hero-content">' +
        '<p class="hero-single-eyebrow">Now introducing</p>' +
        '<h1 class="hero-single-title">Discover Our New<br>Destination: <em>Greece</em></h1>' +
        '<p class="hero-single-desc">Sun-soaked islands, ancient wonders and the deep blue Aegean — Greece is now part of the GASA collection.</p>' +
        '<a href="/en/packages/" class="hero-single-cta">Explore Greece</a>' +
      '</div>' +
      '<div class="gasa-hero-logo"><img src="' + LOGO_W + '" alt="GASA" style="height:26px;width:auto"></div>' +
    '</div>';

  // ── Features strip ──────────────────────────────────────────────────────────
  var FEATURES_HTML =
    '<div class="features gasa-block">' +
      '<div>' +
        '<div class="features-headline">Tailored journeys<br>for every traveler</div>' +
        '<div class="features-underline"></div>' +
        '<a href="#" class="features-link">Learn more about us' +
          '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
      '</div>' +
      '<div class="feature"><div class="feature-icon"><svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg></div>' +
        '<p class="feature-name">Exclusive Collection</p><p class="feature-desc">Handpicked hotels and unique experiences around the world.</p></div>' +
      '<div class="feature"><div class="feature-icon"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></div>' +
        '<p class="feature-name">Personal Concierge</p><p class="feature-desc">24/7 support from our travel experts before, during and after your trip.</p></div>' +
      '<div class="feature"><div class="feature-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>' +
        '<p class="feature-name">Best Price Guarantee</p><p class="feature-desc">We offer the best rates and exclusive offers just for you.</p></div>' +
      '<div class="feature"><div class="feature-icon"><svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div>' +
        '<p class="feature-name">Secure Booking</p><p class="feature-desc">Book with confidence using our safe and reliable platform.</p></div>' +
    '</div>';

  // ── Special Offers (static per design) ──────────────────────────────────────
  var OFFERS_HTML =
    '<section class="offers-section gasa-block">' +
      '<div class="offers-header">' +
        '<h2 class="offers-title">Special travel offers for you</h2>' +
        '<p class="offers-sub">Carefully selected destinations with attractive seasonal prices and flexible travel options.</p>' +
      '</div>' +
      '<div class="offers-grid">' +
        '<div class="offer-card"><div class="offer-img"><img src="' + IMG_CRETE + '" alt="Crete, Greece"></div>' +
          '<p class="offer-name">CRETE</p><p class="offer-desc">Sun-soaked beaches, authentic Greek vibes, and unforgettable moments.</p></div>' +
        '<div class="offer-card"><div class="offer-img"><img src="' + IMG_ANTALYA + '" alt="Antalya, Turkey"></div>' +
          '<p class="offer-name">ANTALYA</p><p class="offer-desc">Turquoise beaches, all-inclusive comfort, vibrant nightlife, and endless summer vibes.</p></div>' +
        '<div class="offer-card"><div class="offer-img"><img src="' + IMG_SHARM + '" alt="Sharm El Sheikh, Egypt"></div>' +
          '<p class="offer-name">SHARM EL SHEIKH</p><p class="offer-desc">Crystal-clear beaches, coral reefs, desert adventures, and year-round sunshine.</p></div>' +
      '</div>' +
    '</section>';

  // ── Instagram-style grid ────────────────────────────────────────────────────
  var IG_HTML =
    '<section class="ig-section gasa-block">' +
      '<div class="ig-header"><h2 class="ig-title">Follow our journey</h2><p class="ig-sub">@gasa.georgia on Instagram</p></div>' +
      '<div class="ig-grid">' +
        '<div class="ig-tile"><img src="' + IMG_GREECE_TILE + '" alt="Greece sunset"><div class="ig-tile-overlay"></div>' +
          '<div class="ig-tile-content"><div><p class="ig-tag">Your new destination</p><p class="ig-headline">Greece</p></div>' + igLogo() + '</div></div>' +
        '<div class="ig-tile"><img src="' + IMG_AIRPLANE + '" alt="Airplane"><div class="ig-tile-overlay"></div>' +
          '<div class="ig-tile-content"><div><p class="ig-tag">Your journey, our passion</p><p class="ig-headline">Tailored journeys<br>for every traveler</p>' +
          '<p class="ig-text">Handpicked destinations, exclusive experiences and unforgettable moments.</p></div>' + igLogo() + '</div></div>' +
        '<div class="ig-tile"><img src="' + IMG_HOTEL_TILE + '" alt="Hotel room at night"><div class="ig-tile-overlay"></div>' +
          '<div class="ig-tile-content"><div><p class="ig-tag">Luxury stays</p><p class="ig-headline">Handpicked<br>Hotels</p></div>' + igLogo() + '</div></div>' +
        '<div class="ig-tile ig-tile-quote"><span class="ig-quote-mark">&ldquo;</span>' +
          '<p class="ig-quote-text">The world is a book and those who do not travel read only one page.</p>' + igLogo() + '</div>' +
        '<div class="ig-tile"><img src="' + IMG_WING_TILE + '" alt="Airplane wing at sunset"><div class="ig-tile-overlay"></div>' +
          '<div class="ig-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>' +
          '<div class="ig-tile-content"><div><p class="ig-tag">Fly comfortably</p><p class="ig-headline">Fly More,<br>Worry Less</p></div>' + igLogo() + '</div></div>' +
        '<div class="ig-tile"><img src="' + IMG_SANTORINI_TILE + '" alt="Santorini blue domes"><div class="ig-tile-overlay"></div>' +
          '<div class="ig-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>' +
          '<div class="ig-tile-content"><div><p class="ig-tag">Experiences</p><p class="ig-headline">Create memories<br>that last a lifetime</p></div>' + igLogo() + '</div></div>' +
      '</div>' +
    '</section>';

  // ── Reviews slider ──────────────────────────────────────────────────────────
  var REVIEWS = [
    ["An incredible trip to Greece! GASA arranged everything at the highest level — flights, a hotel overlooking the Aegean Sea, and excursions. Every detail was perfectly thought out.", "NM", "Nino Mgaloblishvili", "Greece · Santorini"],
    ["We vacationed in Antalya as a family. The kids loved the beaches, the adults loved the service. Our manager was always available and handled every question instantly.", "GK", "Giorgi Kvaratskhelia", "Turkey · Antalya"],
    ["Sharm El Sheikh exceeded all expectations! Crystal-clear water, coral reefs, and a magnificent hotel. Thank you GASA for an unforgettable experience!", "MC", "Maia Chikvanaia", "Egypt · Sharm El Sheikh"],
    ["This is our third trip booked through GASA. Every time brings new memories and flawless service. The team's professionalism never stops impressing us.", "DA", "Davit Arabuli", "Greece · Crete"],
    ["Our honeymoon in Crete was a dream come true! A romantic dinner with a sunset view, private tours, and a beautiful villa. Everything was arranged with great care.", "SB", "Salome Beriashvili", "Greece · Crete"],
    ["The group tour to Egypt was brilliantly organised. Our guide was a true expert with deep knowledge of the country's history. I'll definitely be booking with GASA again!", "LT", "Lela Tavdishvili", "Egypt · Luxor"]
  ];
  function reviewsHTML() {
    var slides = REVIEWS.map(function (r, i) {
      return '<div class="review-slide' + (i === 0 ? " active" : "") + '">' +
        '<p class="review-quote">' + r[0] + '</p>' +
        '<div class="review-person"><div class="review-avatar-circle">' + r[1] + '</div>' +
        '<div class="review-person-info"><div class="review-person-name">' + r[2] + '</div>' +
        '<div class="review-person-dest">' + r[3] + '</div></div></div></div>';
    }).join("");
    return '<section class="reviews-section gasa-block">' +
      '<div class="reviews-header"><div>' +
        '<p class="reviews-subtitle">What our travellers say</p>' +
        '<h2 class="reviews-title">Reviews from <span>our travellers</span></h2></div></div>' +
      '<div class="reviews-slider">' +
        '<button type="button" class="reviews-arrow" data-gasa-rev="prev" aria-label="Previous"><svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg></button>' +
        '<div class="reviews-stage"><div class="reviews-viewport">' + slides + '</div>' +
          '<div class="reviews-progress"><div class="reviews-progress-fill" data-gasa-rev-fill style="width:' + (100 / REVIEWS.length) + '%"></div></div>' +
        '</div>' +
        '<button type="button" class="reviews-arrow" data-gasa-rev="next" aria-label="Next"><svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg></button>' +
      '</div>' +
    '</section>';
  }

  // ── Benefits & Values ───────────────────────────────────────────────────────
  var BENEFITS_HTML =
    '<section class="benefits-values gasa-block">' +
      '<h2 class="bv-title">Benefits &amp; Values</h2>' +
      '<div class="bv-layout">' +
        '<div class="bv-img"><img src="' + IMG_AIRPLANE + '" alt="Airplane"></div>' +
        '<div class="bv-list">' +
          '<div class="bv-item"><div class="bv-icon"><svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg></div>' +
            '<p class="bv-name">Seamless Experience</p><p class="bv-desc">From booking to travel completion, we manage every detail to ensure a smooth and stress-free journey.</p></div>' +
          '<div class="bv-item"><div class="bv-icon"><svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg></div>' +
            '<p class="bv-name">Trusted Partnerships</p><p class="bv-desc">We collaborate with reliable international partners to guarantee consistent and dependable service.</p></div>' +
          '<div class="bv-item"><div class="bv-icon"><svg viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8a19.79 19.79 0 01-3.07-8.67A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.72 6.72l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg></div>' +
            '<p class="bv-name">Responsive Support</p><p class="bv-desc">Our team is always ready to assist you during working hours, ensuring fast and reliable communication at every stage.</p></div>' +
          '<div class="bv-item"><div class="bv-icon"><svg viewBox="0 0 24 24"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/></svg></div>' +
            '<p class="bv-name">Quality &amp; Value</p><p class="bv-desc">We prioritize quality in every product we offer, ensuring the best balance between price and experience.</p></div>' +
        '</div>' +
      '</div>' +
    '</section>';

  // ── Footer (design) ─────────────────────────────────────────────────────────
  var FOOTER_HTML =
    '<footer class="footer-v2 gasa-block">' +
      '<div class="fv2-top">' +
        '<div class="fv2-col fv2-brand-col">' +
          '<a href="/" class="fv2-brand-logo"><img src="' + LOGO_W + '" alt="GASA" style="height:34px;width:auto"></a>' +
          '<p class="fv2-brand-tagline">Your trusted travel partner in Georgia since 2003.</p>' +
        '</div>' +
        '<div class="fv2-col"><h4>Company</h4><ul>' +
          '<li><a href="#">About GASA</a></li><li><a href="#">Privacy Policy</a></li>' +
          '<li><a href="#">Terms &amp; Conditions</a></li><li><a href="#">Refund Policy</a></li><li><a href="#">Contact</a></li></ul></div>' +
        '<div class="fv2-col"><h4>Services</h4><ul>' +
          '<li><a href="#">Tour Packages</a></li><li><a href="#">Flights</a></li><li><a href="#">Hotels</a></li>' +
          '<li><a href="#">Activities</a></li><li><a href="#">Transfers</a></li></ul></div>' +
        '<div class="fv2-col"><h4>Contact</h4>' +
          '<p class="fv2-address">Merab Kostava Str. N14 (Stamba),<br>Tbilisi, Georgia</p>' +
          '<div class="fv2-phone-row"><a href="tel:+995322400040" class="fv2-phone">(+995) 322 40 00 40</a>' +
            '<a href="https://api.whatsapp.com/send?phone=995322400040" target="_blank" rel="noopener" class="btn-whatsapp">' +
            '<svg viewBox="0 0 24 24"><path d="M17.6 6.32A8.86 8.86 0 0012.1 4 8.94 8.94 0 003.5 17.5L2 22l4.6-1.5a8.94 8.94 0 0013.4-7.75 8.83 8.83 0 00-2.4-6.43zM12.1 20.1a7.4 7.4 0 01-3.78-1.04l-.27-.16-2.8.92.9-2.73-.18-.28a7.43 7.43 0 1112.93-5.16 7.4 7.4 0 01-6.8 8.45z"/></svg>WhatsApp</a></div>' +
          '<div class="fv2-social">' +
            '<a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>' +
            '<a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><circle cx="17.5" cy="6.5" r="1"/></svg></a>' +
          '</div>' +
        '</div>' +
        '<div class="fv2-col"><h4>Check Booking</h4>' +
          '<div class="fv2-form-group"><label class="fv2-form-label">Booking ID</label><input class="fv2-form-input" type="text" placeholder="e.g. GSA-12345"></div>' +
          '<div class="fv2-form-group"><label class="fv2-form-label">E-mail address</label><input class="fv2-form-input" type="email" placeholder="your@email.com"></div>' +
          '<button class="fv2-check-btn" type="button">Check</button>' +
        '</div>' +
      '</div>' +
      '<div class="fv2-bottom">' +
        '<div class="fv2-payments">Payments:<span class="pay-icon">VISA</span><span class="pay-icon">MC</span></div>' +
        '<p class="fv2-copyright">2026 © GASA · Powered by Juniper</p>' +
        '<a href="#" class="fv2-totop"><svg viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>Back to top</a>' +
      '</div>' +
    '</footer>';

  var enhancements = [
    // Tag <body> so the theme can scope safely.
    { name: "mark-body", run: function () {
      if (!document.body.hasAttribute("data-gasa")) document.body.setAttribute("data-gasa", "");
    } },

    // Single-row header: move the nav menu to sit right after the logo (design
    // puts it on the left). Only on landing templates; a plain relocation of the
    // real menu node — listeners preserved. CSS lays the row out.
    { name: "header-one-row", run: function () {
      if (document.body.id !== "home" && document.body.id !== "packages") return;
      var topRow = document.querySelector(".main-header .top-row");
      var logo = document.getElementById("logoWrapper");
      var menu = document.getElementById("main-menu");
      if (!topRow || !logo || !menu) return;
      if (menu.parentElement === topRow && menu.previousElementSibling === logo) return; // already placed
      logo.insertAdjacentElement("afterend", menu);
    } },

    // Add "Check Booking" to the left nav (styled like the other links). It uses
    // the same Bootstrap modal target as the platform's utility-bar button, so
    // the delegated handler opens the real check-booking modal. The originals
    // (this button + WhatsApp + phone) are hidden via gasa-theme.css.
    { name: "header-checkbooking", run: function () {
      if (document.body.id !== "home" && document.body.id !== "packages") return;
      var ul = document.querySelector("#main-menu .menu.nav.navbar-nav");
      if (!ul || ul.querySelector(".gasa-checkbooking")) return;
      ul.appendChild(el(
        '<li class="nav-elem gasa-checkbooking">' +
          '<a href="#" data-toggle="modal" data-target="#upper-quick-links-checkbooking-container">Check Booking</a>' +
        '</li>'
      ));
    } },

    // Overlay the Greece caption + logo onto the platform hero carousel.
    { name: "hero-caption", run: function () {
      var top = document.getElementById("home-top");
      if (!top || top.querySelector(".gasa-hero-content")) return;
      top.appendChild(el(HERO_HTML));
    } },

    // Inject the design sections once, in order, right after the hero section.
    { name: "inject-sections", run: function () {
      if (document.getElementById("gasa-sections")) return;
      // Anchor on #home-top itself (the hero). The platform relocates the
      // .multi-searcher INTO #home-top's floating slot at runtime, so anchoring
      // on the searcher would nest our sections inside the hero.
      var anchor = document.getElementById("home-top");
      if (!anchor || !anchor.parentNode) return;
      var box = document.createElement("div");
      box.id = "gasa-sections";
      box.appendChild(el(FEATURES_HTML));
      box.appendChild(el(OFFERS_HTML));
      box.appendChild(el(IG_HTML));
      box.appendChild(el(reviewsHTML()));
      box.appendChild(el(BENEFITS_HTML));
      box.appendChild(el(FOOTER_HTML));
      anchor.parentNode.insertBefore(box, anchor.nextSibling);
    } },

    // Wire the reviews slider (idempotent; binds once).
    // (Platform marketing sections + footer are hidden via gasa-theme.css.)
    { name: "reviews-slider", run: function () {
      var slider = document.querySelector(".reviews-slider:not([data-gasa-done])");
      if (!slider) return;
      slider.setAttribute("data-gasa-done", "");
      var slides = slider.querySelectorAll(".review-slide");
      var fill = slider.querySelector("[data-gasa-rev-fill]");
      var total = slides.length, cur = 0;
      function show(n) {
        slides[cur].classList.remove("active");
        cur = (n + total) % total;
        slides[cur].classList.add("active");
        if (fill) fill.style.width = ((cur + 1) / total * 100) + "%";
      }
      slider.querySelector('[data-gasa-rev="prev"]').addEventListener("click", function () { show(cur - 1); });
      slider.querySelector('[data-gasa-rev="next"]').addEventListener("click", function () { show(cur + 1); });
    } }
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
