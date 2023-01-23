# Abrantes

Abrantes is a JavaScript browser library to create advanced AB tests in websites. It's also a Portuguese city.

## With Abrantes you can

- Create unlimited multivariate and page redirect tests that can run for as long as you want. Have unlimited simultaneous tests for any number of users and page views.
- Have complete control and integration with your analytics tool.
- Use a tool that is as private as it can be. It doesn't share information with **new** third party companies.
- Modify it. Abrantes is open source and it's a proof of concept that I may use to fit my needs.

## Features and planned features

- [ ] More documentation and examples.
- [x] Tests run in multiple pages with different changes in each page.
- [x] Multiple tests in the same page.
- [x] Addresses the flash of content switching without blanking the page or taking too long. And that it works before cookie consent is given. Fast redirects without waiting for full page load.
- [x] Lightweight. Doesn't add 80k of JavaScript just to do AB testing. Currently the minified version has 1KB.
- [x] Works with adblockers.
- [x] You can use it to start tests with certain templates, url rules...
- [x] You can use GA4, Plausible or any analytics tool that supports events. You can also use multiple analytics tools simultaneously.
- [x] Trigger the test only for certain users, for example based on their screen size, `utm` values in the URL...
- [x] Start the test only after certain event, like the click of a button, arriving to a certain step in a form. With this feature you can avoid meaningless tests.
- [x] Works with my GDPR cookie manager (and maybe others) and respect cookie preferences. Abrantes will not persist data until you tell him to.
- [ ] Pushes conversion data to forms that can send data to a marketing + crm tools (like for example Hubspot and Salesforce).
- [ ] Alternatively it can work with session cookies.
