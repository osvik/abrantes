# Abrantes Examples

This folder contains various examples demonstrating how to use the Abrantes library, its plugins, and common implementation patterns.

## Core Concepts

*   [design-experiment-1.html](design-experiment-1.html) - A simple CSS-based experiment. Abrantes applies different classes to the body tag that can be used to experiment with different designs.
*   [example-functions.js](example-functions.js) - A collection of example JavaScript functions for common DOM manipulations (changing text, images, classes) to use in your variants.
*   [waitFor.html](waitFor.html) - Implementation of a wait function to apply changes only when dynamic elements appear in the DOM. Important for SPAs.
*   [segment.html](segment.html) - Demonstrates how to segment the experiment to specific users (e.g., by language or screen size).
*   [segments.js](segments.js) - List of example of segments.
*   [as-module.html](as-module.html) - Example of using Abrantes as an ES6 module.
*   [defer.html](defer/defer.html) - Shows how to load Abrantes with the `defer` attribute.

## Integrations & Plugins

*   [add2DL.html](add2DL.html) - pushing experiment data to the `dataLayer` for Google Tag Manager or other tools.
*   [gtm-ga4.html](gtm-ga4.html) - Integration with Google Analytics 4 (GA4).
*   [hotjar.html](hotjar.html) - Integration with Hotjar to label recordings or heatmaps based on variants.
*   [mixpanel.html](mixpanel.html) - Integration with Mixpanel analytics. (Example without GTM)
*   [clarity.html](clarity.html) - Integration with Microsoft Clarity.
*   [matomo.html](matomo.html) - Integration with Matomo (formerly Piwik) analytics.

## Advanced Patterns

*   [dev.html](dev.html) - A generic development template used for testing various features.
*   [formtrack.html](formtrack.html) - How to save the assigned variant into a hidden form input (useful for CRM tracking).
*   [landing.html](cross-site/landing.html) - "Origin" page example for cross-site experiments (exports the variant).
*   [step-2.html](cross-site/step-2.html) - "Destination" page example for cross-site experiments (imports the variant from the origin).
*   [redirect/](redirect/) - Folder containing examples of redirect tests (sending users to different URLs).
*   [iframes full/](iframes-full-js/) - Doing experiments with iframes when you can put any JavaScript in the iframe.
*   [iframes limited/](iframes-limited/) - Experiments with iframes when the JavaScript you can put in the iframe is limited to run a script after the conversion.
*   [log.html](log.html) - Sending experiment events to a free/open source custom logging API.
*   [seed.html](seed.html) - Assign variants accordingly to a seed, instead of randomly.
*   [exclude-variants-for-new-users.html](exclude-variants-for-new-users.html) - Abandon variants in the middle of an experiment without afecting the experience of users that previously entered the experiment.
*   [alpine/](alpine/) - Examples of integrating Abrantes with Alpine.js.
*   [run-in-gtm](run-in-gtm/) - Run Abrantes inside Google Tag Manager.
*   [listen2DL.html](listen2DL.html) - Start an experiment when a certain dataLayer event happens.

