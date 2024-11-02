/* jshint esversion:6 */

const Abrantes = Object.create(null);

Abrantes.testId = undefined;
Abrantes.variant = undefined;
Abrantes.version = "0.19+";

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
    } else {
        throw ("The variant " + variant + " does not exist");
    }
};

/**
 * Stores the test id (object name) and variant in localStorage
 */
Abrantes.persist = function (context) {
    if (context === "user" || context=="local") {
        localStorage.setItem(this.testId, this.variant);
    } else if (context === "session") {
        sessionStorage.setItem(this.testId, this.variant);
    } else if ( context === "cookie" ) {
        document.cookie = `${this.testId}=${this.variant}; expires=${new Date(Date.now() + 86400000 * this.settings.cookie.expires).toUTCString()}; path=/; SameSite=Strict;`;
    } else {
        throw ("You must use either 'user', 'session' or 'cookie' with persist");
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
 * Tracks the user using whatever is defined in an Abrantes plugin
 */
Abrantes.track = function () {
    throw ("Missing plugin to track results");
};


/* eslint-disable no-undef */

{
    const ga4gtag = {

        /**
         * Tracks the user using Google Analytics 4 and Gtag at event based level
         * @param {string} customDim 
         */
        track: function (customDim) {
            if (typeof (window.googleTrackingConfig) !== "object") {
                throw ("window.googleTrackingConfig must be an object");
            }
            if (this.variant === -1) {
                return;
            }
            let setObj = {};
            setObj[customDim] = this.testId + "-" + this.variant;
            Object.assign(window.googleTrackingConfig, setObj);
        },

        /**
         * Tracks the user using Google Analytics 4 and Gtag at user based level
         * @param {string} customDim 
         */
        trackUser: function (customDim) {
            let setObj = {};
            setObj[customDim] = this.testId + "-" + this.variant;
            gtag('set', 'user_properties', setObj);
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

            if (typeof (hj) === "function") {
                hj('event', this.testId + "-" + this.variant);
                return;
            }

            const self = this;
            // Loops trough cookie aceptance events, defined in .settings.hotjar.triggerEvents
            this.settings.hotjar.triggerEvents.forEach(function (ev) {
                window.addEventListener(ev, function () {
                    setTimeout(() => {
                        if (typeof (hj) === "function") {
                            hj('event', self.testId + "-" + self.variant);
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

            const self = this;

            this.settings.formTrack.triggerEvents.forEach(function (ev) {
                window.addEventListener(ev, function () {
                    self.setInput(self.settings.formTrack.inputElement, self.testId, self.variant);
                });
            });

        },

        /**
         * Fills a form input with the testId and variant
         * @param {string} selector 
         * @param {string} testId 
         * @param {number} variant 
         */
        setInput: function (selector, testId, variant) {
            const iElement = document.querySelector(selector);
            if (!iElement) {
                throw ("The element '" + selector + "' does not exist");
            }
            iElement.value = testId + "-" + variant;
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
         * Adds an event and a custom dimension with the event id and variant to the dataLayer.
         * Used by tag manager to make AB tests.
         * @param {string} customDim 
         */
        add2dataLayer: function (customDim = this.testId) {

            if (this.variant === -1) {
                return;
            }

            let dlevent = {};

            dlevent["event"] = this.settings.dataLayer.eventName;
            dlevent[this.settings.dataLayer.customDimension] = customDim + "-" + this.variant;
            dlevent[this.settings.dataLayer.experimentName] = customDim;
            dlevent[this.settings.dataLayer.variantName] = this.settings.dataLayer.variantPrefix + this.variant;

            if (typeof (dataLayer) === "undefined") {
                throw ("Undefined dataLayer");
            }

            dataLayer.push(dlevent);

        }

    };

    Object.assign(Abrantes, add2DL);
    Object.assign(Abrantes.settings, settings)

}

