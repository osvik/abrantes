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
         * Selects a random variation from the list of available variants based on a seed value
         * @param {string} seed The seed value to use for variant assignment
         * @return {number} The assigned variant index (as a promise)
         */
        seededVar: async function (seed = "") {

            if (typeof (seed) !== "string" || seed === "") {
                this.variant = -1;
                return this.variant;
            }

            const hash = await this.calculateSHA256(seed);
            const hashInt = parseInt(hash.slice(0, 8), 16);

            this.variant = hashInt % (this.variants.length);
            return this.variant;

        },

        /**
         * Assigns a variant to a user based on a seed string and a test identifier
         * @param {string} testId String identifier for the test
         * @param {string} seed A string seed to determine the variant
         */
        seedVariant: async function (testId, seed) {
            if (typeof (testId) !== "string" || testId.length === 0) {
                throw ("You need to provide an ID when assigning a variant");
            }
            if (!Array.isArray(this.variants) || this.variants.length === 0) {
                throw ("You must define at least one variant before assigning a seeded variant");
            }
            if (typeof (seed) !== "string" || seed.length === 0) {
                throw ("You need to provide a seed string when assigning a seeded variant");
            }
            this.testId = testId;
            await this.seededVar(seed);
        }

    };

    Object.assign(Abrantes, seed);

}
