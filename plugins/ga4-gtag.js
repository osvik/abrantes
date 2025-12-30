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
         * Tracks the user using Google Analytics 4 and Gtag at user based level
         * @param {string} customDim 
         */
        trackUser: function (customDim) {
            if (typeof (gtag) !== "function") {
                throw ("gtag is not defined");
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

