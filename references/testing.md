# Testing and Debugging Experiments

Part of the Abrantes experiment builder skill. Read `SKILL.md` (in the repository root) first: it has the core pattern, the API, the tracking rules and the checklist.

**Load this file when:** you check an experiment in a browser (or Playwright) before delivering it, or the user asks how to test variants, check tracking or listen to Abrantes events.

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
