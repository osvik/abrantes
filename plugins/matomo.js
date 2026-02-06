/* eslint-disable no-undef */

{
    const matomo = {

        /**
         * Tracks the user using Matomo custom dimensions
         * @param {string} customDim - The custom dimension ID configured in Matomo
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

