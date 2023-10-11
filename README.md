# Abrantes

- [Abrantes](#abrantes)
    - [Analytics and reporting](#analytics-and-reporting)
      - [Google Analytics 4](#google-analytics-4)
      - [Hotjar or Microsoft Clarity](#hotjar-or-microsoft-clarity)
      - [CRM / Marketing app](#crm--marketing-app)
      - [Matomo and other](#matomo-and-other)
    - [Open source](#open-source)
    - [Privacy](#privacy)
    - [Complete control](#complete-control)
    - [What experiments can you do with with Abrantes?](#what-experiments-can-you-do-with-with-abrantes)
    - [Performance](#performance)
    - [Where to do your experiments](#where-to-do-your-experiments)
    - [Types of experiments](#types-of-experiments)
    - [Users to include in an experiment](#users-to-include-in-an-experiment)


Abrantes is a JavaScript browser library to **create advanced AB tests in websites and web apps**. It's also a Portuguese city.

With Abrantes webdevs can easily create unlimited tests with any number of users and page views.

My goal with Abrantes is to create a tool where I can create simple and complex experiments with complete control and to do it as quickly as possible. It’s also a rant against Google Optimise, which is a very limited and not very performant tool. I had many issues with GO even more after implementing GDPR compliant cookies.

**[Read the documentation in the wiki](https://github.com/osvik/abrantes/wiki)**

### Analytics and reporting

#### Google Analytics 4

Fully integrated with **Google Analytics 4**. All events are tagged with the experiment id and variant, so you can create reports to understand the user's behaviour and not just to measure which variant converts better.

You can also use **Looker Studio** for the analysis or to present the results.

With GA4 you can have 50 event scoped dimensions. That's **up to 50 simultaneous experiments in a single page**. You can also use user scoped dimensions for other experiments.

With GA4 and Looker studio you can create sophisticated visualisations of your experiment results.

#### Hotjar or Microsoft Clarity

You can filter recordings and heatmaps/scrollmaps by experiment and variant. This is very useful to observe differences between user behaviour in each variant.

#### CRM / Marketing app

For experiments where the conversion happens offline or latter, you can pass the experiment id and variant to a form.

#### Matomo and other

Abrantes works with Matomo. Unlike with GA4 it’s not tested in a real world situation but it should work. Like with GA4 it also works using custom dimensions. You should test it with visit dimensions and action dimensions.

In the future I might make it work with Mixpanel.

### Open source

With Abrantes you can:

1. Create a **plugin** to extend it to your use case, based on the tools you use.
2. Modify it for the needs of a **specific test** in your site.
3. Contribute to the core or official plugins.

Abrantes is open source and free to use for any purpose. GPL v3 License.

### Privacy

If you already use Google Analytics 4, you will not have to share user data with new third party companies.

### Complete control

It gives the developer complete control on how to run the experiments. For example:
- The test does not stop automatically and it doesn't start showing the original only.
- The same experiment can run in multiple pages with **different changes in each page**.
- Can work store the variant info for the duration of a session or indefinitely.
- You can **pause a test** and continue it latter.
- You can add or remove landing pages to an experiment during the experiment. (If you know what you are doing, as it can influence the results)
- You can have **more than a goal or no goal at all**. Sometimes it's interesting to see how an experiment affects the user experience in your website.
- While developing an experiment you can **run each variant simultaneously in a separate tab** or **run tabs for mobile phones simulatenously with tabs for desktops**. This way faster, specially for complex experiments. It also allows you to easily record videos explaining the experiment to your colleagues.

### What experiments can you do with with Abrantes?

- **Content** - You can experiment with any content you want in a web pages. It can be a simple text, image or video replacement or something more sophisticated like changing the information that you get from an API call.
- **Design** - You can do simple design tests or use media queries to test variants that change differently in specific screen sizes or devices with a mouse/trackpad. And basically test anything that can be done in CSS, including animations.
- **Interactivity** - Here it depends a lot on the libraries and frameworks you use on your website. In most cases you can overwrite existing html and javascript for the variant, remove or add event listeners... In some specific cases you may need to rewrite the original, but everything should be testable with Abrantes.

### Performance

Used properly, **the flash of switching content is unnoticeable**. It does not blank the page while loading. The user experience while loading the page is the same for the original and the other variants.

**Lightweight**. Unlike other testing tools it doesn't load 80K or more of JavaScript on page load. Abrantes weights 1.3K minified. It can be gziped and cached.

### Where to do your experiments 

- Pages
- Sections
- Templates
- Components in random pages
- The entire site
- Cross-site

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
