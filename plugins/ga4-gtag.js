
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

