/* jshint esversion:6 */

/*
    Abrantes - A lightweight A/B testing library
    © Osvaldo Gago - https://github.com/osvik/
    Licensed under the LGPL v3.0 license https://github.com/osvik/abrantes/blob/main/LICENSE
 */

const Abrantes = Object.create(null);
Abrantes.version = "1.4.1";
Abrantes.testId = undefined;
Abrantes.variant = undefined;
Abrantes.excludedVariantsForNewUsers = [];

/**
 * Object where the user can read and write the settings
 */
Abrantes.settings = {

    crossSiteLink: {
        triggerEvent: "DOMContentLoaded"
    },
    cookie: {
        expires: 7,
        path: "/",
        domain: ""
    }

};

/**
 * Assigns a variant to a user
 * @param {string} testId - String identifier for the test
 * @param {number} trafficAllocation - Percentage of users to include in the test (0-1)
 * @param {function} segment - Function that returns true or false to include the user in the test
 */
Abrantes.assignVariant = function (testId, trafficAllocation = 1, segment = () => true) {
    if (typeof (testId) !== "string" || testId.length === 0) {
        throw new Error("You need to provide an ID when assigning a variant");
    }
    if (typeof (trafficAllocation) !== "number" || trafficAllocation < 0 || trafficAllocation > 1) {
        throw new Error("trafficAllocation must be a number between 0 and 1");
    }
    if (typeof (segment) !== "function") {
        throw new Error("segment must be a function that returns true or false");
    }
    if (!Array.isArray(this.variants) || this.variants.length === 0) {
        throw new Error("You must define at least one variant (array of functions) before assigning");
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
        this.variant = this.getRandomVar();
        document.dispatchEvent(new CustomEvent("abrantes:assignVariant", {
            detail: {
                testId: this.testId,
                variant: this.variant
            }
        }));
    }
};

/**
 * Imports the variant from the URL query parameters
 * @param {string} testId - Identifier for the test, used as the URL parameter name
 */
Abrantes.importVariant = function (testId) {
    if (typeof (testId) !== "string" || testId.length === 0) {
        throw new Error("You need to provide an ID (string) when importing a variant");
    }
    if (!Array.isArray(this.variants) || this.variants.length === 0) {
        throw new Error("You must define at least one variant (array of functions) before importing");
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
 * Adds the test ID and variant to a URL for cross-domain experiments
 * @param {string} linkURLstring - The target URL to append parameters to
 * @returns {string} The modified URL with test parameters
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
 * Transforms the href attributes of matching anchor elements for cross-site experiments
 * @param {string} selector - CSS selector to match anchor elements
 */
Abrantes.crossSiteLink = function (selector) {
    const self = this;
    const addLinks = function (selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(function (element) {
            const elHref = element.getAttribute("href")
            if (!elHref) {
                return;
            }
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
 * Executes the variant function and adds a class to the body element
 * @param {number} variant - The variant index to render (defaults to this.variant)
 */
Abrantes.renderVariant = function (variant = this.variant) {
    if (variant === -1) {
        return;
    }
    if (typeof (variant) !== "number" || isNaN(variant)) {
        throw new Error("Variant must be a number");
    }
    if (!Array.isArray(this.variants) || this.variants.length === 0) {
        throw new Error("No variants defined to render");
    }
    if (variant < 0 || variant >= this.variants.length) {
        throw new Error("Variant " + variant + " is out of range. Valid range: 0-" + (this.variants.length - 1));
    }
    if (typeof (this.variants[variant]) !== "function") {
        throw new Error("Variant " + variant + " is not a function");
    }
    this.variants[variant]();
    document.getElementsByTagName("body")[0].classList.add(this.testId + "-" + variant);
    document.dispatchEvent(new CustomEvent("abrantes:renderVariant", {
        detail: {
            testId: this.testId,
            variant: this.variant
        }
    }));
};

/**
 * Stores the test ID and variant in the specified storage mechanism
 * @param {string} context - Storage type: "user"/"local" for localStorage, "session" for sessionStorage, "cookie" for cookies
 */
Abrantes.persist = function (context = "cookie") {
    let validContexts = ["user", "local", "session", "cookie"];
    if (!validContexts.includes(context)) {
        throw new Error("The context " + context + " is not valid. Use 'user', 'session' or 'cookie'");
    }
    let persisted = false;
    if (context === "user" || context === "local") {
        localStorage.setItem(this.testId, this.variant);
        persisted = true;
    } else if (context === "session") {
        sessionStorage.setItem(this.testId, this.variant);
        persisted = true;
    } else if (context === "cookie") {
        let cookieString = `${this.testId}=${this.variant}; expires=${new Date(Date.now() + 86400000 * this.settings.cookie.expires).toUTCString()}; path=${this.settings.cookie.path}`;
        if (this.settings.cookie.domain) {
            cookieString += `; domain=${this.settings.cookie.domain}`;
        }
        cookieString += "; SameSite=Strict;";
        document.cookie = cookieString;
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
 * Array of functions with the changes of each variant. The variants are also defined in an object that extends Abrantes.
 */
Abrantes.variants = [

];

/**
 * Selects a random variant from the list of available variants
 * @returns {number} The randomly selected variant index
 */
Abrantes.getRandomVar = function () {
    if (!Array.isArray(this.variants) || this.variants.length === 0) {
        throw new Error("Cannot select random variant: no variants defined");
    }
    let variant;
    const numberOfVariants = this.variants.length;
    if (window.crypto && window.crypto.getRandomValues) {
        const values = new Uint32Array(1);
        window.crypto.getRandomValues(values);
        variant = values[0] % (numberOfVariants);
    }
    else {
        variant = Math.floor(Math.random() * (numberOfVariants));
    }

    if (this.excludedVariantsForNewUsers.includes(variant)) {
        return this.getRandomVar();
    }
    return variant;
};

/**
 * Redirects to another URL while preserving query parameters and hash
 * @param {string} url - The destination URL to redirect to
 */
Abrantes.redirectTo = function (url) {
    var search = location.search;
    if (search && url.indexOf('?') !== -1) {
        search = '&' + search.substring(1);
    }
    location.href = url + search + location.hash;
}

/**
 * Waits for an element to appear in the DOM using MutationObserver
 * @param {string} selector - CSS selector for the element to wait for
 * @param {function} callback - Function to execute when the element is found
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
    throw new Error("Missing plugin to track results");
};

