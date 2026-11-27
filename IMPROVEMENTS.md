# Improvements for LLM use (static site + GA4 gtag + form tracking)

Context: Abrantes will be used by LLMs + skills to create A/B tests in microsites built with a static site generator, tracked with Google Analytics 4 (gtag) and the form tracking plugin.

Each change has a status and a space for comments. Statuses: `todo` · `accepted` · `rejected` · `done`.

Items in section A were found by reading the code. They have not yet been reproduced in a browser.

---

## A. Library fixes (traps an LLM can't see)

### 1. `renderVariant()` crashes when the script runs in `<head>`

- **Where:** `Abrantes.js` — `renderVariant()`, `document.getElementsByTagName("body")[0].classList.add(...)`
- **Problem:** In `<head>`, `<body>` doesn't exist yet, so this throws a TypeError. The head is the natural place for no-flicker CSS experiments on a static site.
- **Proposal:** Add the class `{testId}-{variant}` to `document.documentElement` (`<html>`) instead of (`<body>`)
- **Docs:**
- **Status:** done
- **Comments:** Selectors like `.MyTest-1 h1` work with either element, because they only need an ancestor with the class. So nothing existing breaks, and code in `<head>` stops crashing.

### 2. `formTrack()` can miss `DOMContentLoaded`

- **Where:** `plugins/formtrack.js` — `formTrack()`, `settings.formTrack.triggerEvents`
- **Problem:** The default trigger is `DOMContentLoaded`. With the recommended `<script type="module" async>` pattern, the script can run after that event has already fired. The listener never fires and the hidden field stays empty, with no error.
- **Proposal:** If a trigger is `DOMContentLoaded` and `document.readyState !== "loading"`, call `setInput` right away.
- **Status:** done
- **Comments:** Fix without breaking other use cases.
- **Reply (Claude):** Done. `formTrack()` now registers its trigger events with the shared core helper `Abrantes.onEvent()` (added in #3). When the trigger is `DOMContentLoaded` and `document.readyState` isn't `"loading"` (or `load` and `readyState` is `"complete"`), `setInput` is scheduled with `setTimeout(..., 0)` instead of adding a listener. Other cases don't change: scripts that run while the page is loading still use the listener, and custom consent events (e.g. `cookiesAccepted`) are always listeners. I used `setTimeout` instead of a direct call so a missing input still throws asynchronously, as it did before, and doesn't stop the code after `formTrack()` (e.g. `track()`). #5 will replace that throw with a `console.warn`. Tested in Chromium (Playwright) against the old and new code: with a late `async` script (classic or module), the old code left the field empty and the new code fills it. Scripts in `<head>`, at the end of `<body>`, deferred modules and custom consent events behave the same as before. The built files (`AbrantesPlus*.js`) haven't been rebuilt yet.

### 3. `crossSiteLink()` has the same `DOMContentLoaded` problem

- **Where:** `Abrantes.js` — `crossSiteLink()`, `settings.crossSiteLink.triggerEvent`
- **Problem / proposal:** Same as #2. Ideally use one shared helper for "run on event, or now if it already happened".
- **Status:** done
- **Comments:** Fix if it doesn't break backward compatibility.
- **Reply (Claude):** Done. New core helper `Abrantes.onEvent(eventName, callback)`: if the event is `DOMContentLoaded` (and `readyState !== "loading"`) or `load` (and `readyState === "complete"`) and has already happened, it runs the callback with `setTimeout(..., 0)`. Otherwise it adds a window listener, as before. `crossSiteLink()` and `formTrack()` (#2) both use it now. `triggerEvent: false` still rewrites the links synchronously, and custom events are always listeners. Tested in Chromium (Playwright) against the old and new code. Late `async` scripts and scripts added after `load` (e.g. by a tag manager) now rewrite the links and fill the form field, with both the default triggers and `"load"`; before, they did neither. Every other case gave the same result as before. One visible difference: a relative `href` (which `makeCrossSiteURL()` can't parse) used to fail silently in late scripts, because the listener never ran. Now it shows an error in the console, but the code after `crossSiteLink()` still runs. Since `formTrack.js` now uses `onEvent()`, the plugin needs this version of the core. The built files haven't been rebuilt yet.

### 4. GA4 `track()` depends on script order

- **Where:** `plugins/ga4-gtag.js` — `track(customDim)`
- **Problem:** `track()` only writes into `window.googleTrackingConfig`. That works only if the experiment runs **before** `gtag('config', 'G-XXX', window.googleTrackingConfig)`. If the template loads gtag first, the dimension is silently never sent. It also throws if `googleTrackingConfig` is missing.
- **Proposal (choose one):**
  - a) If `gtag` exists, also call `gtag('set', { [customDim]: value })`. This sends the value with every following event, whatever the order.
  - b) Keep the behavior, but warn on the console when the config looks like it has already been sent, and document the required order clearly in `SKILL.md`.
- **Status:** done (option b)
- **Comments:** The `gtag('set'` pattern needs to be tested very well. In the past I've found many situations when it didn't behave as expected.
- **Reply (Claude):** Tested with the real gtag.js (Chromium + Playwright, `G-50HRM8825D`, every `/g/collect` request intercepted so nothing reached GA). Checked events: page_view, custom events (with and without their own params), generate_lead, and enhanced measurement (form_start, scroll, file_download, outbound click).
  - **Option (a) doesn't work.** `gtag('set', {ab_test: ...})` drops custom parameters from **every** event, whether it's called before config, right after it or later. `set` only works for built-in fields (e.g. `page_title`). The `('set', name, value)` form and an `ep.` prefix don't work either. A second `gtag('config', id, {...})` is ignored completely (no params, no second page_view). This likely explains the problems you had in the past.
  - **What works:** the current approach, as long as `track()` runs before gtag.js processes the config. Because `track()` changes `window.googleTrackingConfig` itself, it still works if `gtag('config', id, window.googleTrackingConfig)` was already called but gtag.js hasn't loaded yet. Once gtag.js has processed the config, the dimension can't be added.
  - **Implemented (b):** `track()` now logs a `console.warn` when the dimension won't be sent: (1) a `gtag('config', 'G-…')` in `dataLayer` doesn't use `window.googleTrackingConfig`; (2) gtag.js has already processed it (`window.google_tag_manager['G-…']` exists); (3) `window.googleTrackingConfig` is missing. Before, (3) threw an error, which stopped the code after `track()`. Now it warns and returns. Verified in the browser: no warning in the cases that work, the right warning in each case that doesn't.
  - `trackUser()` (`gtag('set', 'user_properties', ...)`) does work when called late: the property is sent with the next event.
  - **Docs:** new "GA4 (gtag.js): Script Order" section in `SKILL.md` (order, rules per loading pattern, no `gtag('set')` workaround, GA4 admin registration), a checklist item, and a note in `llms.txt`. Important: the as-module pattern with `gtag('config')` in the page loses the dimension when the module loads after gtag.js (tested). The docs now say to call `gtag('config', ...)` inside the module, right after `track()` (tested: works).

### 5. `formTrack()` errors are invisible

- **Where:** `plugins/formtrack.js` — `setInput()`
- **Problem:** If `#last_abtest_variant` is missing, the code throws inside an event listener, where nobody notices.
- **Proposal:** Use a `console.warn` with a clear message: which selector is missing and what to add to the form.
- **Status:** done
- **Comments:** Go ahead
- **Reply (Claude):** Done. `setInput()` no longer throws. It logs a `console.warn` and returns. The message names the selector and the value that wasn't saved, and says what to add. For an id selector it shows the exact tag, e.g. `<input type="hidden" id="last_abtest_variant" name="last_abtest_variant">`, and mentions that the `name` is needed for the value to be submitted. For other selectors it shows a generic hint. It also suggests `settings.formTrack.inputElement` as the alternative. Tested in Chromium (Playwright): no warning when the field exists, in `<head>` and in late async scripts. When it's missing (default, custom id and complex selectors), the right warning appears, there's no exception, and the code after `formTrack()` runs. `SKILL.md` and `llms.txt` now mention the required hidden field and the warning, including the case of forms embedded later by another script (e.g. HubSpot), where the field doesn't exist yet when the trigger event fires.

### 6. Several experiments on the same page overwrite each other

- **Where:** `plugins/ga4-gtag.js`, `plugins/formtrack.js`
- **Problem:** Several experiments share one GA4 dimension and one hidden field, so the last experiment wins.
- **Proposal (choose one):**
  - a) Document the rule "one experiment per page or flow".
  - b) Support several experiments, for example by appending values (`testA-1,testB-0`) or using one field per test.
- **Status:** done (documented)
- **Comments:** It supports more than one experiment but it needs more than one custom dimension in GA4. Maintain the current behaviour and document it. Keep the behavior and document it. The docs will say: each experiment running at the same time needs its own GA4 custom dimension name, e.g. `MyTestA.track("ab_test_a")` and `MyTestB.track("ab_test_b")`, each registered in GA4 admin.

  One related trap to document as well: `settings` is **shared** between all experiments. `Object.create(Abrantes)` makes every experiment point to the same `Abrantes.settings` object, so `MyTestB.settings.formTrack.inputElement = "#field_b"` also changes it for `MyTestA`. `formTrack()` reads the setting when its trigger event fires, so both experiments end up writing to the last selector set. The same applies to `settings.cookie`. That means:
  - With form tracking, two experiments on the same page can't use separate hidden fields today. Only one of them gets recorded in the form.
  - `SKILL.md` currently says core settings "can be customized per experiment". That's misleading and should be corrected.

  If you want, a later item could give each experiment its own copy of `settings`. Otherwise, documenting it is enough.
- **Reply (Claude):** Documented, no library change. `SKILL.md` has a new section, "Several Experiments on the Same Page": one GA4 custom dimension per experiment (with an example), `settings` shared by all experiments, and `formTrack()` for one experiment per page. There's also a checklist item, and the Settings Reference no longer says settings "can be customized per experiment". `llms.txt` has the same rule under Important Rules. Verified: two experiments share the same `settings` object (Node). With the real gtag.js and two dimensions (`ab_test`, `ab_test_b`), every event (page_view, custom, generate_lead, enhanced measurement) carries both values. With two `formTrack()` calls, the field keeps only the last one (Chromium + Playwright).

---

## B. Making experiments verifiable

### 7. Force a variant from the URL

- **Proposal:** A query parameter such as `?abrantes_force=MyTest:1` that overrides stored and random assignment. With it, an LLM (with Playwright) or a person can open and screenshot every variant.
- **Open questions:** Should a forced visit persist or be tracked? Probably neither: it shouldn't pollute the data.
- **Status:** todo
- **Comments:** Isn't this alreay implemented by Abrantes.importVariant? It doesn't matter much if it's persisted. As for being tracked, the `Abrantes.track` method should only be added after each variant was carefully tested.
- **Reply (Claude):** Partly. `importVariant()` reads `?MyTest=N`, but only on pages whose code calls `importVariant()` instead of `assignVariant()`, i.e. redirect destinations and cross-site/iframe children. A normal in-page experiment calls `assignVariant()`, which ignores the URL and uses (1) the stored assignment or (2) a random one. So today, to see variant 1 of a normal experiment you have to either:
  - clear the cookie/storage and reload until you get it at random, or
  - temporarily edit the code to `importVariant()`, which means you're no longer testing the code that goes live, or
  - call `MyTest.renderVariant(1)` in the console. That runs on top of the variant already rendered, so it isn't a clean view.

  The point of #7 is to test **the exact code that will go live**, each variant in a clean page load, for example with Playwright opening `page.html?abrantes_force=MyTest:1`.

  Agreed on persistence (it doesn't matter) and on tracking (add it only after testing). That makes this simpler: no special tracking logic is needed.

  A lighter alternative with no new parameter: document a QA recipe instead. Set the stored value before loading the page (e.g. cookie `MyTest=1`, which `assignVariant()` already respects through `readPersistent()`), then load the page. Playwright can do this with `context.addCookies(...)`. This needs **no library change**, so I'd suggest it as the first option and keep the URL parameter only if the recipe proves awkward.

### 8. Debug mode

- **Proposal:** `Abrantes.debug = true` or `?abrantes_debug` logs assignment, render, persist, track and formTrack (with values) to the console. A headless browser can read these logs. The existing `abrantes:*` CustomEvents can drive this.
- **Status:** todo
- **Comments:** The the `Abrantes.track` method is what tracks if an experiment is tracked or not. Isn't it enough to remove or add the `Abrantes.track` method during testing?
- **Reply (Claude):** My proposal was unclear. Debug mode wasn't about turning tracking on or off. It was about **seeing** what happened (which variant was assigned, whether it rendered, what was persisted, what value went to GA4 and to the form field) so an LLM can verify the experiment by itself.

  You're right that a new library feature isn't needed: the existing `abrantes:*` CustomEvents already provide this. So I suggest **dropping the library change** and documenting, in `SKILL.md`, how to verify an experiment:
  - A small listener that logs every `abrantes:*` event. It must be registered **before** the experiment code runs, because the events fire synchronously. In Playwright, use `page.addInitScript(...)`.
  - After load, check the state directly: `MyTest.variant`, the class on `<html>`/`<body>`, `window.googleTrackingConfig`, and the value of `#last_abtest_variant`.

  Together with #7, this lets the skill check every variant without changing the library. (The Checker Extension already covers this for people.)

### 9. Test suite

- **Problem:** There are no tests (`npm test` just exits with an error).
- **Proposal:** Add Playwright or jsdom tests for the core methods, the GA4 and formtrack plugins, and regressions #1–#5. This lets an LLM change the library safely.
- **Status:** todo
- **Comments:**

---

## C. Documentation for LLMs

### 10. End-to-end recipe: static site + GA4 gtag + form tracking

- **Where:** `SKILL.md` (and `docs/llms.txt`)
- **Content:**
  - Script order: `window.googleTrackingConfig = {}` → experiment → `gtag('config', ...)` (until #4 is fixed).
  - GA4 admin step: register the event-scoped custom dimension (and user property, if `trackUser` is used). Without it, no data shows up.
  - Hidden `<input type="hidden" id="last_abtest_variant">` in the form, included in the submission payload (e.g. HubSpot Forms API, mapped to a contact property).
  - The rule for several experiments (see #6).
- **Status:** todo
- **Comments:**

### 11. Consent / GDPR guidance

- **Problem:** `persist("cookie")` sets the assignment cookie before consent.
- **Proposal:** Document the options: `persist("session")`, persisting only after consent, or treating the cookie as functional. Explain how this works with Google Consent Mode.
- **Status:** todo
- **Comments:** We'll leave it to the skill as this may work differently with different consent management systems.
- **Reply (Claude):** Agreed. Consent stays in the microsite skill. The only thing I'd keep here is one neutral sentence in `SKILL.md`: `persist()` writes a cookie or `localStorage`/`sessionStorage` entry when it is called, so the site's consent setup decides where and when it can be called. That way an LLM using only this repo's docs knows there's a decision to make, without the library taking a position on it.

### 12. Split `SKILL.md` into a core file plus references

- **Problem:** At 674 lines, most of `SKILL.md` covers GTM, iframes, Matomo, Clarity and Hotjar, which most agents don't need.
- **Proposal:** A short core `SKILL.md` (API, core pattern, checklist), plus `references/redirect.md`, `references/iframes.md`, `references/gtm.md`, `references/tracking-tools.md` and so on, loaded only when needed.
- **Status:** todo
- **Comments:**

### 13. Exact versions instead of `@1.x.x`

- **Where:** `SKILL.md`, `docs/llms.txt`, docs pages
- **Problem:** LLMs copy the `1.x.x` placeholder literally.
- **Proposal:** Use the real version (`@1.7.0`), and update it as part of the release process.
- **Status:** todo
- **Comments:** I need clarification on this.
- **Reply (Claude):** I checked, and I was wrong about the main point. jsDelivr treats `@1.x.x` as a valid version range, not a placeholder: `https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js` returns 200 and serves version 1.7.0 (the same as `@1` and `@1.7.0`). So the current URLs work, and an LLM copying them literally gets a working script.

  What's left is a choice, not a bug:
  - `@1.x.x` (range): sites get bug fixes automatically, but also any behavior change in a 1.x release (e.g. the fixes in section A), without anyone testing the site again.
  - `@1.7.0` (exact): the site keeps running exactly what was tested. Upgrades are deliberate (see #15).

  For microsites built by an LLM and tested before going live, I'd recommend the exact version for production, and keeping `@1.x.x` in the docs as the "always latest 1.x" option. One sentence in `SKILL.md` explaining the difference is enough. If you prefer to keep the range everywhere, this item can be closed.

### 14. Self-hosted / npm installation for static site generators

- **Proposal:** Document copying `AbrantesPlus.min.js` into the site's assets, or installing from npm (publish it if it isn't published yet). This gives a pinned version and no third-party request, which suits static site generators better than a CDN.
- **Status:** todo
- **Comments:**

### 15. `CHANGELOG.md` with upgrade notes

- **Proposal:** List the changes for each version, with explicit upgrade steps, so a skill can update sites from one version to the next.
- **Status:** todo
- **Comments:**

### 16. Type definitions

- **Proposal:** An `Abrantes.d.ts` file (or more complete JSDoc) describing the core methods, plugin methods and settings, so editors and LLMs can see the whole API at a glance.
- **Status:** todo
- **Comments:**

---

## D. For the microsite skill (outside this repo, for reference)

### 17. Standard place for experiments in the static site generator

- A Nunjucks partial plus front matter (e.g. `experiment: hero_cta_2026`), so the LLM never has to guess where the code goes.
- **Comments:**

### 18. Experiment spec template

- Hypothesis, primary metric (form conversion), variants, test ID convention, sample size from the planner, start and end date.
- **Comments:**

### 19. Experiment lifecycle in the skill

- Plan → build → QA each forced variant (#7) → launch → analyse with the calculator → **clean up** (hard-code the winner and remove the experiment code).
- **Comments:**

---

## Suggested order

1. #1, #2, #4, #5 (with #9 tests covering them)
2. #7, #8
3. #10, #13, #6
4. The rest
