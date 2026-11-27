# Google Tag Manager (GTM) Experiments

Part of the Abrantes experiment builder skill. Read `SKILL.md` (in the repository root) first: it has the core pattern, the API, the tracking rules and the checklist.

**Load this file when:** the user specifically asks to run the experiment from GTM. Don't use this pattern otherwise.

## GTM pattern

```html
<!-- Inside a GTM Custom HTML tag -->
<script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
<script>
  var MyTest = Object.create(Abrantes);
  MyTest.variants = [
    function () {
      // Use waitFor since DOM may not be ready when GTM fires
      MyTest.waitFor("h1", function () {
        const el = document.querySelector("h1");
        el.textContent = "New headline";
      });
    },
    function () {
      MyTest.waitFor("h1", function () {
        const el = document.querySelector("h1");
        el.textContent = "Another headline";
      });
    }
  ];
  MyTest.assignVariant("MyTest");
  MyTest.renderVariant();
  MyTest.persist("cookie");
  MyTest.add2dataLayer();
</script>
```

## Important GTM notes

- Always use `waitFor()` inside variant functions when running from GTM, since the DOM may not be ready.
- Performance may be lower compared to direct script inclusion.
- The GTM tag should fire on the relevant page(s) using a GTM trigger.
- Use `add2dataLayer()` to send experiment data back to GTM for analytics. It pushes the event `"run_ab_test"` with `ab_test_data: "{testId}-{variant}"`, `experiment_name` and `variant_name` (names configurable in `settings.dataLayer` in the "Settings Reference" of `SKILL.md`). Usually it's called without parameters, unless the user wants to override the testId.
- GA4 `track()` usually runs too late from a tag manager (after `gtag('config')`), so the dimension isn't sent. Use `add2dataLayer()` instead.
- With Google Consent Mode, the push only adds data to the `dataLayer`; the GA4 tags in the container apply Consent Mode.
