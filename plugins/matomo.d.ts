/**
 * Abrantes Matomo plugin - Matomo Analytics integration
 * TypeScript type definitions
 */

import Abrantes from "../Abrantes";

declare module "../Abrantes" {
    interface Abrantes {
        /**
         * Tracks the test using Matomo custom dimensions
         * @param customDim - The custom dimension ID configured in Matomo
         */
        track(customDim: string): void;
    }
}

export {};
