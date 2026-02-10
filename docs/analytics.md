# Analytics integrations

Abrantes focuses on running experiments (assigning variants, rendering changes, and persisting the assignment). Reporting is usually better handled by the analytics tools you already use across your site: you get existing dashboards, funnels, segmentation, retention, attribution, and data governance without building a separate reporting system.

This page explains *why* and *how* to integrate Abrantes with analytics, and links to the official docs for each supported tool:

- Google Tag Manager (GTM)
- Google Analytics (GA4)
- Mixpanel
- Hotjar
- HubSpot (Marketing Hub Enterprise)
- Microsoft Clarity
- Matomo

## Why integrate AB testing + analytics

Integrating your experiment engine with your analytics stack lets you:

- Compare outcomes by variant using the same conversion events you already trust (signups, purchases, leads, etc.).
- Segment results by audience (device, geography, acquisition channel, logged-in status, etc.).
- Validate experiment health (sample ratio mismatch, unexpected drops, tracking regressions).
- Keep one source of truth for “business events” instead of duplicating event definitions in two places.
- Combine quantitative and qualitative data (events + funnels + heatmaps/recordings).

## Use the tools you already run site-wide

When possible, integrate Abrantes with the analytics tools already used throughout your site:

- Consistent event taxonomy and naming.
- Works with existing consent management and tag governance.
- Keeps long-term reporting in one place (no split “experiment reports” vs “site reports”).
- Makes comparisons easier (experiment traffic vs non-experiment traffic, historical baselines, etc.).

## Types of analytics to pair with experiments

Different analytics tools answer different questions; it is common to use more than one:

- Classic event tracking (quantitative): page views, clicks, form submits, purchases, signups.
  - Examples: GA4, Mixpanel, Matomo (and GTM as the routing layer).
- Heatmaps (qualitative): where users click/scroll and what they ignore.
  - Examples: Hotjar, Microsoft Clarity.
- Tagged session/video recording (qualitative): watch sessions for specific variants to understand *why* metrics change.
  - Examples: Hotjar, Microsoft Clarity.

## How Abrantes sends experiment data

Abrantes assigns a `testId` and a numeric `variant` to the user. Integrations typically send a value like:

- `MyTest-0` (control), `MyTest-1`, `MyTest-2`, ...

There are three common patterns (you can mix them):

1. Exposure event (event-scoped): send a single “experiment exposure” event when the user is assigned.
2. Custom dimension / event parameter: attach the experiment+variant value as a parameter on your business events.
3. User labeling (user-scoped): set a user property/trait once so subsequent events can be broken down by variant.

### dataLayer (GTM-style)

The `add2DL` plugin pushes an object into `dataLayer` (defaults shown):

- `event`: `run_ab_test`
- `ab_test_data`: `{experiment}-{variant}` (ex: `PricingTest-1`)
- `experiment_name`: `{experiment}` (ex: `PricingTest`)
- `variant_name`: `{variantPrefix}{variant}` (ex: `v1`)

These keys are configurable via `Abrantes.settings.dataLayer`.

### Custom integrations (`abrantes:track`)

Several plugins dispatch a browser event you can listen to if you need a custom bridge:

- DOM event name: `abrantes:track`
- `event.detail` includes `testId`, `variant`, and some tool-specific metadata

This is useful if you want to forward the same “experiment exposure” to another analytics SDK (or to standardize naming) without modifying Abrantes core.

## Tool setup (official docs)

The examples in `examples/` cover adding the tracking scripts and calling the relevant Abrantes plugin methods. The notes below focus on what to configure *inside each analytics tool* so you can actually analyze variants.

Related Abrantes docs in this repo:

- Plugin reference: [plugins.html](plugins.html)
- Settings reference (default key names): [settings.html](settings.html)
- Examples index: [examples.html](examples.html)

### Google Tag Manager (GTM)

What you can do:

- Capture experiment exposure from `dataLayer` and route it to any tag (GA4, Mixpanel, Hotjar/Clarity, etc.).
- Store experiment + variant as variables, and attach them to your existing conversion events.

Official docs:

- GTM overview: https://support.google.com/tagmanager/answer/6102821
- `dataLayer` (developer docs): https://developers.google.com/tag-platform/tag-manager/web/datalayer
- Data Layer variables: https://support.google.com/tagmanager/answer/6164391
- Triggers (including Custom Event): https://support.google.com/tagmanager/answer/7679219

### Google Analytics (GA4)

What you can do:

- Register an event-scoped custom dimension for the experiment exposure value (ex: `ab_test_data`).
- Optionally register a user-scoped custom dimension (user property) if you label users by variant.
- Build comparisons in Explorations, funnels, and segments using the dimension/property.

Official docs:

- GA4 (gtag.js) developer guide: https://developers.google.com/analytics/devguides/collection/ga4/gtagjs
- Create custom dimensions/metrics (GA4): https://support.google.com/analytics/answer/10075209
- gtag.js reference (`set`, `event`, user properties): https://developers.google.com/tag-platform/gtagjs/reference

### Mixpanel

What you can do:

- Track an “experiment exposure” event with an `ab_test_data` property.
- Attach the same property to conversion events for clean attribution.
- Optionally set a user profile property so you can segment any future events by variant.

Official docs:

- JavaScript SDK: https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript
- Identifying users: https://docs.mixpanel.com/docs/tracking-methods/identifying-users
- User profiles: https://docs.mixpanel.com/docs/data-structure/user-profiles

### Hotjar

What you can do:

- Send a Hotjar Event per variant (ex: `PricingTest-1`).
- Filter Recordings and Heatmaps by that event to compare behavior across variants.

Official docs:

- Hotjar Help Center (search for “Events API” and “Recordings filters”): https://help.hotjar.com/hc/en-us

### HubSpot (Marketing Hub Enterprise)

What you can do:

- Send custom behavioral events that include experiment + variant properties.
- Build reports / lists / workflows based on those events and properties (depending on your HubSpot setup).

Official docs:

- HubSpot Knowledge Base (search for “custom behavioral events”): https://knowledge.hubspot.com/
- HubSpot developer docs: https://developers.hubspot.com/docs

### Microsoft Clarity

What you can do:

- Set a custom Clarity variable/tag for experiment and variant.
- Filter sessions/recordings by those tags to compare qualitative behavior.

Official docs:

- Microsoft Clarity documentation: https://learn.microsoft.com/en-us/clarity/

### Matomo

What you can do:

- Create a Custom Dimension for “experiment exposure” and set it to `MyTest-1` (or similar).
- Use segments and reports based on that dimension to compare conversions and behavior by variant.

Official docs:

- Matomo Custom Dimensions: https://matomo.org/docs/custom-dimensions/
- JavaScript Tracking (reference/guide): https://matomo.org/docs/javascript-tracking/
