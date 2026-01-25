# Abrantes Examples

This folder contains various examples demonstrating how to use the Abrantes library, its plugins, and common implementation patterns.

**Note:** Most examples expect to find the Abrantes library at `../AbrantesPlus.js`. If you move these files, make sure to update the script `src` path.

## Core Concepts
*   [design-experiment-1.html](design-experiment-1.html) - A simple CSS-based experiment where variants apply different classes to the body.
*   [segment.html](segment.html) - Demonstrates how to use the `segment` function to limit the experiment to specific users (e.g., by language).
*   [defer.html](defer.html) - Shows how to load Abrantes with the `defer` attribute.
*   [as-module.html](as-module.html) - Example of using Abrantes as an ES6 module (`type="module"`).
*   [defer/](defer/) - A folder containing more complex examples of deferred loading.
*   [example-functions.js](example-functions.js) - A collection of reusable JavaScript functions for common DOM manipulations (changing text, images, classes) to use in your variants.

## Integrations & Plugins
*   [gtm-ga4.html](gtm-ga4.html) - Integration with Google Tag Manager and Google Analytics 4 (GA4).
*   [add2DL.html](add2DL.html) - pushing experiment data to the `dataLayer` for GTM or other tools.
*   [hotjar.html](hotjar.html) - Integration with Hotjar to trigger recordings or heatmaps based on variants.
*   [clarity.html](clarity.html) - Integration with Microsoft Clarity.
*   [matomo.html](matomo.html) - Integration with Matomo (formerly Piwik) analytics.
*   [mixpanel.html](mixpanel.html) - Integration with Mixpanel analytics.
*   [formtrack.html](formtrack.html) - How to save the assigned variant into a hidden form input (useful for CRM tracking).
*   [log.html](log.html) - Sending experiment events to a custom logging API.

## Advanced Patterns
*   [waitFor.html](waitFor.html) - **Important for SPAs.** Implementation of a wait function to apply changes only when dynamic elements appear in the DOM.
*   [export.html](export.html) - "Origin" page example for cross-site experiments (exports the variant).
*   [import.html](import.html) - "Destination" page example for cross-site experiments (imports the variant from the origin).
*   [redirect/](redirect/) - Folder containing examples of redirect tests (sending users to different URLs).
*   [alpine/](alpine/) - Examples of integrating Abrantes with Alpine.js.
*   [dev.html](dev.html) - A generic development template used for testing various features.
