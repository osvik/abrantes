# Abrantes Plugins

This folder contains the source code for the official Abrantes plugins.
These plugins integrate Abrantes with various analytics tools and services.

**Usage:** You can load these individual files after loading the core `Abrantes.js` script, but it's better to use `AbrantesPlus.js` which already includes some of them bundled together. Ideally you should build your own version with the plugins you need.

## Analytics & Tracking
* [add2DL.js](add2DL.js) - Adds `add2dataLayer(customDimension)` to push experiment data to the **Google Tag Manager** `dataLayer` object. This data can be used with any analytics software that supports custom events and custom dimensions.
* [ga4-gtag.js](ga4-gtag.js) - Adds `track(custom_dimension_event)` and `trackUser(custom_dimension_user)` methods to track experiments in **Google Analytics 4** using the `gtag` library.
* [matomo.js](matomo.js) - Adds `track(dimensionId)` to save the experiment variant into a **Matomo** (formerly Piwik) custom dimension.
* [clarity.js](clarity.js) - Adds the `clarity()` method to send experiment data to **Microsoft Clarity** recordings and heatmaps.
* [hotjar.js](hotjar.js) - Adds the `hotjar()` method to launch Hotjar events.

## Utilities
* [formtrack.js](formtrack.js) - Adds `formTrack()` to automatically fill a hidden form input field with the assigned variant value. Useful for passing experiment data to CRMs or backend systems.
* [log.js](log.js) - Adds the `log(event, note)` method to send custom experiment events to an external API endpoint (configured via `settings.log.apiURL`). This API is also free and open source.
