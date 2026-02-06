/**
 * Abrantes Hotjar plugin - Hotjar integration
 * TypeScript type definitions
 */

import Abrantes from "../Abrantes";

/** Hotjar plugin settings */
interface HotjarSettings {
    /** Events that trigger the Hotjar event (e.g., cookie acceptance events) */
    triggerEvents: string[];
}

declare module "../Abrantes" {
    interface AbrantesSettings {
        hotjar: HotjarSettings;
    }

    interface Abrantes {
        /**
         * Sets up listeners to send test data to Hotjar as an event
         */
        hotjar(): void;
    }
}

export {};
