
{
    const matomo = {

        /**
         * Tracks the user using Matomo
         * @param {string} customDim Id in Matomo, a number
         */
        track: function (customDim) {
            _paq.push(['setCustomDimension', customDimensionId = customDim, customDimensionValue = this.testId + "-" + this.variant]);
        }
    };

    Object.assign(Abrantes, matomo);

}

