
{
    const hotjarEvent = {

        /**
         * Triggers an event in Hotjar
         */
        hotjar: function () {
            if (typeof (hj) === "function") {
                hj('event', this.testId + "-" + this.variant);
                return;
            }
            window.addEventListener("load", function () {
                if (typeof (hj) === "function") {
                    hj('event', this.testId + "-" + this.variant);
                } else {
                    console.info("Hotjar not found");
                }
            });
        }

    };

    Object.assign(Abrantes, hotjarEvent);

}
