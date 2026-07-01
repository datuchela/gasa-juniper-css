/* ============================================================================
   gasa-enhance.js  ·  GASA — DOM layer for www.gasa.ge
   ----------------------------------------------------------------------------
   Loaded AFTER the Juniper platform JS. CLEAN SLATE — add enhancements to the
   `enhancements` array. Applies SITE-WIDE (preview on the home page).

   Removing, restructuring and adding DOM is EXPECTED — we re-implement the
   handed-over design, stripping platform sections it doesn't use — AS LONG AS
   site functionality is preserved. The platform's own JS owns the search,
   booking, calendars and ViewState; break those and the site dies. So:

   HANDS OFF (read only — never innerHTML-replace, never rename/move form
   controls, never destroy their bound listeners):
     .home-searcher            #home-top / #package-searcher   .multi-searcher__content
     [class*="calendar"]       .room-selector-box              form (any)
     [class*="js-"]            .login-box                      .modal
     search-results containers slick-cloned carousel slides

   FREE TO REMOVE / REPLACE (anything the design omits):
     section wrappers, offers/promotions, .benefits__*, .topdestinations__*,
     footer link lists, headings, and brand-new nodes you create.

   To move existing nodes, use appendChild / insertBefore on the real node (keeps
   listeners) — do not clone/recreate interactive elements. Prefer CSS for
   visual/layout; use JS for hooks, reflows, and genuinely new content.
   ============================================================================ */
(function () {
  // Add { name, run() } objects. Each run() MUST be idempotent: select with
  // :not([data-gasa-done]), set the data-gasa-* marker FIRST, then act. This is
  // what lets the MutationObserver re-run safely after platform re-renders
  // without looping or double-applying.
  const enhancements = [
    // { name: "example", run() {
    //   document.querySelectorAll(".benefits__childs__item:not([data-gasa-done])").forEach((el) => {
    //     el.setAttribute("data-gasa-done", "");
    //     // ...additive DOM work here...
    //   });
    // } },
  ];

  function applyAll() {
    for (const e of enhancements) {
      try { e.run(); } catch (err) { console.warn("[gasa]", e.name, err); }
    }
  }

  let scheduled = 0;
  const observer = new MutationObserver(() => {
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
