/**
 * Array of example variant functions to be used in A/B testing.
 * Each function modifies the DOM in a specific way.
 * h1 is just an example, in a real scenario more specific selectors should be used
 */

// eslint-disable-next-line no-unused-vars
var variants = [

    /*
     * Change the text of the first h1 tag to "MyTest Variant 1"
     */
    function () {
        document.querySelector("h1").innerText = "MyTest Variant 1";
    },

    /**
     * Change the inner HTML of the first h1 tag
     */
    function () {
        document.querySelector("h1").innerHTML = `
        MyTest <span style="color: red;">Variant 1</span>
        `;
    },

    /*
    * Add a class to all h1 tags
    */
    function () {
        document.querySelectorAll("h1").forEach((el) => {
            el.classList.add("d-none");
        });
    },

    /*
    * Remove a class to all h1 tags
    */
    function () {
        document.querySelectorAll("h1").forEach((el) => {
            el.classList.remove("d-none");
        });
    },

    /*
    * Add an atribute to all h1 tags
    */
    function () {
        document.querySelectorAll("h1").forEach((n) => {
            n.setAttribute("data-variant", "MyTest Variant 2");
        });
    },

    /*
    * Remove an atribute to all h1 tags
    */
    function () {
        document.querySelectorAll("h1").forEach((n) => {
            n.removeAttribute("data-variant");
        });
    },

    /*
    * Hide all h1 tags
    */
    function () {
        document.querySelectorAll("h1").forEach((n) => {
            n.style.display = "none";
            n.setAttribute("aria-hidden", "true");
        });
    },

    /*
    * Scroll to the second paragraph inside a div with class "content"
    */
    function () {
        const contentDiv = document.querySelector("div.content");
        if (contentDiv) {
            const paragraphs = contentDiv.querySelectorAll("p");
            if (paragraphs.length >= 2) {
                paragraphs[1].scrollIntoView({ behavior: 'smooth' });
            }
        }
    },

    /*
    * Replace the image with the source "example.jpg" by "example-variant.jpg"
    */
    function () {
        document.querySelectorAll("img").forEach((n) => {
            const original = "example.jpg";
            const variant = "example-variant.jpg";
            if (n.src.includes(original)) {
                n.src = n.src.replace(original, variant);
                // delete the srcset attribute to avoid loading the original image from there
                n.removeAttribute("srcset");
            }
        });
    },

]