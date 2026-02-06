/**
 * Abrantes GA4 gtag plugin - Google Analytics 4 integration via gtag
 * TypeScript type definitions
 */

import Abrantes from "../Abrantes";

declare module "../Abrantes" {
    interface Abrantes {
        /**
         * Tracks the test at event-scoped level in Google Analytics 4 via gtag
         * @param customDim - The custom dimension name configured in GA4
         */
        track(customDim: string): void;

        /**
         * Tracks the test at user-scoped level in Google Analytics 4 via gtag
         * @param customDim - The user property name configured in GA4
         */
        trackUser(customDim: string): void;
    }
}

export {};
