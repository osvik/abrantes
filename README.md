# Abrantes

Abrantes is a JavaScript browser library to create advanced AB tests in websites. It's also a Portuguese city.

## About

- Unlimited multivariate and page redirect tests that can run for as long as you want. Unlimited simultaneous tests for any number of users and page views.
- Complete control and integration with your analytics tool.
- As private as it can be. It doesn't share information with **new** third party companies.
- Open source.

## Planned features

- [ ] Tests run in multiple pages with different changes in each page.
- [ ] Works with adblockers.
- [ ] Stores data in GA4 and/or Plausible, but it can be modified to store data with any analytics tool that supports events. Multiple analytics tools.
- [ ] Trigger the test only for certain users, for example based on screen size, `utm` values in the URL...
- [ ] Start the test only after certain event, like the click of a button, arriving to a certain step in a form...
- [ ] Works with my GDPR cookie manager (and maybe others) and respect cookie preferences.
- [ ] Addresses the flash of content switching without blanking the page or taking too long. And that it works before cookie consent is given. Fast redirects without waiting for full page load.
- [ ] Pushes conversion data to forms that can send data to a marketing + crm tools (like for example Hubspot and Salesforce).
- [ ] Alternatively it can work with session cookies.
- [ ] Multiple tests in the same page.
- [ ] Lightweight. Doesn't add 80k of JavaScript just to do AB testing.
- [ ] Start tests with certain templates, url rules...
