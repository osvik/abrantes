/* jshint esversion:6 */

const Abrantes = Object.create(null);

Abrantes.testId = undefined;
Abrantes.variant = undefined;
Abrantes.version = "1.0.1";

/**
 * Assigns a variant to a user
 * @param {string} testId String identifier for the test
 * @param {number} trafficAllocation Percentage of users to include in the test (0-1)
 * @param {function} segment Function that returns true or false to include the user in the test
 */
Abrantes.assignVariant = function (testId, trafficAllocation = 1, segment = () => true) {
    if (typeof (testId) !== "string" || testId.length === 0) {
        throw ("You need to provide an ID when assigning a variant");
    }
    if (typeof (trafficAllocation) !== "number" || trafficAllocation < 0 || trafficAllocation > 1) {
        throw ("trafficAllocation must be a number between 0 and 1");
    }
    if (typeof (segment) !== "function") {
        throw ("segment must be a function that returns true or false");
    }
    if (!Array.isArray(this.variants) || this.variants.length === 0) {
        throw ("You must define at least one variant before assigning");
    }
    this.testId = testId;
    if (typeof (this.readPersistent()) === "number") {
        this.variant = this.readPersistent();
        document.dispatchEvent(new CustomEvent("abrantes:assignVariant", {
            detail: {
                testId: this.testId,
                variant: this.variant
            }
        }));
        return;
    }
    const n = Math.random();
    if (n > trafficAllocation || !segment()) {
        this.variant = -1;
    } else {
        this.variant = this.randomVar();
        document.dispatchEvent(new CustomEvent("abrantes:assignVariant", {
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
    if (!Array.isArray(this.variants) || this.variants.length === 0) {
        throw ("You must define at least one variant before importing");
    }

    this.testId = testId;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(testId)) {
        const importedVariant = Number(urlParams.get(testId));
        if (isNaN(importedVariant)) {
            console.warn("Abrantes: Invalid variant value in URL, assigning to control");
            this.variant = -1;
            return;
        }
        if (importedVariant !== -1 && (importedVariant < 0 || importedVariant >= this.variants.length)) {
            console.warn("Abrantes: Variant " + importedVariant + " does not exist, assigning to control");
            this.variant = -1;
            return;
        }
        this.variant = importedVariant;
        document.dispatchEvent(new CustomEvent("abrantes:assignVariant", {
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
 * @param {string} selector CSS selector
 */
Abrantes.crossSiteLink = function (selector) {
    const self = this;
    const addLinks = function (selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(function (element) {
            const elHref = element.getAttribute("href")
            const newHref = self.makeCrossSiteURL(elHref);
            element.setAttribute("href", newHref);
        });
    };
    if (this.settings.crossSiteLink.triggerEvent) {
        window.addEventListener(this.settings.crossSiteLink.triggerEvent, function () {
            addLinks(selector);
        });
    } else {
        addLinks(selector);
    }
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
        document.dispatchEvent(new CustomEvent("abrantes:renderVariant", {
            detail: {
                testId: this.testId,
                variant: this.variant
            }
        }));
    } else {
        throw ("The variant " + variant + " does not exist");
    }
};

/**
 * Stores the test id (object name) and variant in localStorage
 * @param {string} context "user" for localStorage, "session" for sessionStorage, "cookie" for cookies
 */
Abrantes.persist = function (context = "cookie") {
    let validContexts = ["user", "local", "session", "cookie"];
    if (!validContexts.includes(context)) {
        throw ("The context " + context + " is not valid. Use 'user', 'session' or 'cookie'");
    }
    let persisted = false;
    if (context === "user" || context === "local") {
        localStorage.setItem(this.testId, this.variant);
        persisted = true;
    } else if (context === "session") {
        sessionStorage.setItem(this.testId, this.variant);
        persisted = true;
    } else if (context === "cookie") {
        document.cookie = `${this.testId}=${this.variant}; expires=${new Date(Date.now() + 86400000 * this.settings.cookie.expires).toUTCString()}; path=/; SameSite=Strict;`;
        persisted = true;
    }
    if (persisted) {
        document.dispatchEvent(new CustomEvent("abrantes:persist", {
            detail: {
                testId: this.testId,
                variant: this.variant,
                context: context
            }
        }));
    }
};

/**
 * Reads the value of the variant in the storage
 * @returns {number|undefined}
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
    const cookieData = document.cookie.split('; ').find(row => row.startsWith(this.testId + '='));
    if (typeof (cookieData) === "string") {
        return Number(cookieData.split('=')[1]);
    }
    return undefined;
};

/**
 * Object where the user can read and write the settings
 */
Abrantes.settings = {

    crossSiteLink: {
        triggerEvent: "DOMContentLoaded"
    },
    cookie: {
        expires: 7
    }

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
    const numberOfVariants = this.variants.length;
    if (window.crypto && window.crypto.getRandomValues) {
        const values = new Uint32Array(1);
        window.crypto.getRandomValues(values);
        this.variant = values[0] % (numberOfVariants);
    }
    else {
        this.variant = Math.floor(Math.random() * (numberOfVariants));
    }
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
 * Waits for an element to appear in the DOM
 * @param {string} selector CSS selector
 * @param {function} callback
 */
Abrantes.waitFor = function (selector, callback) {
    if (document.querySelector(selector)) {
        callback();
    } else {
        const observer = new MutationObserver(function () {
            if (document.querySelector(selector)) {
                observer.disconnect();
                callback();
            }
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
};

/**
 * Tracks the user using whatever is defined in an Abrantes plugin
 */
Abrantes.track = function () {
    throw ("Missing plugin to track results");
};

