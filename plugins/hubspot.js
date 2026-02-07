/* eslint-disable no-undef */

{

    const settings = {
        hubspot: {
            eventName: "run_ab_test",
            customDimension: "ab_test_data",
            experimentName: "experiment_name",
            variantName: "variant_name",
            variantPrefix : "v"
        }
    };

    const hubspot = {

        /**
         * Pushes a custom event to Hubspot marketing hub enterprise plan.
         * @param {string} eventName - Custom event name.
         */
        hubspotEvent: function (eventName) {

            if (this.variant === -1) {
                return;
            }

            let hbsptevent = {};
            hbsptevent.event = eventName;
            hbsptevent.properties = {};

            hbsptevent.properties[this.settings.hubspot.customDimension] = this.testId + "-" + this.variant;
            hbsptevent.properties[this.settings.hubspot.experimentName] = this.testId;
            hbsptevent.properties[this.settings.hubspot.variantName] = this.settings.hubspot.variantPrefix + this.variant;

            if (typeof (_hsq) === "undefined") {
                throw new Error("Undefined _hsq. Please ensure that the Hubspot tracking code is correctly installed.");
            }

            _hsq.push(['trackCustomBehavioralEvent', hbsptevent]);

            document.dispatchEvent(new CustomEvent("abrantes:track", {
                detail: {
                    testId: this.testId,
                    variant: this.variant,
                    event: eventName,
                    tool: "hubspot"
                }
            }));

        }

    };

    Object.assign(Abrantes, hubspot);
    Object.assign(Abrantes.settings, settings)

}

