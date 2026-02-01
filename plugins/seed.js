/* eslint-disable no-undef */

{

    const seed = {

        calculateSHA256: async function (message) {
            if (typeof (message) !== "string" || message.length === 0) {
                throw ("You need to provide a non-empty string to calculate SHA256");
            }
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
        getSeededVar: async function (seed = "") {
            if (typeof (seed) !== "string" || seed === "") {
                return -1;
            }
            const hash = await this.calculateSHA256(seed);
            const hashInt = parseInt(hash.slice(0, 8), 16);
            return hashInt % (this.variants.length);
        },

        /**
         * Assigns a variant to a user based on a seed string and a test identifier
         * @param {string} testId String identifier for the test
         * @param {string} seed A string seed to determine the variant
         * @param {number} trafficAllocation Percentage of users to include in the test (0-1)
         * @param {function} segment Function that returns true or false to include the user in the test
         */
        assignSeededVariant: async function (testId, seed, trafficAllocation = 1, segment = () => true) {
            if (typeof (testId) !== "string" || testId.length === 0) {
                throw ("You need to provide an ID when assigning a variant");
            }
            if (typeof (trafficAllocation) !== "number" || trafficAllocation < 0 || trafficAllocation > 1) {
                throw ("trafficAllocation must be a number between 0 and 1");
            }
            if (!Array.isArray(this.variants) || this.variants.length === 0) {
                throw ("You must define at least one variant before assigning a seeded variant");
            }
            if (typeof (seed) !== "string" || seed.length === 0) {
                throw ("You need to provide a seed string when assigning a seeded variant");
            }
            this.testId = testId;
            const n = Math.random();
            if (n > trafficAllocation || !segment()) {
                this.variant = -1;
                return
            }
            this.variant = await this.getSeededVar(seed);
            document.dispatchEvent(new CustomEvent("abrantes:assignVariant", {
                detail: {
                    testId: this.testId,
                    variant: this.variant
                }
            }));
        }

    };

    Object.assign(Abrantes, seed);

}
