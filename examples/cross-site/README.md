# Cross site experiments

When you need to make an experiment with a landing page in one domain and the next page in another domain. This example passes the experiment variant between domains.

* [landing.html](landing.html)
* [step-2.html](step-2.html)

As with experiments with redirects, cross site experiments also have some risk of someone linking directly to step-2.html. Because not all traffic has the same engagement if this happens there's no randomness in assigning the variant.
