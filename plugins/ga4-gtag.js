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

