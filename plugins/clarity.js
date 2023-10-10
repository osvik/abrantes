
{

    const settings = {
        clarity: {
            triggerEvents: ["load", "cookies:accept", "cookies:acceptall", "cookies:ok"]
        }
    };

    const clarityEvent = {

        /**
         * Triggers an event in Clarity
         */
        clarity: function () {

            if (this.variant === -1) {
                return;
            }

            const self = this;
            // Loops trough cookie aceptance events, defined in .settings.hotjar.triggerEvents
            this.settings.clarity.triggerEvents.forEach(function (ev) {
                window.addEventListener(ev, function () {
                    setTimeout(() => {
                        if (typeof (clarity) === "function") {
                            // clarity("set", "flight", "testflight1");
                            clarity("set", self.testId, "v" + self.variant);
                        } else {
                            console.info("Clarity not present");
                        }
                    }, 1000);
                });
            });

            // FIXME Change the tracking script to fire the events
        }

    };

    Object.assign(Abrantes, clarityEvent);
    Object.assign(Abrantes.settings, settings);

}
