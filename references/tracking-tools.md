# Other Tracking Tools and Custom Builds

Part of the Abrantes experiment builder skill. Read `SKILL.md` (in the repository root) first: it has the core pattern, the API, the tracking rules and the checklist.

**Load this file when:** the page uses Hotjar, Microsoft Clarity, Matomo, HubSpot, Mixpanel or the Abrantes Log API, or the user needs a custom build.

## Hotjar

- Method: `hotjar()` (plugin `hotjar`, in the default build). Sends the Hotjar event `"testId-variant"`.
- When Hotjar isn't loaded yet, it waits for the events in `settings.hotjar.triggerEvents`. These can be set to the consent events of the site:

```js
MyTest.settings.hotjar.triggerEvents = ["load", "cookies:accept", "cookies:acceptall", "cookies:ok"]; // default
```

- Recommend it in addition to the primary tracking (GA4, GTM...).

## Microsoft Clarity

- Method: `clarity()` (plugin `clarity`, **NOT in the default build**: needs a custom build, see below).
- It runs on the events in `settings.clarity.triggerEvents` (same default as Hotjar). These can be set to the consent events of the site.

## Matomo

- Method: `track(dimensionId)` (plugin `matomo`, **NOT in the default build**: needs a custom build, see below).
- **The GA4 `track()` and Matomo `track()` methods share the same name and cannot coexist.** Only include one in the build.

## HubSpot

- Method: `hubspotEvent(eventName)` (plugin `hubspot`, in the default build). Requires Marketing Hub Enterprise.
- Pushes a custom event to `_hsq` with the properties `ab_test_data` (`{testId}-{variant}`), `experiment_name` and `variant_name`. The property names are in `settings.hubspot` (`customDimension`, `experimentName`, `variantName`, `variantPrefix`).
- To save the variant with a HubSpot form submission instead, use `formTrack()` (see the "End-to-End Recipe" in `references/static-site-ga4-form.md`).

## Mixpanel

No plugin. Track manually with Mixpanel's API (`mixpanel.track(...)`), using `MyTest.testId + "-" + MyTest.variant` as the value.

## Custom Log API

- Method: `log(event, note?)` (plugin `log`, in the default build). Sends a request to the [Abrantes Log API](https://github.com/osvik/abrantes-log-api) itself (unlike the other methods, which hand the value to a tool on the page).
- The endpoint must be set, or `log()` throws:

```js
MyTest.settings.log.apiURL = "https://your-api.com/log";
```

## Custom Builds

The default `AbrantesPlus` build includes: core, ga4-gtag, hotjar, formtrack, add2DL, log, seed, hubspot.

**NOT included by default**: `clarity`, `matomo`.

If the user needs Clarity or Matomo plugins, recommend a custom build:

1. Clone the Abrantes repository
2. Edit `gulpfile.js` to uncomment the needed plugins in the `myBuild` array
3. Run `npm install && npx gulp`
4. Use the generated `AbrantesPlus.min.js` or `AbrantesPlusMod.min.js`

**Important**: The GA4 `track()` and Matomo `track()` methods share the same name and cannot coexist. Only include one.
