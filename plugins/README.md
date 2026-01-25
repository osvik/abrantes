# Abrantes Plugins

This folder contains the source code for the official Abrantes plugins.
These plugins integrate Abrantes with various analytics tools and services.

**Usage:** You can load these individual files after loading the core `Abrantes.js` script, or simply use `AbrantesPlus.js` which already includes all of them bundled together.

## Analytics & Tracking
*   [ga4-gtag.js](ga4-gtag.js) - Adds `track(eventName)` and `trackUser(userPropertyName)` methods to track experiments in **Google Analytics 4** using the `gtag` library.
*   [add2DL.js](add2DL.js) - Adds `add2dataLayer(customDimension)` to push experiment data to the **Google Tag Manager** `dataLayer` object.
*   [matomo.js](matomo.js) - Adds `track(dimensionId)` to save the experiment variant into a **Matomo** (formerly Piwik) custom dimension.
*   [mixpanel.js](mixpanel.js) - Adds `mixpanel(propertyName)` to register the variant as a super property in **Mixpanel**.
*   [clarity.js](clarity.js) - Adds the `clarity()` method to send experiment data to **Microsoft Clarity** recordings and heatmaps.
*   [hotjar.js](hotjar.js) - Adds the `hotjar()` method to trigger **Hotjar** events based on the assigned variant.

## Utilities
*   [formtrack.js](formtrack.js) - Adds `formTrack()` to automatically fill a hidden form input field with the assigned variant value. Useful for passing experiment data to CRMs or backend systems.
*   [log.js](log.js) - Adds the `log(event, note)` method to send custom experiment events to an external API endpoint (configured via `settings.log.apiURL`).
