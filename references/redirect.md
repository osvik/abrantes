# Redirect Experiments

Part of the Abrantes experiment builder skill. Read `SKILL.md` (in the repository root) first: it has the core pattern, the API, the tracking rules and the checklist.

**Load this file when:** the variants are separate pages (new layouts, redesigns, changes too complex for DOM manipulation).

**When to use:** Redirect experiments should be used when the changes to the page are too complex to apply via DOM manipulation in variant functions. For example: entirely different page layouts, major structural changes, or redesigns that would be fragile and error-prone to implement by modifying the existing DOM. In these cases, each variant is a separate page and Abrantes redirects users to the appropriate one.

**Trade-off:** Redirect experiments are less reliable than in-page experiments because someone may link directly to a variant URL instead of the redirect page. Only use them when the changes are too complex for a traditional experiment.

A redirect experiment has **two parts**:

## Part 1: The redirect page (the original URL that users/links point to)

This page assigns the variant and immediately redirects. It should have minimal content since it won't be seen. Each variant function uses `redirectTo()` to send the user to the correct variant URL, passing the test ID and variant as query parameters.

```html
<script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
<script>
  var MyTest = Object.create(Abrantes);

  MyTest.variants = [
    // Variant 0 — the control/original page
    function () {
      MyTest.redirectTo("variant-0.html?MyTest=0");
    },
    // Variant 1
    function () {
      MyTest.redirectTo("variant-1.html?MyTest=1");
    }
  ];

  MyTest.assignVariant("MyTest");
  MyTest.renderVariant();
</script>
```

Key points for the redirect page:
- `redirectTo()` preserves existing query parameters and hash fragments from the current URL.
- The variant number is passed as a query parameter matching the test ID (`?MyTest=0`, `?MyTest=1`).
- Do NOT call `persist()` or tracking methods here — those go on the variant pages.

## Part 2: Each variant page (the destination URLs)

Each variant page uses `importVariant()` instead of `assignVariant()` to read the variant from the URL query parameter. The variant functions can (and usually should) be empty since the page itself IS the variant. Tracking and persistence happen here.

```html
<script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>

<!--
  IMPORTANT: Each variant page must include a canonical tag pointing to the
  original redirect page. This prevents SEO issues and tells search engines
  the variant pages are part of the same test.
-->
<link rel="canonical" href="https://www.example.com/original-page.html">

<script>
  var MyTest = Object.create(Abrantes);

  // Variant functions should be empty — the page itself is the variant
  MyTest.variants = [
    function () { /* variant 0 - control */ },
    function () { /* variant 1 */ }
  ];

  // Import variant from the URL query parameter (NOT assignVariant)
  MyTest.importVariant("MyTest");

  // Render (adds the class to <html>, useful for CSS-based adjustments)
  MyTest.renderVariant();

  // Persist so the user gets the same variant on return visits
  MyTest.persist("cookie");

  // Tracking — add the methods appropriate for the page
  MyTest.add2dataLayer("my_test");
  MyTest.hotjar();
</script>
```

Key points for variant pages:
- Use `importVariant("MyTest")` — NOT `assignVariant()`. This reads the variant from the `?MyTest=N` query parameter.
- The `variants` array must have the same number of entries as on the redirect page, but the functions should be empty (the page content is the variant).
- All variant pages must include `<link rel="canonical" href="...">` pointing to the original redirect page URL to avoid SEO duplication issues.
- `persist()` and tracking calls go here, not on the redirect page.
- The same script should be placed on ALL variant pages (including the control/variant-0).

## When to provide redirect experiment code to the user

When you recommend a redirect experiment, provide the user with:
1. The code for the **redirect page** — explain this goes on the original URL.
2. The code for the **variant pages** — explain this same script goes on every variant page (including the control). Remind them to add the canonical tag.
3. A reminder that all links should point to the redirect page, never directly to variant URLs.
