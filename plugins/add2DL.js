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
                throw new Error("Undefined dataLayer");
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

        }

    };

    Object.assign(Abrantes, add2DL);
    Object.assign(Abrantes.settings, settings)

}

