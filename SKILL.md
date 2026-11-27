---
name: experiment
description: Create A/B test experiments using the Abrantes library. Use when the user wants to build, plan, or set up an A/B test experiment on a website.
argument-hint: [description of the experiment]
disable-model-invocation: true
allowed-tools: Read, Grep, Glob, Bash(curl *), WebFetch, WebSearch
---

# Abrantes A/B Test Experiment Builder

You are helping the user create an A/B test experiment using **Abrantes**, a lightweight JavaScript A/B testing library. Your job is to write the experiment code, recommend tracking, and guide the user through setup.

The user's request: **$ARGUMENTS**

## Your Workflow

1. **Understand the experiment**: Ask clarifying questions if the description is vague. You need to know: what page(s), what changes per variant, how many variants, any segmentation or traffic allocation requirements.
2. **Inspect the target page(s)**: If the user provides a URL, fetch it to understand the DOM structure, what analytics/tag management tools are installed, and whether Abrantes is already loaded.
3. **Write the experiment code**: Use the patterns and API reference below. For a static site with GA4 (gtag.js) and a form, follow the "End-to-End Recipe" section.
4. **Recommend tracking**: Based on what tools are detected on the page.
5. **Recommend planning tools**: Always suggest the [planner](https://osvik.github.io/abrantes-test-calculator/planner.html) and [calculator](https://osvik.github.io/abrantes-test-calculator/).

---

## Abrantes API Reference

### Loading Abrantes

**CDN (preferred when Abrantes is not already on the page):**

Please check that Abrantes is not already loaded on the page before suggesting the CDN pattern. You can do this by checking the page source code and looking for mentions to AbrantesPlus.min.js or running `typeof (Abrantes) == "object"` in the browser console.

If Abrantes is already loaded, use the classic script pattern and don't suggest a script tag with the Abrantes script.

Classic script:
```html
<script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
```

ES6 module import:
```js
import Abrantes from 'https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlusMod.min.js';
```

### Creating an Experiment

Every experiment follows this pattern:

```js
var MyTest = Object.create(Abrantes);

MyTest.variants = [
  function () { /* variant 0 - usually the control (no changes) */ },
  function () { /* variant 1 - changes */ },
  // ... more variants as needed
];

MyTest.assignVariant("MyTest");   // assign user to a variant
MyTest.renderVariant();            // execute the variant function
MyTest.persist("cookie");          // persist assignment
// + tracking calls
```

### Choosing the Code Pattern

Use these rules to decide which pattern to use:

1. **As-module pattern** (easiest, no template changes needed) - Use when:
   - Abrantes is NOT already loaded on the page
   - The user wants minimal setup
   - The user doesn't mention GTM (Google Tag Manager)

```html
<script type="module" async>
  import Abrantes from 'https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlusMod.min.js';

  var MyTest = Object.create(Abrantes);

  MyTest.variants = [
    function () { /* control */ },
    function () { /* variant 1 */ }
  ];

  MyTest.assignVariant("MyTest");
  MyTest.renderVariant();
  MyTest.persist("cookie");
  // tracking calls here
</script>
```

2. **Classic script pattern** - Use when:
   - Abrantes IS already loaded on the page as a script
   - Multiple experiments share the same Abrantes script

```html
<script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
<script>
  var MyTest = Object.create(Abrantes);
  // ... same pattern as above
</script>
```

3. **GTM pattern** - Use ONLY when the user specifically asks for GTM:

```html
<!-- Inside a GTM Custom HTML tag -->
<script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
<script>
  var MyTest = Object.create(Abrantes);
  MyTest.variants = [
    function () {
      // Use waitFor since DOM may not be ready when GTM fires
      MyTest.waitFor("h1", function () {
        const el = document.querySelector("h1");
        el.textContent = "New headline";
      });
    },
    function () {
      MyTest.waitFor("h1", function () {
        const el = document.querySelector("h1");
        el.textContent = "Another headline";
      });
    }
  ];
  MyTest.assignVariant("MyTest");
  MyTest.renderVariant();
  MyTest.persist("cookie");
  MyTest.add2dataLayer();
</script>
```

**Important GTM notes:**
- Always use `waitFor()` inside variant functions when running from GTM, since the DOM may not be ready.
- Performance may be lower compared to direct script inclusion.
- The GTM tag should fire on the relevant page(s) using a GTM trigger.
- Use `add2dataLayer()` to send experiment data back to GTM for analytics.

### Core Methods

| Method | Description |
|---|---|
| `assignVariant(testId, trafficAllocation?, segment?)` | Assign user to a variant. `testId` is a unique string. `trafficAllocation` is a number between 0 and 1 (default 1 = 100%). `segment` is a function returning boolean. |
| `renderVariant()` | Execute the assigned variant function. Adds CSS class `{testId}-{variant}` to `<html>`. |
| `persist(context?)` | Save assignment. Context: `"cookie"` (default, 7 days), `"user"` or `"local"` (localStorage), `"session"` (sessionStorage). |
| `waitFor(selector, callback)` | Wait for a DOM element using MutationObserver. **You MUST use this whenever the target element may not exist yet** — see "When to use `waitFor`" below. |
| `redirectTo(url)` | Redirect preserving query params and hash. Use inside variant functions for redirect tests. |
| `crossSiteLink(selector)` | Rewrite links to pass experiment data cross-site. Use with `importVariant` on destination. |
| `importVariant(testId)` | Read variant from URL query params (for cross-site experiments). |
| `makeCrossSiteURL(url)` | Generate a URL with experiment params appended. |
| `?abrantes_force=MyTest:1` (URL) | Not a method: forces a variant for testing. See "Testing Each Variant" below. |
| `Abrantes.debug = true` or `?abrantes_debug` (URL) | Debug mode: logs every step to the console. See "Debug Mode" below. |
| `onEvent(eventName, callback)` | Run `callback` when a window event fires. If the event is `DOMContentLoaded` or `load` and has already happened (e.g. `async` or module scripts, scripts added by a tag manager), it runs on the next tick instead of never. `crossSiteLink()` and `formTrack()` use it for their trigger events. |

### When to Use `waitFor`

**`waitFor(selector, callback)` is required whenever the target DOM element might not exist at the time the variant function runs.** This is not limited to SPAs or GTM — it applies to any situation where the element is not yet in the DOM. Common cases:

1. **The experiment script is placed above the target element in the HTML.** If the `<script>` tag appears in `<head>` or anywhere before the element it modifies, that element does not exist yet when the script executes. You must use `waitFor`.
2. **The experiment runs from GTM.** GTM Custom HTML tags can fire before the DOM is fully built.
3. **The page is a Single Page Application (SPA).** Content is rendered dynamically after initial page load.
4. **The target element is loaded lazily or injected by another script.**

**Rule of thumb:** If you cannot guarantee the element exists when the variant function runs, use `waitFor`. When in doubt, use `waitFor` — it has no downside when the element already exists (the callback fires immediately).

```js
// WRONG — element may not exist yet
function () {
  document.querySelector(".hero-title").textContent = "New title";
}

// CORRECT — safe regardless of script placement
function () {
  MyTest.waitFor(".hero-title", function () {
    const el = document.querySelector(".hero-title");
    el.textContent = "New title";
  });
}
```

**When you can skip `waitFor`:** Only when the experiment script is placed at the bottom of the `<body>` (after all target elements) and the page does not use client-side rendering.

### Seeded (Deterministic) Assignment

For cookieless experiments or cross-device consistency with logged-in users:

```js
// Must be async
await MyTest.assignSeededVariant("MyTest", seedString, trafficAllocation, segment);
```

### Excluding Variants Mid-Experiment

```js
MyTest.excludedVariantsForNewUsers = [2]; // new users won't get variant 2
MyTest.assignVariant("MyTest");
```

### Consent and Storage

Abrantes doesn't manage consent. Each method stores or sends data only when it is called:

- `persist()` writes a cookie (`{testId}={variant}`, 7 days by default, `SameSite=Strict`), a `localStorage` entry or a `sessionStorage` entry. `assignVariant()` only reads them. Without `persist()` nothing is stored, but the visitor may get a different variant on each page load.
- The tracking methods hand the value to the tool on the page, and that tool (and its consent setup) decides what is sent: `track()` writes it into `window.googleTrackingConfig` for gtag.js, `add2dataLayer()` pushes to the `dataLayer`, `hubspotEvent()` to `_hsq`, `hotjar()` and `clarity()` call `hj()` and `clarity()`. `log()` is the exception: it sends a request to the Log API itself. `formTrack()` only writes into the form field.
- `formTrack()` and `clarity()` run on the events in `settings.formTrack.triggerEvents` / `settings.clarity.triggerEvents`, and `hotjar()` on `settings.hotjar.triggerEvents` when Hotjar isn't loaded yet. These can be set to the consent events of the site.

So the site's consent setup decides where and when `persist()` and the tracking methods can be called. Follow the site's rules, or ask the user if they are unknown. Don't choose a consent approach on your own.

### CSS Experiments (styles, layout tweaks, element visibility...)

Variants can be empty functions. `renderVariant()` adds the class `{testId}-{variant}` to `<html>`, enabling experiments with CSS:

```css
.MyDesignExp-1 h1 { font-size: 2.5rem; }
.MyDesignExp-2 h1 { font-size: 1.7rem; }
```

**If an experiment can be done purely with CSS, it's often better to use this approach, for simplicity and performance.**

If part of the experiment is modifying styles, it's better that part of the experiment is done via CSS (using the class added by Abrantes to the `<html>` element). Use JavaScript for structural changes or content changes that can't be achieved with CSS.

A style block is then included in the experiment code, like this example:

```html
<style>
  /* Style changes via CSS */
  .MyTest-1 .hero { background-color: #f0f0f0; }
  .MyTest-2 .hero { background-color: #e0e0e0; }
</style>
```

### Redirect Experiments

**When to use:** Redirect experiments should be used when the changes to the page are too complex to apply via DOM manipulation in variant functions. For example: entirely different page layouts, major structural changes, or redesigns that would be fragile and error-prone to implement by modifying the existing DOM. In these cases, each variant is a separate page and Abrantes redirects users to the appropriate one.

**Trade-off:** Redirect experiments are less reliable than in-page experiments because someone may link directly to a variant URL instead of the redirect page. Only use them when the changes are too complex for a traditional experiment.

A redirect experiment has **two parts**:

#### Part 1: The redirect page (the original URL that users/links point to)

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

#### Part 2: Each variant page (the destination URLs)

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

#### When to provide redirect experiment code to the user

When you recommend a redirect experiment, provide the user with:
1. The code for the **redirect page** — explain this goes on the original URL.
2. The code for the **variant pages** — explain this same script goes on every variant page (including the control). Remind them to add the canonical tag.
3. A reminder that all links should point to the redirect page, never directly to variant URLs.

### Iframe Experiments

Use iframe experiments when the conversion event (e.g. a form submission, a donation button) happens inside an iframe, or when part of the experiment content lives inside an iframe. There are two approaches depending on how much control you have over the iframe's JavaScript.

#### Choosing the approach

| Scenario | Approach |
|---|---|
| You can add full JavaScript (including Abrantes) inside the iframe | **Full JS** — Abrantes runs on both parent and child, variant is passed via `makeCrossSiteURL` + `importVariant` |
| You can only add minimal JavaScript inside the iframe (e.g. just a conversion event) | **Limited JS** — Each variant loads a different iframe URL, child only sends `postMessage` for conversions |
| You cannot add any JavaScript to the iframe | Not suitable for iframe experiments — consider a redirect experiment instead |

#### Common to both approaches: Tracking conversions from the iframe

In both approaches, the conversion event happens inside the iframe and must be communicated to the parent page (where the analytics tools live) using `window.postMessage`.

**Inside the iframe** — send a message to the parent when the conversion happens:

```js
document.getElementById("myButton").addEventListener("click", function () {
  var message = {
    event: "donation",   // the event name your analytics will use
    label: "monthly",    // any additional data
    value: 12
  };
  // Replace '*' with the specific parent origin in production for security
  window.parent.postMessage(message, "*");
});
```

**On the parent page** — listen for messages and push them to the dataLayer (or other tracking) with the experiment data attached:

```js
window.addEventListener("message", function (event) {
  // In production, always verify the origin:
  // if (event.origin !== 'https://trusted-domain.com') return;

  if (event.data && event.data.event) {
    Object.assign(event.data, {
      ab_test_data: "my_test" + "-" + MyTest.variant
    });
    dataLayer.push(event.data);
  }
});
```

This ensures conversion events from the iframe are tracked in the parent's analytics with the correct experiment variant attached.

#### Approach 1: Full JS (Abrantes in both parent and child)

Use when you have full control over the iframe content and can load Abrantes inside it. The parent assigns the variant and passes it to the child iframe via URL query parameters. The child uses `importVariant` to read it.

**Parent page:**

```html
<script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
<script>
  var MyTest = Object.create(Abrantes);

  MyTest.variants = [
    function () {
      document.getElementById("bigH1").innerText = "Original heading";
      MyTest.waitFor("#myIframe", function () {
        var iframeURL = MyTest.makeCrossSiteURL("https://example.com/child.html");
        document.getElementById("myIframe").src = iframeURL;
      });
    },
    function () {
      document.getElementById("bigH1").innerText = "Variant 1 heading";
      MyTest.waitFor("#myIframe", function () {
        var iframeURL = MyTest.makeCrossSiteURL("https://example.com/child.html");
        document.getElementById("myIframe").src = iframeURL;
      });
    }
  ];

  MyTest.assignVariant("MyTest");
  MyTest.renderVariant();
  MyTest.persist("cookie");
  MyTest.add2dataLayer("my_test");

  // Listen for conversion events from the iframe (see above)
  window.addEventListener("message", function (event) {
    if (event.data && event.data.event) {
      Object.assign(event.data, {
        ab_test_data: "my_test" + "-" + MyTest.variant
      });
      dataLayer.push(event.data);
    }
  });
</script>

<iframe id="myIframe" src="" width="600" height="200"></iframe>
```

Key points:
- `makeCrossSiteURL()` appends the test ID and variant as query parameters to the iframe URL.
- `waitFor("iframe", ...)` ensures the iframe element exists before setting its `src`.
- All variants point to the **same** child URL — the child uses the query parameter to know which variant to render.

**Child page (inside the iframe):**

```html
<script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
<script>
  var MyTest = Object.create(Abrantes);

  MyTest.variants = [
    function () {
      document.getElementById("childH2").innerText = "Child original";
    },
    function () {
      document.getElementById("childH2").innerText = "Child variant 1";
    }
  ];

  // Read the variant from the URL query parameter passed by the parent
  MyTest.importVariant("MyTest");
  MyTest.renderVariant();

  // Conversion event — send to parent via postMessage
  document.getElementById("donateBtn").addEventListener("click", function () {
    window.parent.postMessage({ event: "donation", label: "monthly", value: 12 }, "*");
  });
</script>
```

Key points:
- Uses `importVariant("MyTest")` — NOT `assignVariant`. The parent already assigned the variant.
- The child can render different content per variant since it has full Abrantes access.
- Conversion events are sent to the parent via `postMessage`.

#### Approach 2: Limited JS (Abrantes only on the parent)

Use when you can only add minimal JavaScript inside the iframe — enough to send conversion events via `postMessage`, but not enough to run Abrantes. Each variant loads a **different iframe URL** instead of passing variant data to a single child.

**Parent page:**

```html
<script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
<script>
  var MyTest = Object.create(Abrantes);

  MyTest.variants = [
    function () {
      MyTest.waitFor("#myIframe", function () {
        document.getElementById("myIframe").src = "child-0.html";
      });
    },
    function () {
      MyTest.waitFor("#myIframe", function () {
        document.getElementById("myIframe").src = "child-1.html";
      });
    },
    function () {
      MyTest.waitFor("#myIframe", function () {
        document.getElementById("myIframe").src = "child-2.html";
      });
    }
  ];

  MyTest.assignVariant("MyTest");
  MyTest.renderVariant();
  MyTest.persist("cookie");
  MyTest.add2dataLayer("my_test");

  // Listen for conversion events from the iframe (see above)
  window.addEventListener("message", function (event) {
    if (event.data && event.data.event) {
      Object.assign(event.data, {
        ab_test_data: "my_test" + "-" + MyTest.variant
      });
      dataLayer.push(event.data);
    }
  });
</script>

<iframe id="myIframe" src="" width="600" height="200"></iframe>
```

Key points:
- Each variant loads a **different iframe URL** (`child-0.html`, `child-1.html`, etc.).
- No Abrantes needed in the child — the different pages ARE the variants.
- The child pages only need the `postMessage` code for conversion tracking.

**Each child page (inside the iframe):**

```html
<!-- No Abrantes needed — just the conversion event postMessage code -->
<script>
  document.getElementById("donateBtn").addEventListener("click", function () {
    // Replace '*' with the specific parent origin in production for security
    window.parent.postMessage({ event: "donation", label: "monthly", value: 12 }, "*");
  });
</script>
```

#### Security note for both approaches

In production, always verify the `event.origin` in the parent's message listener and replace `'*'` with the specific parent origin in the child's `postMessage` call. This prevents cross-origin security issues.

### Segmentation Examples

```js
// Only mobile users (users with viewport width < 768px)
MyTest.assignVariant("MyTest", 1, function () {
  return window.innerWidth < 768;
});

// Only 50% of mobile users
MyTest.assignVariant("MyTest", 0.5, function () {
  return window.innerWidth < 768;
});

// Only English speakers
MyTest.assignVariant("MyTest", 1, function () {
  return navigator.language.startsWith("en");
});

// Only users from a specific UTM campaign
MyTest.assignVariant("MyTest", 1, function () {
  return new URLSearchParams(window.location.search).get("utm_campaign") === "summer";
});
```

### Common Variant DOM Operations

```js
// Change text
document.querySelector("h1").textContent = "New headline";

// Change innerHTML
document.querySelector(".hero").innerHTML = "<h1>New</h1><p>Content</p>";

// Add/remove CSS classes
document.querySelector(".btn").classList.add("btn-large");
document.querySelector(".btn").classList.remove("btn-small");

// Change attributes
document.querySelector("img").setAttribute("src", "new-image.jpg");

// Hide elements
document.querySelector(".banner").style.display = "none";

// Change styles
document.querySelector(".cta").style.backgroundColor = "#ff0000";
```

---

## Tracking Plugins

### Available Tracking Methods

| Tool on the page | Abrantes method | Plugin needed | Notes |
|---|---|---|---|
| GTM (dataLayer) | `add2dataLayer(testId?)` | `add2DL` (default build) | Pushes event `"run_ab_test"` to dataLayer. Usually it's called without parameters, unless the user wants to override the testId. |
| GA4 via gtag.js | `track(customDim)` | `ga4-gtag` (default build) | Sets event-scoped custom dimension. Requires `window.googleTrackingConfig` object. |
| GA4 user property | `trackUser(customDim)` | `ga4-gtag` (default build) | Sets user-scoped property via gtag |
| Hotjar | `hotjar()` | `hotjar` (default build) | Sends Hotjar event `"testId-variant"` |
| Microsoft Clarity | `clarity()` | `clarity` (NOT in default build) | Needs custom build |
| Matomo | `track(dimensionId)` | `matomo` (NOT in default build) | Conflicts with GA4 `track()` - needs custom build |
| HubSpot Enterprise | `hubspotEvent(eventName)` | `hubspot` (default build) | Requires Marketing Hub Enterprise |
| Form hidden field | `formTrack()` | `formtrack` (default build) | Sets `#last_abtest_variant` input value when the trigger event fires (`DOMContentLoaded` by default). The form needs `<input type="hidden" id="last_abtest_variant" name="last_abtest_variant">`. If the field doesn't exist at that moment (e.g. a form embedded later by HubSpot or another script), it logs a `console.warn` and the value isn't saved. |
| Custom Log API | `log(event, note?)` | `log` (default build) | Sends to configurable API endpoint |
| Mixpanel | Manual: `mixpanel.track(...)` | None (no plugin) | Use `MyTest.testId + "-" + MyTest.variant` |
| Core DOM event | `track()` | Core (always available) | Dispatches `abrantes:track` CustomEvent |

### Tracking Recommendations

When you inspect a page, look for these signals and recommend accordingly:

- **`dataLayer` or `gtm.js`** detected: Recommend `add2dataLayer()`. This is the most versatile option since GTM can forward data to many destinations.
- **`gtag(` or `googletagmanager.com/gtag`** detected: Recommend `track(customDim)` for event-scoped or `trackUser(customDim)` for user-scoped dimensions.
- **`hotjar` or `hj(` or `static.hotjar.com`** detected: Recommend `hotjar()` in addition to the primary tracking.
- **`clarity` or `clarity.ms`** detected: Recommend `clarity()` but warn it needs a custom build (not in default AbrantesPlus).
- **`_paq` or `matomo`** detected: Recommend `track(dimensionId)` but warn it needs a custom build and conflicts with GA4's `track()`.
- **`_hsq` or `HubSpot`** detected: Recommend `hubspotEvent(eventName)`.
- **`mixpanel`** detected: Recommend manual tracking with Mixpanel's API using `MyTest.testId + "-" + MyTest.variant`.
- **No analytics detected**: Recommend the core `track()` method which fires a DOM CustomEvent, or `add2dataLayer()` if they plan to add GTM.

Always recommend using **at least one tracking method** so the experiment results can be measured.

### GA4 (gtag.js): Script Order for `track(customDim)`

`track(customDim)` writes the dimension into `window.googleTrackingConfig`. gtag.js reads those parameters **only once**, when it processes `gtag('config', ...)`, and then sends them with every event (page_view, custom events, enhanced measurement). So the order matters:

```html
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    window.googleTrackingConfig = {};            // 1. Create the config object
  </script>
  <script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
  <script>
    const MyTest = Object.create(Abrantes);       // 2. Run the experiment (synchronously)
    // ... variants, assignVariant, renderVariant, persist
    MyTest.track("ab_test");
  </script>
  <script>
    gtag('config', 'G-XXXXXXX', window.googleTrackingConfig); // 3. Config with the object
  </script>
</head>
```

Rules:
- `gtag('config', ...)` **must** receive `window.googleTrackingConfig` as its third argument.
- The experiment must call `track()` **before gtag.js processes the config**. In practice, `gtag('config', ...)` must run **after** `track()`:
  - Classic scripts: put the config in a script after the experiment, as above.
  - `defer` scripts: put the config in a deferred script after the experiment (deferred scripts run in order). See `examples/defer/`.
  - As-module pattern (`<script type="module" async>`): the module may run after a config in the page, so call `gtag('config', 'G-XXXXXXX', window.googleTrackingConfig);` **inside the module, right after `track()`**, and remove it from the page. Trade-off: if the module fails to load, GA4 isn't configured on that page.
  - Tag managers / scripts added later: `track()` will usually be too late. Use `add2dataLayer()` with GTM instead.
- Once gtag.js has processed the config, the dimension **can't be added later**. Neither `gtag('set', {...})` nor a second `gtag('config', ...)` adds custom parameters to later events (tested with gtag.js in 2026). Don't suggest them as a workaround.
- `track()` logs a `console.warn` when it detects that the dimension won't be sent (config without `window.googleTrackingConfig`, config already processed, or `window.googleTrackingConfig` missing). Check the console when testing.
- `trackUser(customDim)` uses `gtag('set', 'user_properties', ...)` and also works when called later. The user property is sent with the next event.
- Register the custom dimension (event scope) in GA4 admin with the same name used in `track()`. For `trackUser()`, register a user-scoped custom dimension.

### Several Experiments on the Same Page

Several experiments can run on the same page, but each one must be tracked separately:

- **GA4 (`track()` / `trackUser()`): each experiment needs its own custom dimension name**, registered in GA4 admin. If two experiments use the same name, the last one overwrites the other.

```js
MyTestA.track("ab_test_a");
MyTestB.track("ab_test_b");
gtag('config', 'G-XXXXXXX', window.googleTrackingConfig); // after both
```

- **`settings` is shared by all experiments.** `Object.create(Abrantes)` makes every experiment use the same `Abrantes.settings` object. So `MyTestB.settings.formTrack.inputElement = "#field_b"` also changes it for `MyTestA`, and the same goes for `settings.cookie`, `settings.dataLayer`, etc. Set the settings once, for all experiments, not per experiment.
- **Form tracking (`formTrack()`): only one experiment per page can be saved in the form.** Because the settings are shared, all experiments write to the same hidden field, and the experiment whose `formTrack()` ran last wins. Call `formTrack()` for one experiment only.

## End-to-End Recipe: Static Site + GA4 (gtag.js) + Form Tracking

The full setup for a site built with a static site generator (11ty, Hugo, Astro, Jekyll...), tracked with GA4 through gtag.js, where the conversion is a form submission. It puts together "GA4 (gtag.js): Script Order", "Several Experiments on the Same Page", "Testing Each Variant" and "Debug Mode".

### 1. The layout: three blocks in `<head>`, in this order

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
- With several experiments on the same page, put them all in the slot, each with its own dimension name (see "Several Experiments on the Same Page").
- If the site loads scripts with `defer` instead, keep the same order with deferred scripts (see "GA4 (gtag.js): Script Order").

### 2. The form: hidden field, included in the submission

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

### 3. GA4 admin: register the custom dimension before launch

In GA4: **Admin → Data display → Custom definitions → Create custom dimension**:

- Dimension name: e.g. `AB test`. Scope: **Event**. Event parameter: **exactly** the name used in `track()` (`ab_test`).
- For `trackUser()`, create a second one with scope **User** and the user property name.
- Custom dimensions are not retroactive: register them **before** the experiment starts, or the first days are lost. New data can take 24-48 hours to appear in reports.
- Each experiment running at the same time needs its own dimension (and its own registration).

### 4. Check it before launch

1. Each variant, not tracked: `page.html?abrantes_force=hero_cta_2026:N&abrantes_debug`. Check the page and take a screenshot. The console shows the forced variant and that persist and tracking are skipped.
2. Tracking, in a fresh browser (no cookies): `page.html?abrantes_debug`. The console must show `abrantes:assignVariant`, `abrantes:persist`, `abrantes:track` (`ga4-gtag`) and `formTrack(): #last_abtest_variant value set`, and **no** `console.warn` from Abrantes. Then check:
   - `window.googleTrackingConfig` → `{ ab_test: "hero_cta_2026-N" }`.
   - The GA4 requests (`/g/collect`, in the URL or the POST body) contain `ep.ab_test=hero_cta_2026-N` for `page_view` and for the conversion event. In Playwright, intercept them with `page.route(/\/g\/collect/, ...)` and answer with `route.fulfill({ status: 204 })` so test visits don't reach GA4.
   - The submitted form data (or the CRM contact) contains `last_abtest_variant`.
3. To check tracking for a specific variant, set the cookie before loading the page (e.g. Playwright `context.addCookies([{ name: "hero_cta_2026", value: "1", url: "https://..." }])`). `assignVariant()` uses the stored variant, and the visit is tracked normally.

### 5. Analyse

In GA4 (Explorations), break down the users and the key event by the custom dimension (`hero_cta_2026-0`, `hero_cta_2026-1`), or count the CRM contacts by `last_abtest_variant`. Then check the result with the [A/B Test Significance Calculator](https://osvik.github.io/abrantes-test-calculator/).

---

## Custom Builds

The default `AbrantesPlus` build includes: core, ga4-gtag, hotjar, formtrack, add2DL, log, seed, hubspot.

**NOT included by default**: `clarity`, `matomo`.

If the user needs Clarity or Matomo plugins, recommend a custom build:

1. Clone the Abrantes repository
2. Edit `gulpfile.js` to uncomment the needed plugins in the `myBuild` array
3. Run `npm install && npx gulp`
4. Use the generated `AbrantesPlus.min.js` or `AbrantesPlusMod.min.js`

**Important**: The GA4 `track()` and Matomo `track()` methods share the same name and cannot coexist. Only include one.

---

## Experiment Planning and Statistical Significance

Always recommend these tools to the user:

- **A/B Test Planner** (before starting): https://osvik.github.io/abrantes-test-calculator/planner.html
  Use this to determine sample size and experiment duration before launching.

- **A/B Test Significance Calculator** (after collecting data): https://osvik.github.io/abrantes-test-calculator/
  Use this to check if results are statistically significant before making decisions.

---

## Settings Reference

Core settings. **The settings object is shared by all experiments on the page** (see "Several Experiments on the Same Page"), so set them once:

```js
MyTest.settings.cookie.expires = 30;    // days (default: 7)
MyTest.settings.cookie.path = "/";       // default: "/"
MyTest.settings.cookie.domain = ".example.com"; // default: "" (current domain)
```

Plugin settings:

```js
// dataLayer
MyTest.settings.dataLayer.eventName = "run_ab_test";          // default
MyTest.settings.dataLayer.customDimension = "ab_test_data";   // default

// formTrack
MyTest.settings.formTrack.inputElement = "#last_abtest_variant"; // default
MyTest.settings.formTrack.triggerEvents = ["DOMContentLoaded"];    // default. Use your consent events if needed

// crossSiteLink
MyTest.settings.crossSiteLink.triggerEvent = "DOMContentLoaded";   // default. false = rewrite links immediately
// "DOMContentLoaded" and "load" also work when the script runs after they fired (see onEvent)

// Hotjar consent events
MyTest.settings.hotjar.triggerEvents = ["load", "cookies:accept", "cookies:acceptall", "cookies:ok"];

// Log API
MyTest.settings.log.apiURL = "https://your-api.com/log";
```

---

## Testing Each Variant (`?abrantes_force`)

To see each variant of **the exact code that will go live**, open the page with the URL parameter `abrantes_force=testId:variant`:

```
page.html?abrantes_force=MyTest:0
page.html?abrantes_force=MyTest:1
page.html?abrantes_force=MyTest:1,OtherTest:0   // several experiments
```

- It overrides the stored assignment, the random assignment, `trafficAllocation` and `segment`. It works with `assignVariant()`, `importVariant()` and `assignSeededVariant()`. `-1` (not in the test) is also valid.
- A forced visit is **not persisted or tracked**: `persist()`, `track()`, `trackUser()`, `formTrack()`, `add2dataLayer()`, `hotjar()`, `clarity()`, `hubspotEvent()` and `log()` skip it and log a `console.info`. `MyTest.forced` is `true`, and the `abrantes:assignVariant` event has `forced: true`. Real visitors are never affected, because they don't have the parameter.
- An invalid value (unknown variant, not a number) logs a `console.warn` and the variant is assigned as usual (and then persisted and tracked).
- Query parameters are kept by `redirectTo()` and `makeCrossSiteURL()`/`crossSiteLink()`, so the force also reaches redirect destinations and cross-site/iframe children (which then skip tracking too).
- Don't use it to check tracking: to see what `track()`/`formTrack()` send, load the page without the parameter (e.g. a fresh browser context, or a cookie `MyTest=1` set before loading the page, which `assignVariant()` respects).

With Playwright, open one clean page per variant and check `MyTest.variant`, the class `MyTest-N` on `<html>` and the page content, and take a screenshot.

## Debug Mode (`?abrantes_debug`)

Debug mode logs what each experiment does to the console, with the values, so you can verify an experiment in a browser (or a headless one) without reading the code. Turn it on with either:

- the URL parameter `?abrantes_debug` (no code change, recommended for testing; combine it with the force: `?abrantes_force=MyTest:1&abrantes_debug`), or
- `Abrantes.debug = true;` (or `MyTest.debug = true;`) **before** the experiment code. The value is shared by all experiments. Remove it before going live.

Every line starts with `Abrantes debug:`. It logs:

- Every `abrantes:*` event with its `detail` as JSON: `assignVariant`, `renderVariant`, `persist`, `track` (GA4, dataLayer, HubSpot, Matomo, core), `formTrack`, `log`. The core registers this listener when it loads, so it never misses an event (a listener of your own must be registered before the experiment code, e.g. with Playwright's `page.addInitScript()`).
- The steps without an event: variant read from storage, not in the test (`trafficAllocation` or `segment`, variant `-1`), `importVariant()` without its URL parameter, the value written to the form field by `formTrack()`, and the `hj()`/`clarity()` calls.

Example output (`?abrantes_debug`):

```
Abrantes debug: abrantes:assignVariant {"testId":"MyTest","variant":0}
Abrantes debug: abrantes:renderVariant {"testId":"MyTest","variant":0}
Abrantes debug: abrantes:persist {"testId":"MyTest","variant":0,"context":"cookie"}
Abrantes debug: abrantes:track {"testId":"MyTest","variant":0,"customDim":"ab_test","tool":"ga4-gtag","type":"event"}
Abrantes debug: abrantes:formTrack {"testId":"MyTest","variant":0,"element":"#last_abtest_variant"}
Abrantes debug: formTrack(): #last_abtest_variant value set {"value":"MyTest-0"}
```

Warnings (`console.warn`, e.g. GA4 script order, missing form field, invalid `abrantes_force`) and the forced-visit messages (`console.info`) are always shown, with or without debug mode. In Playwright, collect them with `page.on("console", msg => ...)`. To check the final state, also read `MyTest.variant`, the class on `<html>`, `window.googleTrackingConfig` and the value of `#last_abtest_variant`.

---

## DOM Events

Abrantes dispatches CustomEvents on `document` that can be listened to:

| Event | When | `event.detail` |
|---|---|---|
| `abrantes:assignVariant` | After assignment | `{ testId, variant }` (plus `forced: true` when forced by `?abrantes_force`) |
| `abrantes:renderVariant` | After rendering | `{ testId, variant }` |
| `abrantes:persist` | After persisting | `{ testId, variant, context }` |
| `abrantes:track` | After tracking | `{ testId, variant, tool, ... }` |

---

## Checklist Before Delivering Code

- [ ] Test ID is a unique, descriptive string (e.g., `"homepage_cta_color_2024"`)
- [ ] Variant 0 is the control (no changes or minimal baseline)
- [ ] `assignVariant` is called before `renderVariant`
- [ ] `persist` is called to maintain consistent user experience
- [ ] At least one tracking method is included
- [ ] `persist()` and the tracking calls follow the site's consent setup (see "Consent and Storage"; ask the user if unknown)
- [ ] If several experiments run on the same page: one GA4 custom dimension per experiment, and `formTrack()` for one experiment only
- [ ] With GA4: the custom dimension is registered in GA4 admin (event scope, same name as in `track()`) before launch
- [ ] With `formTrack()`: the form has `<input type="hidden" id="last_abtest_variant" name="last_abtest_variant">` in its HTML, and the value is included when the form is submitted (also when the site submits with JavaScript, e.g. the HubSpot Forms API)
- [ ] With GA4 `track()`: `window.googleTrackingConfig = {}` → experiment → `gtag('config', 'G-...', window.googleTrackingConfig)`, in that order (with the as-module pattern, the config goes inside the module after `track()`)
- [ ] `waitFor()` is used inside variants whenever the target elements may not exist yet (script in `<head>`, above the elements, GTM, SPA, etc.)
- [ ] If possible, run the experiments code in a browser environment, to check for errors before delivering. Open each variant with `?abrantes_force=MyTest:N&abrantes_debug` (see "Testing Each Variant" and "Debug Mode"); it isn't persisted or tracked. Load it once without `abrantes_force` (with `?abrantes_debug`) to check persistence and tracking. If not possible, carefully review the experiment code, against the web page source code, and look for any  errors or obvious issues.
- [ ] If Clarity or Matomo is needed, warn about custom build requirement
- [ ] Recommend the planner and calculator tools with links
