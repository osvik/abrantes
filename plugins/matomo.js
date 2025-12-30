/* eslint-disable no-undef */

{
    const matomo = {

        /**
         * Tracks the user using Matomo
         * @param {string} customDim Id in Matomo, a number
         */
        track: function (customDim) {
            if (this.variant === -1) {
                return;
            }
            _paq.push(['setCustomDimension', customDimensionId = customDim, customDimensionValue = this.testId + "-" + this.variant]);
            document.dispatchEvent(new CustomEvent("abrantes:track", {
                detail: {
                    testId: this.testId,
                    variant: this.variant,
                    customDim: customDim,
                    tool: "matomo",
                    type: "user"
                }
            }));
        }
    };

    Object.assign(Abrantes, matomo);

}

