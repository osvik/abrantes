
{
    const formtrack = {

        settings: {
            formtrack: {
                triggerEvents: ["DOMContentLoaded", "load"],
                inputElement: "#last_abtest_variant"
            }
        },

        /**
         * Adds listeners to the events that populates the form field
         */
        formtrack: function () {

            if (this.variant === -1) {
                return;
            }

            const self = this;

            this.settings.formtrack.triggerEvents.forEach(function (ev) {
                window.addEventListener(ev, function () {
                    console.log(ev, self.testId, self.variant);
                });
            });

        }

    };

    Object.assign(Abrantes, formtrack);

}
