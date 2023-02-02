
{
    const matomo = {

        /**
         * Tracks the user using Matomo
         * @param {string} customDim Id in Matomo, a number
         */
        track: function (customDim) {
            _paq.push(['setCustomDimension', customDimensionId = customDim, customDimensionValue = MyTest.testId + "-" + MyTest.variant]);
        }
    };

    Object.assign(Abrantes, matomo);

}

