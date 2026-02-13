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
         * @param {string} customDim - Custom dimension name for the test data (defaults to testId)
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
                window.dataLayer = window.dataLayer || [];
            }

            dataLayer.push(dlevent);

            document.dispatchEvent(new CustomEvent("abrantes:track", {
                detail: {
                    testId: this.testId,
                    variant: this.variant,
                    customDim: customDim,
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

