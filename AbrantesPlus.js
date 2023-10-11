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
            if (!Boolean(iElement)) {
                throw ("The element '" + selector + "' does not exist");
            }
            iElement.value = testId + "-" + variant;
        }

    };

    Object.assign(Abrantes, formtrack);
    Object.assign(Abrantes.settings, settings);

}
