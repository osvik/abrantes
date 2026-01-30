/* eslint-disable no-undef */

{

    const seed = {

        calculateSHA256: async function (message) {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            return hashHex;
        },

        /**
         * Assigns a variant based on a seed value.
         * @param {string} seed The seed value to use for variant assignment
         */
        seededVar: async function (seed = "") {

            if (typeof (seed) !== "string" || seed === "") {
                this.variant = -1;
                return this.variant;
            }

            const hash = await this.calculateSHA256(seed);
            const hashInt = parseInt(hash.slice(0, 8), 16);
            const numberOfVariants = this.variants.length;

            this.variant = hashInt % (numberOfVariants);
            return this.variant;

        },

        seedVariant: async function (testId) {
            if (typeof (testId) !== "string" || testId.length === 0) {
                throw ("You need to provide an ID when importing a variant");
            }
            if (!Array.isArray(this.variants) || this.variants.length === 0) {
                throw ("You must define at least one variant before importing");
            }
        }

    };

    Object.assign(Abrantes, seed);

}
