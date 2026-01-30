# Iframe full JavaScript

In this example we see how to make an experiment with Abrantes when you have don't have restrictions on the JavaScript you can put inside the iframe. In this case we can run Abrantes both in the parent and child.

* [parent.html](parent.html) - The experiment variants are managed from here. The parent passes the choosen variant to the iframe using `makeCrossSiteURL` and the child iframe reads the url using `importVariant`.
