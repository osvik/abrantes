/* jshint esversion:6 */

Abrantes = Object.create(null);

Abrantes.testId = undefined;
Abrantes.variant = undefined;

/**
 * Assigns a variant to a user
 * @param {string} testId 
 */
Abrantes.assignVariant = function (testId, trafficAllocation = 1) {
    if (typeof (testId) !== "string" || testId.length === 0) {
        throw ("You need to provide an ID when assigning a variant");
    }
    this.testId = testId;
    if (typeof (this.readPersistent()) === "number") {
        this.variant = this.readPersistent();
        window.dispatchEvent(new CustomEvent("abrantes:assignVariant", {
            detail: {
                testId: this.testId,
                variant: this.variant
            }
        }));
        return;
    }
    const n = Math.random();
    if (n > trafficAllocation) {
        this.variant = -1;
    } else {
        this.variant = this.randomVar();
        window.dispatchEvent(new CustomEvent("abrantes:assignVariant", {
            detail: {
                testId: this.testId,
                variant: this.variant
            }
        }));
    }
};

/**
 * Imports the variant from the url
 * @param {string} testId 
 */
Abrantes.importVariant = function (testId) {
    if (typeof (testId) !== "string" || testId.length === 0) {
        throw ("You need to provide an ID when importing a variant");
    }

    this.testId = testId;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(testId)) {
        this.variant = Number(urlParams.get(testId));
        window.dispatchEvent(new CustomEvent("abrantes:assignVariant", {
            detail: {
                testId: this.testId,
                variant: this.variant
            }
        }));
    } else {
        this.variant = -1;
    }
};

/**
 * Adds the variant to the URL, to be imported in a different domain
 * @param {string} linkURLstring 
 * @returns {string}
 */
Abrantes.makeCrossSiteURL = function (linkURLstring) {
    const linkURL = new URL(linkURLstring);
    const windowSearch = new URLSearchParams(window.location.search);
    windowSearch.forEach(function (v, k) {
        if (!linkURL.searchParams.has(k)) {
            linkURL.searchParams.set(k, v);
        }
    });
    linkURL.searchParams.set(this.testId, this.variant);
    return linkURL.href;
};

/**
 * It transforms the hrefs of the <a> in the selector to make cross site experiments
 * @param {string} selector Css selector
 */
Abrantes.crossSiteLink = function (selector) {
    const self = this;
    const elements = document.querySelectorAll(selector);
    elements.forEach(function (element) {
        const elHref = element.getAttribute("href")
        const newHref = self.makeCrossSiteURL(elHref);
        element.setAttribute("href", newHref);
    });
};

/**
 * Renders the variant and adds the class variant-x to the <body> tag
 * @param {Number} variant 
 */
Abrantes.renderVariant = function (variant = this.variant) {
    if (variant === -1) {
        return;
    }
    if (typeof (this.variants[variant]) === "function") {
        this.variants[variant]();
        document.getElementsByTagName("body")[0].classList.add(this.testId + "-" + variant);
    } else {
        throw ("The variant " + variant + " does not exist");
    }
};

/**
 * Stores the test id (object name) and variant in localStorage
 */
Abrantes.persist = function (context) {
    if (context === "user") {
        localStorage.setItem(this.testId, this.variant);
    } else if (context === "session") {
        sessionStorage.setItem(this.testId, this.variant);
    } else {
        throw ("You must use either 'user' or 'session'");
    }
};

/**
 * Reads the value in the storage
 * @returns 
 */
Abrantes.readPersistent = function () {
    const sessionData = sessionStorage.getItem(this.testId);
    if (typeof (sessionData) === "string" || typeof (sessionData) === "number") {
        return Number(sessionData);
    }
    const userData = localStorage.getItem(this.testId);
    if (typeof (userData) === "string" || typeof (userData) === "number") {
        return Number(userData);
    }
    return undefined;
};

/**
 * Object where the user can read and write the settings
 */
Abrantes.settings = {

};

/**
 * Array of functions with the changes of each variant. The variants are also defined in an object that extends Abrantes.
 */
Abrantes.variants = [

];

/**
 * Selects a random variation from the list of available variants
 * @returns number
 */
Abrantes.randomVar = function () {
    const numberVariants = this.variants.length;
    this.variant = Math.floor(Math.random() * (numberVariants));
    return this.variant;
};

/**
 * Redirects to another url maintaining the url params and the hash
 * @param {string} url 
 */
Abrantes.redirectTo = function (url) {
    location.href = url + location.search + location.hash;
}

/**
 * Tracks the user using whatever is defined in an Abrantes plugin
 */
Abrantes.track = function () {
    throw ("Missing plugin to track results");
};

