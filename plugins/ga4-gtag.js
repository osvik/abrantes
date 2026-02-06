/* eslint-disable no-undef */

{
    const ga4gtag = {

        /**
         * Tracks the test at event-scoped level in Google Analytics 4 via gtag
         * @param {string} customDim - The custom dimension name configured in GA4
         */
        track: function (customDim) {
            if (typeof (window.googleTrackingConfig) !== "object") {
                throw new Error("window.googleTrackingConfig must be an object");
            }
            if (this.variant === -1) {
                return;
            }
            let setObj = {};
            setObj[customDim] = this.testId + "-" + this.variant;
            Object.assign(window.googleTrackingConfig, setObj);
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

