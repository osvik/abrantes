// eslint-disable-next-line no-unused-vars
var variants = [

    /*
     * Rename all h1 tags to "MyTest Variant 1"
     */
    function () {
        document.querySelectorAll("h1").forEach((n) => {
            n.innerText = "MyTest Variant 2";
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
    * Add a class to all h1 tags
    */
    function () {
        document.querySelectorAll("h1").forEach((n) => {
            n.classList.add("d-none");
        });
    },

    /*
    * Hide all h1 tags
    */
    function () {
        document.querySelectorAll("h1").forEach((n) => {
            n.style.display = "none";
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