
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

        },

        /**
         * Fills a form input with the testId and variant
         * @param {string} selector 
         * @param {string} testId 
         * @param {number} variant 
         */
        setInput: function (selector, testId, variant) {
            const iElement = document.querySelector(selector);
            if (!Boolean(iElement)) {
                throw ("The element '" + selector + "' does not exist");
            }
            iElement.value = testId + "-" + variant;
        }

    };

    Object.assign(Abrantes, formtrack);
    Object.assign(Abrantes.settings, settings);

}
