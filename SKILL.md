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
3. **Load the references you need** (see the table below). Only load the ones that apply to this experiment.
4. **Write the experiment code**: Use the patterns and API reference below. For a static site with GA4 (gtag.js) and a form, follow the recipe in `references/static-site-ga4-form.md`.
5. **Recommend tracking**: Based on what tools are detected on the page.
6. **Go through the checklist** at the end of this file.
7. **Recommend planning tools**: Always suggest the [planner](https://osvik.github.io/abrantes-test-calculator/planner.html) and [calculator](https://osvik.github.io/abrantes-test-calculator/).

### Reference files

This file has the core pattern, the API, the tracking rules and the checklist. The rest is in the `references/` folder, next to this file. Load a reference only when it applies:

| Load | When |
|---|---|
| [`references/static-site-ga4-form.md`](references/static-site-ga4-form.md) | Static site (11ty, Hugo, Astro, Jekyll...) + GA4 (gtag.js) + form conversion. The full end-to-end recipe: layout, form, GA4 admin, checks before launch, analysis. |
| [`references/testing.md`](references/testing.md) | Checking an experiment in a browser or Playwright: forcing variants (`?abrantes_force`), debug mode (`?abrantes_debug`), DOM events. |
| [`references/consent-mode.md`](references/consent-mode.md) | The site uses Google Consent Mode V2 (`gtag('consent', ...)`). |
| [`references/redirect.md`](references/redirect.md) | Redirect experiments: each variant is a separate page. |
| [`references/iframes.md`](references/iframes.md) | The conversion or part of the experiment is inside an iframe. |
| [`references/gtm.md`](references/gtm.md) | The user asks to run the experiment from Google Tag Manager. |
| [`references/tracking-tools.md`](references/tracking-tools.md) | Hotjar, Microsoft Clarity, Matomo, HubSpot, Mixpanel, the Log API, or a custom build. |

If you read this file from a URL instead of a local copy, the references are at `https://raw.githubusercontent.com/osvik/abrantes/refs/heads/main/references/<name>.md`.

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

3. **Other patterns** (load the reference first):
   - **GTM**: only when the user specifically asks for Google Tag Manager. See [`references/gtm.md`](references/gtm.md).
   - **Redirect**: the changes are too complex for DOM manipulation (new layout, redesign), so each variant is a separate page. See [`references/redirect.md`](references/redirect.md).
   - **Iframe**: the conversion or part of the experiment content is inside an iframe. See [`references/iframes.md`](references/iframes.md).

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
| `?abrantes_force=MyTest:1` (URL) | Not a method: forces a variant for testing. See [`references/testing.md`](references/testing.md). |
| `Abrantes.debug = true` or `?abrantes_debug` (URL) | Debug mode: logs every step to the console. See [`references/testing.md`](references/testing.md). |
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

If the site uses Google Consent Mode V2, see [`references/consent-mode.md`](references/consent-mode.md): the experiment code doesn't change, only the order of the GA4 snippet.

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

For Hotjar, Clarity, Matomo, HubSpot, Mixpanel, the Log API and custom builds, load [`references/tracking-tools.md`](references/tracking-tools.md).

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

---

## Settings Reference

**The settings object is shared by all experiments on the page** (see "Several Experiments on the Same Page"), so set them once:

```js
// Cookie used by persist("cookie")
MyTest.settings.cookie.expires = 30;    // days (default: 7)
MyTest.settings.cookie.path = "/";       // default: "/"
MyTest.settings.cookie.domain = ".example.com"; // default: "" (current domain)

// dataLayer
MyTest.settings.dataLayer.eventName = "run_ab_test";          // default
MyTest.settings.dataLayer.customDimension = "ab_test_data";   // default

// formTrack
MyTest.settings.formTrack.inputElement = "#last_abtest_variant"; // default
MyTest.settings.formTrack.triggerEvents = ["DOMContentLoaded"];    // default. Use your consent events if needed

// crossSiteLink
MyTest.settings.crossSiteLink.triggerEvent = "DOMContentLoaded";   // default. false = rewrite links immediately
// "DOMContentLoaded" and "load" also work when the script runs after they fired (see onEvent)
```

Settings for Hotjar, Clarity, HubSpot and the Log API are in [`references/tracking-tools.md`](references/tracking-tools.md).

---

## Testing (summary)

Details, Playwright tips and example output in [`references/testing.md`](references/testing.md).

- **See each variant** of the exact code that will go live: `page.html?abrantes_force=MyTest:1` (several: `MyTest:1,OtherTest:0`). A forced visit is **not persisted or tracked**, so never use it to check tracking.
- **Debug mode**: add `abrantes_debug` to the URL (e.g. `?abrantes_force=MyTest:1&abrantes_debug`) to log every step to the console as `Abrantes debug: ...`. `console.warn` messages from Abrantes are always shown.
- **Check tracking**: load the page **without** `abrantes_force` (with `?abrantes_debug`), in a fresh browser or with a cookie `MyTest=1` set before loading the page.

---

## Experiment Planning and Statistical Significance

Always recommend these tools to the user:

- **A/B Test Planner** (before starting): https://osvik.github.io/abrantes-test-calculator/planner.html
  Use this to determine sample size and experiment duration before launching.

- **A/B Test Significance Calculator** (after collecting data): https://osvik.github.io/abrantes-test-calculator/
  Use this to check if results are statistically significant before making decisions.

---
## Checklist Before Delivering Code

- [ ] Test ID is a unique, descriptive string (e.g., `"homepage_cta_color_2024"`)
- [ ] Variant 0 is the control (no changes or minimal baseline)
- [ ] `assignVariant` is called before `renderVariant`
- [ ] `persist` is called to maintain consistent user experience
- [ ] At least one tracking method is included
- [ ] `persist()` and the tracking calls follow the site's consent setup (see "Consent and Storage"; ask the user if unknown)
- [ ] With a redirect or iframe experiment: the code for every page is provided (see `references/redirect.md` / `references/iframes.md`)
- [ ] If several experiments run on the same page: one GA4 custom dimension per experiment, and `formTrack()` for one experiment only
- [ ] With GA4: the custom dimension is registered in GA4 admin (event scope, same name as in `track()`) before launch
- [ ] With `formTrack()`: the form has `<input type="hidden" id="last_abtest_variant" name="last_abtest_variant">` in its HTML, and the value is included when the form is submitted (also when the site submits with JavaScript, e.g. the HubSpot Forms API)
- [ ] With GA4 `track()`: `window.googleTrackingConfig = {}` → experiment → `gtag('config', 'G-...', window.googleTrackingConfig)`, in that order (with the as-module pattern, the config goes inside the module after `track()`)
- [ ] With Google Consent Mode: `gtag('consent', 'default', {...})` (and the update with a saved choice) runs before `gtag('config')`; the experiment code doesn't change (see `references/consent-mode.md`)
- [ ] `waitFor()` is used inside variants whenever the target elements may not exist yet (script in `<head>`, above the elements, GTM, SPA, etc.)
- [ ] If possible, run the experiments code in a browser environment, to check for errors before delivering. Open each variant with `?abrantes_force=MyTest:N&abrantes_debug` (see `references/testing.md`); it isn't persisted or tracked. Load it once without `abrantes_force` (with `?abrantes_debug`) to check persistence and tracking. If not possible, carefully review the experiment code, against the web page source code, and look for any  errors or obvious issues.
- [ ] If Clarity or Matomo is needed, warn about custom build requirement (see `references/tracking-tools.md`)
- [ ] Recommend the planner and calculator tools with links
