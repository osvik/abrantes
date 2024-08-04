/* eslint-disable no-undef */

{

    const settings = {
        dataLayer: {
            eventName: "run_ab_test",
            customDimension: "ab_test_data"
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

            if (typeof (dataLayer) === "undefined") {
                throw ("Undefined dataLayer");
            }

            dataLayer.push(dlevent);

        }

    };

    Object.assign(Abrantes, add2DL);
    Object.assign(Abrantes.settings, settings)

}

