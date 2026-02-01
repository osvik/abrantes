# Abrantes Examples

This folder contains various examples demonstrating how to use the Abrantes library, its plugins, and common implementation patterns.

## Core Concepts
*   [design-experiment-1.html](design-experiment-1.html) - A simple CSS-based experiment. Abrantes applies different classes to the body tag that can be used to experiment with different designs.
*   [segment.html](segment.html) - Demonstrates how to segment the experiment to specific users (e.g., by language or screen size).
*   [defer.html](defer/defer.html) - Shows how to load Abrantes with the `defer` attribute.
*   [as-module.html](as-module.html) - Example of using Abrantes as an ES6 module.
*   [example-functions.js](example-functions.js) - A collection of example JavaScript functions for common DOM manipulations (changing text, images, classes) to use in your variants.

## Integrations & Plugins
*   [gtm-ga4.html](gtm-ga4.html) - Integration with Google Tag Manager and Google Analytics 4 (GA4).
*   [add2DL.html](add2DL.html) - pushing experiment data to the `dataLayer` for GTM or other tools.
*   [hotjar.html](hotjar.html) - Integration with Hotjar to label recordings or heatmaps based on variants.
*   [clarity.html](clarity.html) - Integration with Microsoft Clarity.
*   [matomo.html](matomo.html) - Integration with Matomo (formerly Piwik) analytics.
*   [mixpanel.html](mixpanel.html) - Integration with Mixpanel analytics. (Example without GTM)
*   [formtrack.html](formtrack.html) - How to save the assigned variant into a hidden form input (useful for CRM tracking).
*   [seed.html](seed.html) - Assign variants accordingly to a seed, instead of randomly.
*   [log.html](log.html) - Sending experiment events to a free/open source custom logging API.

## Advanced Patterns
*   [waitFor.html](waitFor.html) - Implementation of a wait function to apply changes only when dynamic elements appear in the DOM. Important for SPAs.
*   [landing.html](cross-site/landing.html) - "Origin" page example for cross-site experiments (exports the variant).
*   [step-2.html](cross-site/step-2.html) - "Destination" page example for cross-site experiments (imports the variant from the origin).
*   [redirect/](redirect/) - Folder containing examples of redirect tests (sending users to different URLs).
*   [alpine/](alpine/) - Examples of integrating Abrantes with Alpine.js.
*   [iframes full/](iframes-full-js/) - Doing experiments with iframes when you can put any JavaScript in the iframe.
*   [iframes limited/](iframes-limited/) - Experiments with iframes when the JavaScript you can put in the iframe is limited to run a script after the conversion.
*   [dev.html](dev.html) - A generic development template used for testing various features.
