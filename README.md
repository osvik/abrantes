# Abrantes

Abrantes is a JavaScript browser library to **create advanced AB tests in websites and web apps**. It's also a Portuguese city.

With Abrantes webdevs can easily create unlimited tests with any number of users and page views.

### Analytics

Fully integrated with **Google Analytics 4**. All events are tagged with the experiment id and variant, so you can create reports to understand the user's behaviour and not just to measure conversions.

You can also use **Looker Studio** for the analysis or to present the results.

With GA4 you can have 50 event scoped dimensions and 25 user dimensions. That's **up to 75 simultaneous tests in a single website**. 

You can delete dimensions after the tests and create others for new tests (but you'll loose the experiments data). 

### Open source

You can modify it for your general use or **for a specific test**. Abrantes is open source and easily modifiable. GPL v3 License.

### Privacy

If you already use Google Analytics 4, you will not have to share user data with new third party companies.

### Complete control

It gives the developer complete control on how to run the experiments. For example:
- The test does not stop automatically and it doesn't start showing the original only.
- The same experiment can run in multiple pages with **different changes in each page**.
- Can work store the variant info for the duration of a session or indefinitely.
- You can **pause a test** and continue it latter.
- You can have **more than a goal or no goal at all**. Sometimes it's interesting to see how an experiment affects the user experience in your website.

### What to test with Abrantes

- Content
- Design
- Interactivity

### Performance

Used properly, **the flash of switching content is unnoticeable**. It does not blank the page while loading. The user experience while loading the page is the same for the original and the other variants.

**Lightweight**. Unlike other testing tools it doesn't load 80K or more of JavaScript on page load. Abrantes weights 2K minified. It can be gziped and cached.

### Where to do your experiments 

- Pages
- Sections
- Templates
- Components in random pages
- The entire site

### Types of experiments

- AB/n in one or more pages
- Multivariate in one or more pages
- Page redirects (one url)
- Redirect rules (many urls)

### Users to include in an experiment

You can segment users and **only launch experiments to users that meet specific criteria**:

- A specific action, like for example start filling a form, a specific step in the form, click of a button or scroll.
- Device width rules
- URLs with specific UTMs (users from specific traffic sources)
- Certain cookie values that store information about previous actions elsewhere in the website.
- Users that visit the website in a specific hour of the day, or days of the week.
- In some websites, you can run tests only for logged in users.
