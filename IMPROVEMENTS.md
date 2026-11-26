# Improvements for LLM use (static site + GA4 gtag + form tracking)

Context: Abrantes will be used by LLMs + skills to create A/B tests in microsites built with a static site generator, tracked with Google Analytics 4 (gtag) and the form tracking plugin.

Each change has a status and a space for comments. Statuses: `todo` · `accepted` · `rejected` · `done`.

Items in section A were found by reading the code. They have not yet been reproduced in a browser.

---

## A. Library fixes (traps an LLM can't see)

### 1. `renderVariant()` crashes when the script runs in `<head>`

- **Where:** `Abrantes.js` — `renderVariant()`, `document.getElementsByTagName("body")[0].classList.add(...)`
- **Problem:** In `<head>`, `<body>` doesn't exist yet, so this throws a TypeError. The head is the natural place for no-flicker CSS experiments on a static site.
- **Proposal:** Add the class `{testId}-{variant}` to `document.documentElement` (`<html>`). Also add it to `<body>` when it exists (for backward compatibility), or add it once the DOM is ready.
- **Docs:** Then recommend "script in `<head>` + CSS on `.MyTest-1 ...`" as the no-flicker pattern.
- **Status:** todo
- **Comments:**

### 2. `formTrack()` can miss `DOMContentLoaded`

- **Where:** `plugins/formtrack.js` — `formTrack()`, `settings.formTrack.triggerEvents`
- **Problem:** The default trigger is `DOMContentLoaded`. With the recommended `<script type="module" async>` pattern, the script can run after that event has already fired. The listener never fires and the hidden field stays empty, with no error.
- **Proposal:** If a trigger is `DOMContentLoaded` and `document.readyState !== "loading"`, call `setInput` right away.
- **Status:** todo
- **Comments:**

### 3. `crossSiteLink()` has the same `DOMContentLoaded` problem

- **Where:** `Abrantes.js` — `crossSiteLink()`, `settings.crossSiteLink.triggerEvent`
- **Problem / proposal:** Same as #2. Ideally use one shared helper for "run on event, or now if it already happened".
- **Status:** todo
- **Comments:**

### 4. GA4 `track()` depends on script order

- **Where:** `plugins/ga4-gtag.js` — `track(customDim)`
- **Problem:** `track()` only writes into `window.googleTrackingConfig`. That works only if the experiment runs **before** `gtag('config', 'G-XXX', window.googleTrackingConfig)`. If the template loads gtag first, the dimension is silently never sent. It also throws if `googleTrackingConfig` is missing.
- **Proposal (choose one):**
  - a) If `gtag` exists, also call `gtag('set', { [customDim]: value })`. This sends the value with every following event, whatever the order.
  - b) Keep the behavior, but warn on the console when the config looks like it has already been sent, and document the required order clearly in `SKILL.md`.
- **Status:** todo
- **Comments:**

### 5. `formTrack()` errors are invisible

- **Where:** `plugins/formtrack.js` — `setInput()`
- **Problem:** If `#last_abtest_variant` is missing, the code throws inside an event listener, where nobody notices.
- **Proposal:** Use a `console.warn` with a clear message: which selector is missing and what to add to the form.
- **Status:** todo
- **Comments:**

### 6. Several experiments on the same page overwrite each other

- **Where:** `plugins/ga4-gtag.js`, `plugins/formtrack.js`
- **Problem:** Several experiments share one GA4 dimension and one hidden field, so the last experiment wins.
- **Proposal (choose one):**
  - a) Document the rule "one experiment per page or flow".
  - b) Support several experiments, for example by appending values (`testA-1,testB-0`) or using one field per test.
- **Status:** todo
- **Comments:**

---

## B. Making experiments verifiable

### 7. Force a variant from the URL

- **Proposal:** A query parameter such as `?abrantes_force=MyTest:1` that overrides stored and random assignment. With it, an LLM (with Playwright) or a person can open and screenshot every variant.
- **Open questions:** Should a forced visit persist or be tracked? Probably neither: it shouldn't pollute the data.
- **Status:** todo
- **Comments:**

### 8. Debug mode

- **Proposal:** `Abrantes.debug = true` or `?abrantes_debug` logs assignment, render, persist, track and formTrack (with values) to the console. A headless browser can read these logs. The existing `abrantes:*` CustomEvents can drive this.
- **Status:** todo
- **Comments:**

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
- **Comments:**

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
- **Comments:**

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
