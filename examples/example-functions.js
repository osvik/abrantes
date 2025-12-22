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
            n.classList.add("d-done");
        });
    },




]