
{
    const ga4gtag = {

        /**
         * Tracks the user using Google Analytics 4 and Gtag
         * @param {string} customDim 
         */
        track: function (customDim) {
            if (typeof (window.googleTrackingConfig) !== "object") {
                throw ("window.googleTrackingConfig must be an object");
            }
            let setObj = {};
            setObj[customDim] = this.testId + "-" + this.variant;
            Object.assign(window.googleTrackingConfig, setObj);
        }
    };

    Object.assign(Abrantes, ga4gtag);

}

