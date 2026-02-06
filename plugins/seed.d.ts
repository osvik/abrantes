/**
 * Abrantes seed plugin - Deterministic variant assignment based on seed values
 * TypeScript type definitions
 */

import Abrantes from "../Abrantes";

declare module "../Abrantes" {
    interface Abrantes {
        /**
         * Calculates the SHA-256 hash of a string
         * @param message - The string to hash
         * @returns The hexadecimal hash string
         */
        calculateSHA256(message: string): Promise<string>;

        /**
         * Selects a variant based on a seed value for deterministic assignment
         * @param seed - The seed value to determine variant assignment
         * @returns The assigned variant index, or -1 if seed is empty
         */
        getSeededVar(seed?: string): Promise<number>;

        /**
         * Assigns a variant to a user based on a seed string and a test identifier
         * @param testId - String identifier for the test
         * @param seed - A string seed to determine the variant
         * @param trafficAllocation - Percentage of users to include (0-1), defaults to 1
         * @param segment - Function that returns true to include user, defaults to () => true
         */
        assignSeededVariant(
            testId: string,
            seed: string,
            trafficAllocation?: number,
            segment?: () => boolean
        ): Promise<void>;
    }
}

export {};
