/* jshint esversion:6 */

/*
    Abrantes - A lightweight A/B testing library
    © Osvaldo Gago - https://github.com/osvik/
    Licensed under the LGPL v3.0 license https://github.com/osvik/abrantes/blob/main/LICENSE
 */

const Abrantes = Object.create(null);
Abrantes.version = "1.7.0";
Abrantes.testId = undefined;
Abrantes.variant = undefined;
Abrantes.forced = false;
Abrantes.excludedVariantsForNewUsers = [];

/**
 * Debug mode: logs what each experiment does (assignment, render, persist, tracking, form field) to the console.
 * Turn it on with Abrantes.debug = true (or MyTest.debug = true) before the experiment code,
 * or with the URL parameter ?abrantes_debug. The value is shared by all experiments.
 */
{
    let debugOn = false;
    Object.defineProperty(Abrantes, "debug", {
        get: function () {
            return debugOn || new URLSearchParams(window.location.search).has("abrantes_debug");
        },
        set: function (value) {
            debugOn = value === true;
        },
        enumerable: true
    });
}

/**
 * Logs a debug message to the console when debug mode is on
 * @param {string} message - What happened
 * @param {object} data - Optional data, logged as JSON
 */
Abrantes.debugLog = function (message, data) {
    if (!Abrantes.debug) {
        return;
    }
    console.log("Abrantes debug: " + message + (data === undefined ? "" : " " + JSON.stringify(data)));
};

// Logs every Abrantes event in debug mode. Registered when the library loads, so it runs before any experiment code.
["assignVariant", "renderVariant", "persist", "track", "formTrack", "log"].forEach(function (name) {
    document.addEventListener("abrantes:" + name, function (event) {
        Abrantes.debugLog("abrantes:" + name, event.detail);
    });
});

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
    if (this.applyForced()) {
        return;
    }
    if (typeof (this.readPersistent()) === "number") {
        this.variant = this.readPersistent();
        this.debugLog(this.testId + ": variant " + this.variant + " read from storage (cookie, localStorage or sessionStorage)");
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
        this.debugLog(this.testId + ": not in the test (trafficAllocation or segment), variant -1");
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
    if (this.applyForced()) {
        return;
    }

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
        this.debugLog(this.testId + ": no ?" + this.testId + "= parameter in the URL, variant -1");
    }
};

/**
 * Reads the variant forced for this.testId with the URL parameter abrantes_force.
 * Format: ?abrantes_force=MyTest:1 Several tests: ?abrantes_force=MyTest:1,OtherTest:0
 * @returns {number|undefined} The forced variant, or undefined if there's no valid forced variant for this test
 */
Abrantes.readForced = function () {
    const urlParams = new URLSearchParams(window.location.search);
    let forced;
    urlParams.getAll("abrantes_force").join(",").split(",").forEach((entry) => {
        const sep = entry.lastIndexOf(":");
        if (sep === -1 || entry.slice(0, sep).trim() !== this.testId) {
            return;
        }
        const value = entry.slice(sep + 1).trim();
        const variant = Number(value);
        if (value === "" || !Number.isInteger(variant) || variant < -1 || variant >= this.variants.length) {
            console.warn("Abrantes: abrantes_force=" + entry + " is not valid for " + this.testId + ". Use a variant between 0 and " + (this.variants.length - 1) + " (or -1 for not in the test). The variant is assigned as usual.");
            return;
        }
        forced = variant;
    });
    return forced;
};

/**
 * If the URL forces a variant for this.testId, assigns it and marks the experiment as forced.
 * A forced visit is for testing: persist() and the tracking methods skip it.
 * @returns {boolean} true if a variant was forced
 */
Abrantes.applyForced = function () {
    const forcedVariant = this.readForced();
    if (typeof (forcedVariant) !== "number") {
        this.forced = false;
        return false;
    }
    this.variant = forcedVariant;
    this.forced = true;
    console.info("Abrantes: " + this.testId + " is forced to variant " + forcedVariant + " by the URL. It is not persisted or tracked.");
    document.dispatchEvent(new CustomEvent("abrantes:assignVariant", {
        detail: {
            testId: this.testId,
            variant: this.variant,
            forced: true
        }
    }));
    return true;
};

/**
 * Returns true, and logs that the action was skipped, when the variant was forced by the URL
 * @param {string} action - Name of the skipped method, for the console message
 * @returns {boolean}
 */
Abrantes.skipForced = function (action) {
    if (this.forced) {
        console.info("Abrantes: " + this.testId + " is forced by the URL, so " + action + " is skipped.");
        return true;
    }
    return false;
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
 * Runs a callback when a window event fires. If the event is "DOMContentLoaded" or "load"
 * and has already happened (e.g. async or module scripts), the callback runs on the next tick instead.
 * It runs asynchronously, like a listener would, so an error in the callback doesn't stop the calling code.
 * @param {string} eventName - Name of the window event
 * @param {function} callback - Function to run
 */
Abrantes.onEvent = function (eventName, callback) {
    const alreadyFired = (eventName === "DOMContentLoaded" && document.readyState !== "loading") ||
        (eventName === "load" && document.readyState === "complete");
    if (alreadyFired) {
        setTimeout(callback, 0);
    } else {
        window.addEventListener(eventName, callback);
    }
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
        this.onEvent(this.settings.crossSiteLink.triggerEvent, function () {
            addLinks(selector);
        });
    } else {
        addLinks(selector);
    }
};

/**
 * Executes the variant function and adds a class to the html element
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
    document.getElementsByTagName("html")[0].classList.add(this.testId + "-" + variant);
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
    if (this.skipForced("persist()")) {
        return;
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
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
};

/**
 * Tracks the user using whatever is defined in an Abrantes plugin
 */
Abrantes.track = function () {
    if (this.skipForced("track()")) {
        return;
    }
    document.dispatchEvent(new CustomEvent("abrantes:track", {
        detail: {
            testId: this.testId,
            variant: this.variant,
            customDim: this.testId + "-" + this.variant,
            tool: "abrantes-core"
        }
    }));
};

/* eslint-disable no-undef */

{
    const ga4gtag = {

        /**
         * Tracks the test at event-scoped level in Google Analytics 4 via gtag
         * @param {string} customDim - The custom dimension name configured in GA4
         */
        track: function (customDim) {
            if (typeof (window.googleTrackingConfig) !== "object" || window.googleTrackingConfig === null) {
                console.warn("Abrantes track(\"" + customDim + "\"): window.googleTrackingConfig is not an object, so " + this.testId + " is not tracked in GA4. Add window.googleTrackingConfig = {}; before the experiment and use gtag('config', 'G-XXXXXXX', window.googleTrackingConfig); after it.");
                return;
            }
            if (this.variant === -1) {
                return;
            }
            if (this.skipForced("track()")) {
                return;
            }
            let setObj = {};
            setObj[customDim] = this.testId + "-" + this.variant;
            Object.assign(window.googleTrackingConfig, setObj);
            this.checkGtagConfig(customDim);
            document.dispatchEvent(new CustomEvent("abrantes:track", {
                detail: {
                    testId: this.testId,
                    variant: this.variant,
                    customDim: customDim,
                    tool: "ga4-gtag",
                    type: "event"
                }
            }));
        },

        /**
         * Warns when the custom dimension set by track() won't reach GA4.
         * gtag.js reads the config parameters once, when it processes gtag('config', ...).
         * Later changes (including gtag('set', ...) with custom parameters) aren't sent with the events.
         * @param {string} customDim - The custom dimension name configured in GA4
         */
        checkGtagConfig: function (customDim) {
            if (!Array.isArray(window.dataLayer)) {
                return;
            }
            const self = this;
            window.dataLayer.forEach(function (command) {
                if (!command || command[0] !== "config" || typeof command[1] !== "string" || command[1].indexOf("G-") !== 0) {
                    return;
                }
                const id = command[1];
                if (command[2] !== window.googleTrackingConfig) {
                    console.warn("Abrantes track(\"" + customDim + "\"): gtag('config', '" + id + "') doesn't use window.googleTrackingConfig, so " + self.testId + " is not sent to GA4. Use gtag('config', '" + id + "', window.googleTrackingConfig);");
                } else if (window.google_tag_manager && window.google_tag_manager[id]) {
                    console.warn("Abrantes track(\"" + customDim + "\"): gtag.js already processed gtag('config', '" + id + "'), so " + self.testId + " is not sent to GA4. Run the experiment before gtag('config', ...).");
                }
            });
        },

        /**
         * Tracks the test at user-scoped level in Google Analytics 4 via gtag
         * @param {string} customDim - The user property name configured in GA4
         */
        trackUser: function (customDim) {
            if (typeof (gtag) !== "function") {
                throw new Error("gtag is not defined or it's not a function");
            }
            if (this.variant === -1) {
                return;
            }
            if (this.skipForced("trackUser()")) {
                return;
            }
            let setObj = {};
            setObj[customDim] = this.testId + "-" + this.variant;
            gtag('set', 'user_properties', setObj);
            document.dispatchEvent(new CustomEvent("abrantes:track", {
                detail: {
                    testId: this.testId,
                    variant: this.variant,
                    customDim: customDim,
                    tool: "ga4-gtag",
                    type: "user"
                }
            }));
        }
    };

    Object.assign(Abrantes, ga4gtag);

}


/* eslint-disable no-undef */

{

    const settings = {
        hotjar: {
            triggerEvents: ["load", "cookies:accept", "cookies:acceptall", "cookies:ok"]
        }
    };

    const hotjarEvent = {

        /**
         * Triggers an event in Hotjar
         */
        hotjar: function () {

            if (this.variant === -1) {
                return;
            }
            if (this.skipForced("hotjar()")) {
                return;
            }

            if (typeof (hj) === "function") {
                hj('event', this.testId + "-" + this.variant);
                this.debugLog("hotjar(): hj('event', '" + this.testId + "-" + this.variant + "')");
                return;
            }

            const self = this;
            // Loops trough cookie aceptance events, defined in .settings.hotjar.triggerEvents
            this.settings.hotjar.triggerEvents.forEach(function (ev) {
                window.addEventListener(ev, function () {
                    setTimeout(() => {
                        if (typeof (hj) === "function") {
                            hj('event', self.testId + "-" + self.variant);
                            self.debugLog("hotjar(): hj('event', '" + self.testId + "-" + self.variant + "')");
                        } else {
                            console.info("Hotjar not present");
                        }
                    }, 1000);
                });
            });

            // FIXME Change the tracking script to fire the events
        }

    };

    Object.assign(Abrantes, hotjarEvent);
    Object.assign(Abrantes.settings, settings);

}

/* eslint-disable no-undef */

{

    const settings = {
        formTrack: {
            // Use triggerEvents of your GDPR cookie/tracking acceptance. "DOMContentLoaded" for all
            triggerEvents: ["DOMContentLoaded"],
            // Form input element where to store the data
            inputElement: "#last_abtest_variant"
        }
    };

    const formtrack = {

        /**
         * Adds listeners to the events that populates the form field
         */
        formTrack: function () {

            if (this.variant === -1) {
                return;
            }
            if (this.skipForced("formTrack()")) {
                return;
            }

            const self = this;

            const setInput = function () {
                self.setInput(self.settings.formTrack.inputElement, self.testId, self.variant);
            };

            this.settings.formTrack.triggerEvents.forEach(function (ev) {
                self.onEvent(ev, setInput);
            });

            document.dispatchEvent(new CustomEvent("abrantes:formTrack", {
                detail: {
                    testId: this.testId,
                    variant: this.variant,
                    element: this.settings.formTrack.inputElement
                }
            }));

        },

        /**
         * Sets a form input value with the test ID and variant
         * @param {string} selector - CSS selector for the input element
         * @param {string} testId - The test identifier
         * @param {number} variant - The variant index
         */
        setInput: function (selector, testId, variant) {
            const iElement = document.querySelector(selector);
            if (!iElement) {
                const example = selector.charAt(0) === "#" && /^#[\w-]+$/.test(selector) ?
                    "<input type=\"hidden\" id=\"" + selector.slice(1) + "\" name=\"" + selector.slice(1) + "\">" :
                    "<input type=\"hidden\" name=\"...\"> matching \"" + selector + "\"";
                console.warn("Abrantes formTrack(): no element matches the selector \"" + selector + "\", so " + testId + "-" + variant + " is not saved in the form. Add " + example + " inside the form (the name is needed for it to be submitted), or set settings.formTrack.inputElement to the selector of the hidden field.");
                return;
            }
            iElement.value = testId + "-" + variant;
            this.debugLog("formTrack(): " + selector + " value set", { value: iElement.value });
        }

    };

    Object.assign(Abrantes, formtrack);
    Object.assign(Abrantes.settings, settings);

}

/* eslint-disable no-undef */

{

    const settings = {
        dataLayer: {
            eventName: "run_ab_test",
            customDimension: "ab_test_data",
            experimentName: "experiment_name",
            variantName: "variant_name",
            variantPrefix : "v"
        }
    };

    const add2DL = {

        /**
         * Pushes an event with test data to the dataLayer for tag manager integration
         * @param {string} testId - Optional name for the experiment (defaults to thisTest.testId)
         */
        add2dataLayer: function (testId = this.testId) {

            if (this.variant === -1) {
                return;
            }
            if (this.skipForced("add2dataLayer()")) {
                return;
            }

            let dlevent = {};

            dlevent["event"] = this.settings.dataLayer.eventName;
            dlevent[this.settings.dataLayer.customDimension] = testId + "-" + this.variant;
            dlevent[this.settings.dataLayer.experimentName] = testId;
            dlevent[this.settings.dataLayer.variantName] = this.settings.dataLayer.variantPrefix + this.variant;

            if (typeof (dataLayer) === "undefined") {
                window.dataLayer = window.dataLayer || [];
            }

            dataLayer.push(dlevent);

            document.dispatchEvent(new CustomEvent("abrantes:track", {
                detail: {
                    testId: this.testId,
                    variant: this.variant,
                    tool: "dataLayer"
                }
            }));

        },

        /**
         * Listens for new entries in the dataLayer and triggers a callback function with the new entry as an argument
         * @param {*} callback - Function to process the new entries
         */
        listen2dataLayer: function (callback = (newEntry) => { console.log('New dataLayer entry:', newEntry); }) {

            window.dataLayer = window.dataLayer || [];
            const originalPush = dataLayer.push;

            dataLayer.push = function () {
                const result = originalPush.apply(window.dataLayer, arguments);
                const newEntry = arguments[0];
                if (callback && typeof callback === "function") {
                    callback(newEntry);
                }
                return result;
            }

        }

    };

    Object.assign(Abrantes, add2DL);
    Object.assign(Abrantes.settings, settings)

}


/* eslint-disable no-undef */

{

    const settings = {
        log: {
            apiURL: "",
            variantPrefix: "v"
        }
    };

    const log = {

        /**
         * Sends an event to the Abrantes Log API.
         * @param {string} event - Event name to log
         * @param {string} note - Optional note (defaults to empty string)
         */
        log: function (event, note = "") {

            if (this.variant === -1) {
                return;
            }
            if (this.skipForced("log()")) {
                return;
            }

            if (!this.settings.log.apiURL) {
                throw new Error("You need to set the log API URL in yourTest.settings.log.apiURL");
            }

            const params = new URLSearchParams();
            params.set("event", event);
            params.set("ab_test_data", this.testId + "-" + this.variant);
            params.set("experiment_name", this.testId);
            params.set("variant_name", this.settings.log.variantPrefix + this.variant);
            params.set("url", document.location.href);
            params.set("note", note);

            const url = this.settings.log.apiURL + "?" + params.toString();

            fetch(url)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    document.dispatchEvent(new CustomEvent("abrantes:log", {
                        detail: {
                            event: event,
                            note: note,
                            result: data.result
                        }
                    }));
                })
                .catch(function (error) {
                    console.error("Abrantes log error:", error);
                });

        }

    };

    Object.assign(Abrantes, log);
    Object.assign(Abrantes.settings, settings);

}

/* eslint-disable no-undef */

{

    const seed = {

        /**
         * Calculates the SHA-256 hash of a string
         * @param {string} message - The string to hash
         * @returns {Promise<string>} The hexadecimal hash string
         */
        calculateSHA256: async function (message) {
            if (typeof (message) !== "string" || message.length === 0) {
                throw new Error("You need to provide a non-empty string to calculate SHA256");
            }
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        },

        /**
         * Selects a variant based on a seed value for deterministic assignment
         * @param {string} seed - The seed value to determine variant assignment
         * @returns {Promise<number>} The assigned variant index, or -1 if seed is empty
         */
        getSeededVar: async function (seed = "") {
            if (typeof (seed) !== "string" || seed === "") {
                return -1;
            }
            const hash = await this.calculateSHA256(seed);
            const hashInt = parseInt(hash.slice(0, 8), 16);
            return hashInt % (this.variants.length);
        },

        /**
         * Assigns a variant to a user based on a seed string and a test identifier
         * @param {string} testId - String identifier for the test
         * @param {string} seed - A string seed to determine the variant
         * @param {number} trafficAllocation - Percentage of users to include in the test (0-1)
         * @param {function} segment - Function that returns true or false to include the user in the test
         */
        assignSeededVariant: async function (testId, seed, trafficAllocation = 1, segment = () => true) {
            if (typeof (testId) !== "string" || testId.length === 0) {
                throw new Error("You need to provide an ID (string) when assigning a seeded variant");
            }
            if (typeof (trafficAllocation) !== "number" || trafficAllocation < 0 || trafficAllocation > 1) {
                throw new Error("trafficAllocation must be a number between 0 and 1");
            }
            if (!Array.isArray(this.variants) || this.variants.length === 0) {
                throw new Error("You must define at least one variant before assigning a seeded variant");
            }
            if (typeof (seed) !== "string" || seed.length === 0) {
                throw new Error("You need to provide a seed string when assigning a seeded variant");
            }
            this.testId = testId;
            if (this.applyForced()) {
                return;
            }
            const n = Math.random();
            if (n > trafficAllocation || !segment()) {
                this.variant = -1;
                this.debugLog(this.testId + ": not in the test (trafficAllocation or segment), variant -1");
                return
            }
            this.variant = await this.getSeededVar(seed);
            document.dispatchEvent(new CustomEvent("abrantes:assignVariant", {
                detail: {
                    testId: this.testId,
                    variant: this.variant
                }
            }));
        }

    };

    Object.assign(Abrantes, seed);

}

/* eslint-disable no-undef */

{

    const settings = {
        hubspot: {
            customDimension: "ab_test_data",
            experimentName: "experiment_name",
            variantName: "variant_name",
            variantPrefix : "v"
        }
    };

    const hubspot = {

        /**
         * Pushes a custom event to Hubspot marketing hub enterprise plan.
         * @param {string} eventName - Custom event name.
         */
        hubspotEvent: function (eventName) {

            if (this.variant === -1) {
                return;
            }
            if (this.skipForced("hubspotEvent()")) {
                return;
            }

            let hbsptevent = {};
            hbsptevent.name = eventName;
            hbsptevent.properties = {};

            hbsptevent.properties[this.settings.hubspot.customDimension] = this.testId + "-" + this.variant;
            hbsptevent.properties[this.settings.hubspot.experimentName] = this.testId;
            hbsptevent.properties[this.settings.hubspot.variantName] = this.settings.hubspot.variantPrefix + this.variant;

            if (typeof (_hsq) === "undefined") {
                throw new Error("Undefined _hsq. Please ensure that the Hubspot tracking code is correctly installed.");
            }

            _hsq.push(['trackCustomBehavioralEvent', hbsptevent]);

            document.dispatchEvent(new CustomEvent("abrantes:track", {
                detail: {
                    testId: this.testId,
                    variant: this.variant,
                    event: eventName,
                    tool: "hubspot"
                }
            }));

        }

    };

    Object.assign(Abrantes, hubspot);
    Object.assign(Abrantes.settings, settings)

}

