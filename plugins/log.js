/* eslint-disable no-undef */

{

    const settings = {
        log: {
            apiURL: "",
            variantPrefix: "v"
        }
    };

    const log = {

        /**
         * Sends an event to the Abrantes Log API.
         * @param {string} event Event name to log
         * @param {string} note Optional note (defaults to empty string)
         */
        log: function (event, note = "") {

            if (this.variant === -1) {
                return;
            }

            if (!this.settings.log.apiURL) {
                throw new Error("You need to set the log API URL in yourTest.settings.log.apiURL");
            }

            const params = new URLSearchParams();
            params.set("event", event);
            params.set("ab_test_data", this.testId + "-" + this.variant);
            params.set("experiment_name", this.testId);
            params.set("variant_name", this.settings.log.variantPrefix + this.variant);
            params.set("url", document.location.href);
            params.set("note", note);

            const url = this.settings.log.apiURL + "?" + params.toString();

            fetch(url)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    document.dispatchEvent(new CustomEvent("abrantes:log", {
                        detail: {
                            event: event,
                            note: note,
                            result: data.result
                        }
                    }));
                })
                .catch(function (error) {
                    console.error("Abrantes log error:", error);
                });

        }

    };

    Object.assign(Abrantes, log);
    Object.assign(Abrantes.settings, settings);

}
