/* eslint-disable no-undef */

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

            document.dispatchEvent(new CustomEvent("abrantes:formTrack", {
                detail: {
                    testId: this.testId,
                    variant: this.variant,
                    element: this.settings.formTrack.inputElement
                }
            }));

        },

        /**
         * Fills a form input with the testId and variant
         * @param {string} selector 
         * @param {string} testId 
         * @param {number} variant 
         */
        setInput: function (selector, testId, variant) {
            const iElement = document.querySelector(selector);
            if (!iElement) {
                throw new Error("The element '" + selector + "' does not exist");
            }
            iElement.value = testId + "-" + variant;
        }

    };

    Object.assign(Abrantes, formtrack);
    Object.assign(Abrantes.settings, settings);

}
