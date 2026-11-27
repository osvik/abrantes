# Google Consent Mode V2

Part of the Abrantes experiment builder skill. Read `SKILL.md` (in the repository root) first: it has the core pattern, the API, the tracking rules and the checklist.

**Load this file when:** the site uses Google Consent Mode (`gtag('consent', ...)`), or the user asks about consent with GA4.

Abrantes works with Google Consent Mode V2. Nothing changes in the experiment code. Only the order of the GA4 snippet matters: the consent defaults go first, before the experiment and before `gtag('config')`.

```html
<head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXX"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('consent', 'default', {                  // 1. Consent defaults
      ad_storage: 'denied',
      analytics_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
    gtag('set', 'ads_data_redaction', true);
    // A returning visitor's saved choice: gtag('consent', 'update', {...}) here, before the config
    gtag('js', new Date());
    window.googleTrackingConfig = {};
  </script>
  <script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
  <script>
    // 2. The experiment, as usual: assignVariant, renderVariant, persist, track("ab_test")...
  </script>
  <script>
    gtag('config', 'G-XXXXXXX', window.googleTrackingConfig); // 3. Config, always last
  </script>
</head>
```

What happens (tested with gtag.js in Chromium, November 2026):

- **Consent denied:** gtag.js sets no `_ga` cookies and sends cookieless pings (`gcs=G100`). They still include the experiment: `ep.ab_test` from `track()` and `up.ab_test_user` from `trackUser()`.
- **Visitor accepts on the same page** (`gtag('consent', 'update', {...granted})`): the next events (`gcs=G111`, e.g. the conversion event) still include `ep.ab_test`. Don't call `track()` or `gtag('config')` again.
- **Consent already granted** (saved choice applied with `gtag('consent', 'update')` before the config): everything is sent normally.
- `ads_data_redaction` only affects ad data. It doesn't change what Abrantes sends.
- With **basic** Consent Mode (the Google tag is only loaded after consent), the usual rule still applies: `track()` must run before `gtag('config')`.
- With **Google Tag Manager**, use `add2dataLayer()`. The push only adds data to the `dataLayer`; the GA4 tags in the container apply Consent Mode.

Keep in mind:

- **Consent Mode only controls Google tags.** It doesn't block the cookie or storage entry that `persist()` writes, or the other tools (`hotjar()`, `clarity()`, `hubspotEvent()`, `log()`). Those follow the site's consent setup (see "Consent and Storage" in `SKILL.md`).
- **Analysis:** GA4 uses the denied-consent pings for modelling, so the GA4 reports for each variant mainly show visitors who accepted analytics cookies. If a variant can change whether visitors accept (e.g. it changes the cookie banner or the content around it), the GA4 samples of the variants aren't comparable. A conversion saved in the CRM with `formTrack()` doesn't depend on Google consent.
