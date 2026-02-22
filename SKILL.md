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
3. **Write the experiment code**: Use the patterns and API reference below.
4. **Recommend tracking**: Based on what tools are detected on the page.
5. **Recommend planning tools**: Always suggest the [planner](https://osvik.github.io/abrantes-test-calculator/planner.html) and [calculator](https://osvik.github.io/abrantes-test-calculator/).

---

## Abrantes API Reference

### Loading Abrantes

**CDN (preferred when Abrantes is not already on the page):**

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
   - The user doesn't mention GTM

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
   - The user wants to use `defer` for performance
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
| `renderVariant()` | Execute the assigned variant function. Adds CSS class `{testId}-{variant}` to `<body>`. |
| `persist(context?)` | Save assignment. Context: `"cookie"` (default, 7 days), `"user"` or `"local"` (localStorage), `"session"` (sessionStorage). |
| `waitFor(selector, callback)` | Wait for a DOM element using MutationObserver. **You MUST use this whenever the target element may not exist yet** — see "When to use `waitFor`" below. |
| `redirectTo(url)` | Redirect preserving query params and hash. Use inside variant functions for redirect tests. |
| `crossSiteLink(selector)` | Rewrite links to pass experiment data cross-site. Use with `importVariant` on destination. |
| `importVariant(testId)` | Read variant from URL query params (for cross-site experiments). |
| `makeCrossSiteURL(url)` | Generate a URL with experiment params appended. |

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

### CSS-Only Experiments

Variants can be empty functions. `renderVariant()` adds class `{testId}-{variant}` to `<body>`, enabling pure CSS experiments:

```css
.MyDesignExp-1 h1 { font-size: 2.5rem; }
.MyDesignExp-2 h1 { font-size: 1.7rem; }
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

  // Render (applies the body class, useful for CSS-based adjustments)
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
| GTM (dataLayer) | `add2dataLayer(customDim?)` | `add2DL` (default build) | Pushes event `"run_ab_test"` to dataLayer |
| GA4 via gtag.js | `track(customDim)` | `ga4-gtag` (default build) | Sets event-scoped custom dimension. Requires `window.googleTrackingConfig` object. |
| GA4 user property | `trackUser(customDim)` | `ga4-gtag` (default build) | Sets user-scoped property via gtag |
| Hotjar | `hotjar()` | `hotjar` (default build) | Sends Hotjar event `"testId-variant"` |
| Microsoft Clarity | `clarity()` | `clarity` (NOT in default build) | Needs custom build |
| Matomo | `track(dimensionId)` | `matomo` (NOT in default build) | Conflicts with GA4 `track()` - needs custom build |
| HubSpot Enterprise | `hubspotEvent(eventName)` | `hubspot` (default build) | Requires Marketing Hub Enterprise |
| Form hidden field | `formTrack()` | `formtrack` (default build) | Sets `#last_abtest_variant` input value |
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

Core settings (can be customized per experiment):

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

// Hotjar consent events
MyTest.settings.hotjar.triggerEvents = ["load", "cookies:accept", "cookies:acceptall", "cookies:ok"];

// Log API
MyTest.settings.log.apiURL = "https://your-api.com/log";
```

---

## DOM Events

Abrantes dispatches CustomEvents on `document` that can be listened to:

| Event | When | `event.detail` |
|---|---|---|
| `abrantes:assignVariant` | After assignment | `{ testId, variant }` |
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
- [ ] `waitFor()` is used inside variants whenever the target elements may not exist yet (script in `<head>`, above the elements, GTM, SPA, etc.)
- [ ] If possible, run the experiments code in a browser environment, to check for errors before delivering. You can use the `renderVariant` method to test each variant in isolation. If not possible, carefully review the experiment code, against the web page source code, and look for any  errors or obvious issues.
- [ ] If Clarity or Matomo is needed, warn about custom build requirement
- [ ] Recommend the planner and calculator tools with links
