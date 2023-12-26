/* eslint-disable no-undef */

{

    const settings = {
        hotjar: {
            triggerEvents: ["load", "cookies:accept", "cookies:acceptall", "cookies:ok"]
        }
    };

    const hotjarEvent = {

        /**
         * Triggers an event in Hotjar
         */
        hotjar: function () {

            if (this.variant === -1) {
                return;
            }

            if (typeof (hj) === "function") {
                hj('event', this.testId + "-" + this.variant);
                return;
            }

            const self = this;
            // Loops trough cookie aceptance events, defined in .settings.hotjar.triggerEvents
            this.settings.hotjar.triggerEvents.forEach(function (ev) {
                window.addEventListener(ev, function () {
                    setTimeout(() => {
                        if (typeof (hj) === "function") {
                            hj('event', self.testId + "-" + self.variant);
                        } else {
                            console.info("Hotjar not present");
                        }
                    }, 1000);
                });
            });

            // FIXME Change the tracking script to fire the events
        }

    };

    Object.assign(Abrantes, hotjarEvent);
    Object.assign(Abrantes.settings, settings);

}
