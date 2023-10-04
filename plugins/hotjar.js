
{
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
            self = this;
            window.addEventListener("load", function () {
                if (typeof (hj) === "function") {
                    hj('event', self.testId + "-" + self.variant);
                } else {
                    console.error("Hotjar not found");
                }
            });
        }

    };

    Object.assign(Abrantes, hotjarEvent);

}
