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
            if (this.skipForced("formTrack()")) {
                return;
            }

            const self = this;

            const setInput = function () {
                self.setInput(self.settings.formTrack.inputElement, self.testId, self.variant);
            };

            this.settings.formTrack.triggerEvents.forEach(function (ev) {
                self.onEvent(ev, setInput);
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
         * Sets a form input value with the test ID and variant
         * @param {string} selector - CSS selector for the input element
         * @param {string} testId - The test identifier
         * @param {number} variant - The variant index
         */
        setInput: function (selector, testId, variant) {
            const iElement = document.querySelector(selector);
            if (!iElement) {
                const example = selector.charAt(0) === "#" && /^#[\w-]+$/.test(selector) ?
                    "<input type=\"hidden\" id=\"" + selector.slice(1) + "\" name=\"" + selector.slice(1) + "\">" :
                    "<input type=\"hidden\" name=\"...\"> matching \"" + selector + "\"";
                console.warn("Abrantes formTrack(): no element matches the selector \"" + selector + "\", so " + testId + "-" + variant + " is not saved in the form. Add " + example + " inside the form (the name is needed for it to be submitted), or set settings.formTrack.inputElement to the selector of the hidden field.");
                return;
            }
            iElement.value = testId + "-" + variant;
        }

    };

    Object.assign(Abrantes, formtrack);
    Object.assign(Abrantes.settings, settings);

}
