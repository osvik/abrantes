# End-to-End Recipe: Static Site + GA4 (gtag.js) + Form Tracking

Part of the Abrantes experiment builder skill. Read `SKILL.md` (in the repository root) first: it has the core pattern, the API, the tracking rules and the checklist.

**Load this file when:** the site is built with a static site generator (11ty, Hugo, Astro, Jekyll...), tracked with GA4 through gtag.js, and the conversion is a form submission.

The full setup for a site built with a static site generator (11ty, Hugo, Astro, Jekyll...), tracked with GA4 through gtag.js, where the conversion is a form submission. It puts together "GA4 (gtag.js): Script Order" and "Several Experiments on the Same Page" (in `SKILL.md`) and `references/testing.md`.

## 1. The layout: three blocks in `<head>`, in this order

Use **classic scripts in `<head>`** (not the as-module pattern). They run in order, so `track()` always runs before `gtag('config')`, and the class `{testId}-{variant}` is on `<html>` before the first paint (no flicker for CSS changes).

```html
<head>
  <!-- 1. GA4 snippet, WITHOUT gtag('config'). In the layout of every page. -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    window.googleTrackingConfig = {};
  </script>

  <!-- 2. Experiment slot: only on the pages with an experiment -->
  <script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
  <script>
    const HeroCta = Object.create(Abrantes);
    HeroCta.variants = [
      function () { /* control */ },
      function () {
        // The script is in <head>, so the elements don't exist yet: always use waitFor()
        HeroCta.waitFor("#cta", function () {
          document.querySelector("#cta").textContent = "Sign the petition now";
        });
      }
    ];
    HeroCta.assignVariant("hero_cta_2026");
    HeroCta.renderVariant();
    HeroCta.persist("cookie");
    HeroCta.track("ab_test");   // GA4 event-scoped custom dimension
    HeroCta.formTrack();        // fills #last_abtest_variant
  </script>
  <style>
    /* CSS changes: use the class on <html> */
    .hero_cta_2026-1 #cta { background: #e00; }
  </style>

  <!-- 3. GA4 config, always last. In the layout of every page. -->
  <script>
    gtag('config', 'G-XXXXXXX', window.googleTrackingConfig);
  </script>
</head>
```

- Blocks 1 and 3 go in the **base layout** of every page. Pages without an experiment simply send an empty `window.googleTrackingConfig`.
- Block 2 is an **empty slot in the layout** (e.g. a Nunjucks `{% block experiment %}{% endblock %}`, a Hugo `{{ block "experiment" . }}{{ end }}`, an Astro named `<slot>`), filled only by the pages in the experiment. It must stay **between** blocks 1 and 3. Never put the experiment at the end of `<body>` while the config is in `<head>`: the dimension would not be sent.
- With several experiments on the same page, put them all in the slot, each with its own dimension name (see "Several Experiments on the Same Page" in `SKILL.md`).
- If the site loads scripts with `defer` instead, keep the same order with deferred scripts (see "GA4 (gtag.js): Script Order" in `SKILL.md`).
- If the site uses Google Consent Mode, `gtag('consent', 'default', {...})` goes at the start of block 1 (see `references/consent-mode.md`).

## 2. The form: hidden field, included in the submission

```html
<form id="petition">
  <!-- ... visible fields ... -->
  <input type="hidden" id="last_abtest_variant" name="last_abtest_variant">
</form>
```

- `formTrack()` writes `hero_cta_2026-0` / `hero_cta_2026-1` in it on `DOMContentLoaded`. The field must be in the HTML of the page (not added later by another script), or `formTrack()` logs a warning and the value isn't saved.
- **The value must reach the CRM.** A native form submission sends it because it has a `name`. If the site submits with JavaScript (e.g. the HubSpot Forms API with `fetch`):
  - Read the value **at submit time** (`new FormData(form)` includes it automatically). If the code builds the list of fields by hand, add `last_abtest_variant` to it.
  - HubSpot: create a contact property (single-line text, internal name `last_abtest_variant`), add it to the HubSpot form as a hidden field, and send it in the `fields` array: `{ "objectTypeId": "0-1", "name": "last_abtest_variant", "value": form.last_abtest_variant.value }`.
  - The field is empty when the visitor is not in the test or the visit is forced. Send it only when it isn't empty, so an empty value never replaces one saved earlier.
- Also send a GA4 event when the form is submitted successfully (e.g. `gtag('event', 'generate_lead')`) and mark it as a **key event** in GA4 admin. It carries the experiment dimension like every other event on the page.

## 3. GA4 admin: register the custom dimension before launch

In GA4: **Admin → Data display → Custom definitions → Create custom dimension**:

- Dimension name: e.g. `AB test`. Scope: **Event**. Event parameter: **exactly** the name used in `track()` (`ab_test`).
- For `trackUser()`, create a second one with scope **User** and the user property name.
- Custom dimensions are not retroactive: register them **before** the experiment starts, or the first days are lost. New data can take 24-48 hours to appear in reports.
- Each experiment running at the same time needs its own dimension (and its own registration).

## 4. Check it before launch

1. Each variant, not tracked: `page.html?abrantes_force=hero_cta_2026:N&abrantes_debug`. Check the page and take a screenshot. The console shows the forced variant and that persist and tracking are skipped.
2. Tracking, in a fresh browser (no cookies): `page.html?abrantes_debug`. The console must show `abrantes:assignVariant`, `abrantes:persist`, `abrantes:track` (`ga4-gtag`) and `formTrack(): #last_abtest_variant value set`, and **no** `console.warn` from Abrantes. Then check:
   - `window.googleTrackingConfig` → `{ ab_test: "hero_cta_2026-N" }`.
   - The GA4 requests (`/g/collect`, in the URL or the POST body) contain `ep.ab_test=hero_cta_2026-N` for `page_view` and for the conversion event. In Playwright, intercept them with `page.route(/\/g\/collect/, ...)` and answer with `route.fulfill({ status: 204 })` so test visits don't reach GA4.
   - The submitted form data (or the CRM contact) contains `last_abtest_variant`.
3. To check tracking for a specific variant, set the cookie before loading the page (e.g. Playwright `context.addCookies([{ name: "hero_cta_2026", value: "1", url: "https://..." }])`). `assignVariant()` uses the stored variant, and the visit is tracked normally.

## 5. Analyse

In GA4 (Explorations), break down the users and the key event by the custom dimension (`hero_cta_2026-0`, `hero_cta_2026-1`), or count the CRM contacts by `last_abtest_variant`. Then check the result with the [A/B Test Significance Calculator](https://osvik.github.io/abrantes-test-calculator/).
