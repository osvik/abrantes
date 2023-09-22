
{
    const hotjarEvent = {

        hotjar: function () {
            if (typeof (hj) === "function") {
                hj('event', this.testId + "-" + this.variant);
            } else {
                throw ("Hotjar not properly installed");
            }
        }

    };

    Object.assign(Abrantes, hotjarEvent);

}

