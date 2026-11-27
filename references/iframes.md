# Iframe Experiments

Part of the Abrantes experiment builder skill. Read `SKILL.md` (in the repository root) first: it has the core pattern, the API, the tracking rules and the checklist.

**Load this file when:** the conversion (or part of the experiment content) happens inside an iframe.

Use iframe experiments when the conversion event (e.g. a form submission, a donation button) happens inside an iframe, or when part of the experiment content lives inside an iframe. There are two approaches depending on how much control you have over the iframe's JavaScript.

## Choosing the approach

| Scenario | Approach |
|---|---|
| You can add full JavaScript (including Abrantes) inside the iframe | **Full JS** — Abrantes runs on both parent and child, variant is passed via `makeCrossSiteURL` + `importVariant` |
| You can only add minimal JavaScript inside the iframe (e.g. just a conversion event) | **Limited JS** — Each variant loads a different iframe URL, child only sends `postMessage` for conversions |
| You cannot add any JavaScript to the iframe | Not suitable for iframe experiments — consider a redirect experiment instead |

## Common to both approaches: Tracking conversions from the iframe

In both approaches, the conversion event happens inside the iframe and must be communicated to the parent page (where the analytics tools live) using `window.postMessage`.

**Inside the iframe** — send a message to the parent when the conversion happens:

```js
document.getElementById("myButton").addEventListener("click", function () {
  var message = {
    event: "donation",   // the event name your analytics will use
    label: "monthly",    // any additional data
    value: 12
  };
  // Replace '*' with the specific parent origin in production for security
  window.parent.postMessage(message, "*");
});
```

**On the parent page** — listen for messages and push them to the dataLayer (or other tracking) with the experiment data attached:

```js
window.addEventListener("message", function (event) {
  // In production, always verify the origin:
  // if (event.origin !== 'https://trusted-domain.com') return;

  if (event.data && event.data.event) {
    Object.assign(event.data, {
      ab_test_data: "my_test" + "-" + MyTest.variant
    });
    dataLayer.push(event.data);
  }
});
```

This ensures conversion events from the iframe are tracked in the parent's analytics with the correct experiment variant attached.

## Approach 1: Full JS (Abrantes in both parent and child)

Use when you have full control over the iframe content and can load Abrantes inside it. The parent assigns the variant and passes it to the child iframe via URL query parameters. The child uses `importVariant` to read it.

**Parent page:**

```html
<script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
<script>
  var MyTest = Object.create(Abrantes);

  MyTest.variants = [
    function () {
      document.getElementById("bigH1").innerText = "Original heading";
      MyTest.waitFor("#myIframe", function () {
        var iframeURL = MyTest.makeCrossSiteURL("https://example.com/child.html");
        document.getElementById("myIframe").src = iframeURL;
      });
    },
    function () {
      document.getElementById("bigH1").innerText = "Variant 1 heading";
      MyTest.waitFor("#myIframe", function () {
        var iframeURL = MyTest.makeCrossSiteURL("https://example.com/child.html");
        document.getElementById("myIframe").src = iframeURL;
      });
    }
  ];

  MyTest.assignVariant("MyTest");
  MyTest.renderVariant();
  MyTest.persist("cookie");
  MyTest.add2dataLayer("my_test");

  // Listen for conversion events from the iframe (see above)
  window.addEventListener("message", function (event) {
    if (event.data && event.data.event) {
      Object.assign(event.data, {
        ab_test_data: "my_test" + "-" + MyTest.variant
      });
      dataLayer.push(event.data);
    }
  });
</script>

<iframe id="myIframe" src="" width="600" height="200"></iframe>
```

Key points:
- `makeCrossSiteURL()` appends the test ID and variant as query parameters to the iframe URL.
- `waitFor("iframe", ...)` ensures the iframe element exists before setting its `src`.
- All variants point to the **same** child URL — the child uses the query parameter to know which variant to render.

**Child page (inside the iframe):**

```html
<script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
<script>
  var MyTest = Object.create(Abrantes);

  MyTest.variants = [
    function () {
      document.getElementById("childH2").innerText = "Child original";
    },
    function () {
      document.getElementById("childH2").innerText = "Child variant 1";
    }
  ];

  // Read the variant from the URL query parameter passed by the parent
  MyTest.importVariant("MyTest");
  MyTest.renderVariant();

  // Conversion event — send to parent via postMessage
  document.getElementById("donateBtn").addEventListener("click", function () {
    window.parent.postMessage({ event: "donation", label: "monthly", value: 12 }, "*");
  });
</script>
```

Key points:
- Uses `importVariant("MyTest")` — NOT `assignVariant`. The parent already assigned the variant.
- The child can render different content per variant since it has full Abrantes access.
- Conversion events are sent to the parent via `postMessage`.

## Approach 2: Limited JS (Abrantes only on the parent)

Use when you can only add minimal JavaScript inside the iframe — enough to send conversion events via `postMessage`, but not enough to run Abrantes. Each variant loads a **different iframe URL** instead of passing variant data to a single child.

**Parent page:**

```html
<script src="https://cdn.jsdelivr.net/gh/osvik/abrantes@1.x.x/AbrantesPlus.min.js"></script>
<script>
  var MyTest = Object.create(Abrantes);

  MyTest.variants = [
    function () {
      MyTest.waitFor("#myIframe", function () {
        document.getElementById("myIframe").src = "child-0.html";
      });
    },
    function () {
      MyTest.waitFor("#myIframe", function () {
        document.getElementById("myIframe").src = "child-1.html";
      });
    },
    function () {
      MyTest.waitFor("#myIframe", function () {
        document.getElementById("myIframe").src = "child-2.html";
      });
    }
  ];

  MyTest.assignVariant("MyTest");
  MyTest.renderVariant();
  MyTest.persist("cookie");
  MyTest.add2dataLayer("my_test");

  // Listen for conversion events from the iframe (see above)
  window.addEventListener("message", function (event) {
    if (event.data && event.data.event) {
      Object.assign(event.data, {
        ab_test_data: "my_test" + "-" + MyTest.variant
      });
      dataLayer.push(event.data);
    }
  });
</script>

<iframe id="myIframe" src="" width="600" height="200"></iframe>
```

Key points:
- Each variant loads a **different iframe URL** (`child-0.html`, `child-1.html`, etc.).
- No Abrantes needed in the child — the different pages ARE the variants.
- The child pages only need the `postMessage` code for conversion tracking.

**Each child page (inside the iframe):**

```html
<!-- No Abrantes needed — just the conversion event postMessage code -->
<script>
  document.getElementById("donateBtn").addEventListener("click", function () {
    // Replace '*' with the specific parent origin in production for security
    window.parent.postMessage({ event: "donation", label: "monthly", value: 12 }, "*");
  });
</script>
```

## Security note for both approaches

In production, always verify the `event.origin` in the parent's message listener and replace `'*'` with the specific parent origin in the child's `postMessage` call. This prevents cross-origin security issues.
